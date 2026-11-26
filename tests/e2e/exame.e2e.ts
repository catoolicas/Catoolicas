import { expect, test, type Page, type Request } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { ATOS } from '../../content/exame/atos.ts';
import { TEXTOS } from '../../content/exame/interface.ts';
import { ROTEIRO } from '../../content/exame/orientacoes.ts';
import { ITENS_RASCUNHO, SECOES_RASCUNHO } from '../../content/exame/rascunhos.ts';
import { SECOES } from '../../content/exame/secoes.ts';
import type { ItemExame, SecaoExame } from '../../src/lib/modules/exame/domain/tipos.ts';
import { CAMPO_PRIVADO } from '../../src/lib/modules/exame/ui/campos.ts';

// Suíte de privacidade do Exame de consciência (ADR-0004). Mede no navegador o que a página
// realmente faz: nenhuma requisição, nenhum armazenamento, nada na URL, no título ou no histórico,
// nada que sobreviva a apagar, sair, voltar ou recarregar.

const EXAME = './exame/';
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

function exigir<T>(valor: T | undefined, nome: string): T {
	if (valor === undefined) throw new Error(`conteúdo do exame sem ${nome}`);
	return valor;
}

const itens: readonly ItemExame[] = SECOES.flatMap((s) => [...s.itens]);
const GRAVE = exigir(
	itens.find((i) => i.grave),
	'item grave'
);
const LEVE = exigir(
	itens.find((i) => !i.grave),
	'item leve'
);
const ATO_SENHOR = exigir(
	ATOS.find((a) => a.id === 'contricao-senhor'),
	'ato "Senhor meu Jesus Cristo"'
);

/** Abre o exame e espera a hidratação (antes dela, marcar não atualiza a lista). */
async function abrir(page: Page) {
	await page.goto(EXAME);
	await expect(page.locator('.exame[data-hidratado]')).toBeAttached();
}

const caixa = (page: Page, pergunta: string) =>
	page.getByRole('checkbox', { name: pergunta, exact: true });
const campoVezes = (page: Page) =>
	page.getByRole('textbox', { name: new RegExp(`^${TEXTOS.rotuloVezes}`) });
const campoUltima = (page: Page) =>
	page.getByRole('textbox', { name: /^Tempo desde a última confissão/ });
const seletorAto = (page: Page) => page.getByRole('combobox', { name: /na lista$/ });
const resumo = (page: Page) => page.locator('.resumo');

/** Marca um item grave (com "quantas vezes"), um leve, a última confissão e outro ato. */
async function preencher(page: Page) {
	await caixa(page, GRAVE.pergunta).check();
	await campoVezes(page).fill('umas 3');
	await caixa(page, LEVE.pergunta).check();
	await campoUltima(page).fill('dois meses');
	await seletorAto(page).selectOption(ATO_SENHOR.id);
	await expect(resumo(page)).toContainText(GRAVE.acusacao);
}

/** Confere que nada do que foi preenchido continua na página. */
async function esperarVazio(page: Page) {
	await expect(page.locator('.exame input[type="checkbox"]:checked')).toHaveCount(0);
	await expect(campoVezes(page)).toHaveCount(0);
	await expect(campoUltima(page)).toHaveValue('');
	await expect(seletorAto(page)).toHaveValue('contricao');
	await expect(resumo(page)).toContainText(ROTEIRO.nenhumItem);
	await expect(resumo(page)).not.toContainText('umas 3');
	await expect(resumo(page)).not.toContainText('dois meses');
}

/** Tudo o que o navegador poderia guardar ou expor fora da memória da página. */
function retrato(page: Page) {
	return page.evaluate(async () => ({
		url: location.href,
		titulo: document.title,
		historico: history.length,
		estadoDoHistorico: JSON.stringify(history.state),
		nomeDaJanela: window.name,
		cookies: document.cookie,
		local: localStorage.length,
		sessao: sessionStorage.length,
		caches: 'caches' in globalThis ? (await caches.keys()).length : 0,
		bancos: 'databases' in indexedDB ? (await indexedDB.databases()).length : 0,
		workers: navigator.serviceWorker ? (await navigator.serviceWorker.getRegistrations()).length : 0
	}));
}

/** Impede a janela de impressão de abrir e conta as chamadas. */
async function interceptarImpressao(page: Page) {
	await page.evaluate(() => {
		const w = window as unknown as { print: () => void; impressoes: number };
		w.impressoes = 0;
		w.print = () => {
			w.impressoes++;
		};
	});
}

test.describe('Exame — privacidade', () => {
	test('nenhuma requisição e nada guardado enquanto se marca, digita e imprime', async ({
		page
	}) => {
		await abrir(page);
		await page.waitForLoadState('networkidle');
		const antes = await retrato(page);

		const requisicoes: string[] = [];
		const registrar = (r: Request) => requisicoes.push(`${r.method()} ${r.url()}`);
		page.on('request', registrar);

		await preencher(page);
		// Passar o mouse nos links não pode pré-carregar nada (todos recarregam a página).
		for (const link of await page
			.getByRole('navigation', { name: 'Principal' })
			.getByRole('link')
			.all())
			await link.hover();
		await page.locator('.exame details summary').first().click();
		await interceptarImpressao(page);
		await page.getByRole('button', { name: 'Imprimir' }).click();
		await page.emulateMedia({ media: 'print' });
		await page.emulateMedia({ media: 'screen' });
		await page.waitForTimeout(300);

		page.off('request', registrar);
		expect(requisicoes).toEqual([]);
		expect(await retrato(page)).toEqual(antes);
	});

	test('a política da página bloqueia qualquer conexão, mesmo forçada', async ({ page }) => {
		await abrir(page);
		await page.waitForLoadState('networkidle');
		const requisicoes: string[] = [];
		page.on('request', (r) => requisicoes.push(`${r.method()} ${r.url()}`));

		const resultado = await page.evaluate(async () => {
			const violacoes: string[] = [];
			document.addEventListener('securitypolicyviolation', (e) =>
				violacoes.push(e.effectiveDirective)
			);
			const busca = await fetch('./?vazou=1', { method: 'POST', body: 'dados' }).then(
				() => 'passou',
				() => 'bloqueada'
			);
			try {
				navigator.sendBeacon('./?vazou=2', 'dados');
			} catch {
				// alguns navegadores lançam exceção em vez de só bloquear
			}
			await new Promise((r) => setTimeout(r, 300));
			return { busca, violacoes };
		});

		expect(resultado.busca).toBe('bloqueada');
		expect(resultado.violacoes).toContain('connect-src');
		expect(requisicoes.filter((r) => r.includes('vazou'))).toEqual([]);
	});

	test('campos: atributos de privacidade no HTML e no DOM, sem name e sem form', async ({
		page
	}) => {
		// Já no HTML pré-renderizado, antes de qualquer restauração de formulário pelo navegador.
		const html = await (await page.request.get(EXAME)).text();
		const campos = html.match(/<(input|select|textarea)\b[^>]*>/g) ?? [];
		expect(campos.length).toBeGreaterThan(itens.length);
		for (const campo of campos) {
			expect(campo, campo).toContain('autocomplete="off"');
			expect(campo, campo).not.toMatch(/\sname=/);
		}
		expect(html).not.toMatch(/<form\b/);

		await abrir(page);
		await caixa(page, GRAVE.pergunta).check(); // faz aparecer o campo "quantas vezes"
		const atributos = await page.locator('.exame :is(input, select, textarea)').evaluateAll((els) =>
			els.map((el) => ({
				attrs: Object.fromEntries([...el.attributes].map((a) => [a.name, a.value])),
				tipo: el.tagName.toLowerCase() + ':' + (el.getAttribute('type') ?? '')
			}))
		);
		expect(atributos.length).toBeGreaterThan(itens.length);
		for (const { attrs, tipo } of atributos) {
			for (const [nome, valor] of Object.entries(CAMPO_PRIVADO))
				expect(attrs[nome], `${tipo} ${nome}`).toBe(valor);
			expect(attrs.name, tipo).toBeUndefined();
		}
		await expect(page.locator('form')).toHaveCount(0);
	});

	test('"Apagar tudo agora" zera marcações, campos e lista, e avisa', async ({ page }) => {
		await abrir(page);
		await preencher(page);
		await page.getByRole('button', { name: 'Apagar tudo agora' }).click();
		await esperarVazio(page);
		await expect(page.getByRole('status')).toHaveText('Tudo foi apagado.');
	});

	test('recarregar a página não restaura nada', async ({ page }) => {
		await abrir(page);
		await preencher(page);
		await page.reload();
		await expect(page.locator('.exame[data-hidratado]')).toBeAttached();
		await esperarVazio(page);
	});

	test('valores que o navegador restaurar nos campos antes da hidratação são descartados', async ({
		page
	}) => {
		// Simula a restauração de formulário (Firefox ao recarregar, por exemplo): enquanto o HTML
		// ainda está sendo lido, todo campo recebe um valor. O estado da página tem de prevalecer.
		await page.addInitScript(() => {
			const vistos = new WeakSet<Element>();
			const observador = new MutationObserver(() => {
				if (document.readyState !== 'loading') return observador.disconnect();
				for (const el of document.querySelectorAll('input')) {
					if (vistos.has(el)) continue;
					vistos.add(el);
					if (el.type === 'checkbox') el.checked = true;
					else el.value = 'restaurado';
				}
				// As opções chegam aos poucos: a cada leitura, escolhe a última.
				for (const sel of document.querySelectorAll('select'))
					sel.selectedIndex = sel.options.length - 1;
			});
			observador.observe(document, { childList: true, subtree: true });
		});
		await abrir(page);
		await esperarVazio(page);
		await expect(page.locator('.exame input[type="text"]')).not.toHaveValue('restaurado');
	});

	test('sair por um link recarrega a página, e voltar pelo histórico não restaura nada', async ({
		page
	}) => {
		await abrir(page);
		await preencher(page);
		await page.evaluate(() => ((window as unknown as { marca: number }).marca = 1));

		await page
			.getByRole('navigation', { name: 'Principal' })
			.getByRole('link', { name: 'Terço' })
			.click();
		await expect(page).toHaveURL(/\/terco\/$/);
		// Carga completa: a memória da página do exame foi descartada.
		expect(
			await page.evaluate(() => (window as unknown as { marca?: number }).marca)
		).toBeUndefined();

		await page.goBack();
		await expect(page).toHaveURL(/\/exame\/$/);
		await expect(page.locator('.exame[data-hidratado]')).toBeAttached();
		await esperarVazio(page);
	});

	test('entrar no exame por um link também recarrega a página', async ({ page }) => {
		await page.goto('./terco/');
		await expect(page.locator('[data-hidratado]')).toBeAttached();
		await page.evaluate(() => ((window as unknown as { marca: number }).marca = 1));
		await page
			.getByRole('navigation', { name: 'Principal' })
			.getByRole('link', { name: 'Exame' })
			.click();
		await expect(page.locator('.exame[data-hidratado]')).toBeAttached();
		expect(
			await page.evaluate(() => (window as unknown as { marca?: number }).marca)
		).toBeUndefined();
	});

	test('pagehide e a volta do cache de navegação (pageshow) zeram o estado', async ({ page }) => {
		await abrir(page);
		await preencher(page);
		await page.evaluate(() =>
			window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }))
		);
		await esperarVazio(page);

		await preencher(page);
		// Uma volta sem cache (persisted: false) é uma página nova: nada a fazer.
		await page.evaluate(() =>
			window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: false }))
		);
		await expect(resumo(page)).toContainText(GRAVE.acusacao);
		await page.evaluate(() =>
			window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
		);
		await esperarVazio(page);
	});
});

test.describe('Exame — funcionamento', () => {
	test('lista: graves primeiro, com "quantas vezes"; depois as outras; o ato escolhido', async ({
		page
	}) => {
		await abrir(page);
		await caixa(page, LEVE.pergunta).check();
		await caixa(page, GRAVE.pergunta).check();
		await campoVezes(page).fill('  umas 3  ');

		const titulos = resumo(page).locator('h3');
		await expect(titulos.nth(0)).toHaveText(ROTEIRO.tituloGraves);
		await expect(titulos.nth(1)).toHaveText(ROTEIRO.tituloOutras);
		await expect(resumo(page).locator('li').nth(0)).toHaveText(`${GRAVE.acusacao} — umas 3`);
		await expect(resumo(page).locator('li').nth(1)).toHaveText(LEVE.acusacao);

		await expect(resumo(page)).toContainText(ATOS.find((a) => a.id === 'contricao')?.texto ?? '');
		await seletorAto(page).selectOption(ATO_SENHOR.id);
		await expect(resumo(page)).toContainText(ATO_SENHOR.texto);

		// Desmarcar tira o item e o campo de "quantas vezes".
		await caixa(page, GRAVE.pergunta).uncheck();
		await expect(campoVezes(page)).toHaveCount(0);
		await expect(resumo(page)).not.toContainText(GRAVE.acusacao);
	});

	test('imprimir: só o título e a lista, sem sair da página', async ({ page }) => {
		await abrir(page);
		await preencher(page);
		await interceptarImpressao(page);
		await page.getByRole('button', { name: 'Imprimir' }).click();
		expect(
			await page.evaluate(() => (window as unknown as { impressoes: number }).impressoes)
		).toBe(1);

		await page.emulateMedia({ media: 'print' });
		await expect(page.locator('h1')).toBeVisible();
		await expect(resumo(page)).toBeVisible();
		await expect(page.getByText(TEXTOS.destruirFolha)).toBeVisible();
		for (const oculto of [
			page.locator('.cabecalho'),
			page.locator('.rodape'),
			page.locator('.privacidade'),
			page.locator('.secao').first(),
			page.getByRole('button', { name: 'Imprimir' }),
			page.getByText(TEXTOS.naoGravado)
		])
			await expect(oculto).toBeHidden();

		await page.emulateMedia({ media: 'screen' });
		await expect(page.getByText(TEXTOS.destruirFolha)).toBeHidden();
	});

	test('o site publicado não traz nenhum rascunho em revisão', async ({ page }) => {
		const secoesRascunho: readonly SecaoExame[] = SECOES_RASCUNHO;
		const itensRascunho: readonly ItemExame[] = ITENS_RASCUNHO;
		const emRevisao = [
			...secoesRascunho.filter((s) => s.status !== 'aprovado').map((s) => s.enunciado),
			...[...secoesRascunho.flatMap((s) => s.itens), ...itensRascunho]
				.filter((i) => i.status !== 'aprovado')
				.map((i) => i.pergunta)
		];
		expect(emRevisao.length).toBeGreaterThan(0);

		const corpos: Promise<string>[] = [];
		page.on('response', (r) => {
			if (/\.(js|html)$|\/$/.test(new URL(r.url()).pathname)) corpos.push(r.text());
		});
		await abrir(page);
		await page.waitForLoadState('networkidle');
		const tudo = (await Promise.all(corpos)).join('\n');
		expect(tudo).toContain(GRAVE.pergunta); // o conteúdo aprovado está lá
		for (const texto of emRevisao) expect(tudo, texto).not.toContain(texto);
		await expect(page.getByText('Rascunho em revisão')).toHaveCount(0);
	});

	test('teclado: Tab chega às caixas e o Espaço marca', async ({ page }) => {
		await abrir(page);
		const primeira = caixa(page, GRAVE.pergunta);
		await primeira.focus();
		await page.keyboard.press('Space');
		await expect(primeira).toBeChecked();
		await page.keyboard.press('Tab');
		await expect(campoVezes(page)).toBeFocused();
	});

	for (const esquema of ['light', 'dark'] as const) {
		test(`acessível com itens marcados (tema ${esquema})`, async ({ page }) => {
			await page.emulateMedia({ colorScheme: esquema });
			await abrir(page);
			await preencher(page);
			await page
				.locator('.exame details')
				.evaluateAll((ds) => ds.forEach((d) => ((d as HTMLDetailsElement).open = true)));
			const resultado = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
			expect(resultado.violations).toEqual([]);
		});
	}

	test('sem rolagem horizontal a 320 px, com itens marcados', async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 640 });
		await abrir(page);
		await preencher(page);
		const transborda = await page.evaluate(
			() => document.documentElement.scrollWidth > document.documentElement.clientWidth
		);
		expect(transborda).toBe(false);
	});
});
