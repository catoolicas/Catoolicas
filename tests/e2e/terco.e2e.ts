import { gzipSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const GOZOSOS = './terco/gozosos/';
/** Passos do terço com os padrões da origem: abertura 9, 5 dezenas × 16, oração final 1, fecho 5. */
const PASSOS_TERCO = 95;

/** Abre a página e espera a hidratação (antes dela, os botões ainda não respondem). */
async function abrir(page: Page, caminho: string) {
	await page.goto(caminho);
	await expect(page.locator('[data-hidratado]')).toBeAttached();
}

const titulo = (page: Page) => page.locator('#titulo-passo');
const proximo = (page: Page) => page.getByRole('button', { name: 'Próximo', exact: true });

async function abrirPreferencias(page: Page) {
	await page.getByRole('button', { name: 'Preferências' }).click();
	await expect(page.getByRole('dialog', { name: 'Preferências' })).toBeVisible();
}

async function fecharDialogo(page: Page) {
	await page.getByRole('dialog').getByRole('button', { name: 'Fechar' }).click();
	await expect(page.getByRole('dialog')).toBeHidden();
}

test.describe('Terço', () => {
	test('reza o terço inteiro só com o teclado, e volta ao início', async ({ page }) => {
		await abrir(page, GOZOSOS);
		await expect(titulo(page)).toHaveText('Sinal da Cruz');

		for (let i = 1; i < PASSOS_TERCO; i++) await page.keyboard.press('ArrowRight');
		await expect(titulo(page)).toHaveText('Oração do Anjo — «Meu Deus, eu creio»');
		await expect(page.getByText('Fim do terço.')).toBeVisible();
		await expect(page.getByText('Ave-Marias: 50 de 50')).toBeVisible();

		await page.keyboard.press('ArrowRight');
		await expect(titulo(page)).toHaveText('Oração do Anjo — «Meu Deus, eu creio»');

		await page.keyboard.press('Home');
		await expect(titulo(page)).toHaveText('Sinal da Cruz');
		await page.keyboard.press('ArrowDown');
		await expect(page.locator('.rotulo').first()).toHaveText('1º mistério gozoso');
		await page.keyboard.press('ArrowDown');
		await expect(page.locator('.rotulo').first()).toHaveText('2º mistério gozoso');
		await page.keyboard.press('ArrowUp');
		await expect(page.locator('.rotulo').first()).toHaveText('1º mistério gozoso');
	});

	test('reza o terço inteiro só com toque (ou clique) no botão Próximo', async ({ page }) => {
		const toque = test.info().project.use.hasTouch === true;
		await abrir(page, GOZOSOS);
		for (let i = 1; i < PASSOS_TERCO; i++) {
			if (toque) await proximo(page).tap();
			else await proximo(page).click();
		}
		await expect(page.getByText('Fim do terço.')).toBeVisible();
		await expect(page.getByText('Ave-Marias: 50 de 50')).toBeVisible();
	});

	test('anuncia cada passo numa região aria-live', async ({ page }) => {
		await abrir(page, GOZOSOS);
		const regiao = page.locator('[aria-live="polite"][aria-atomic="true"]');
		await expect(regiao).toHaveText('');
		await page.keyboard.press('ArrowDown');
		await expect(regiao).toContainText('1º mistério gozoso:');
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowRight');
		await expect(regiao).toHaveText('1º mistério gozoso, Ave-Maria 1 de 10');
	});

	test('atalhos de uma tecla podem ser desligados; as setas continuam', async ({ page }) => {
		await abrir(page, GOZOSOS);
		await page.keyboard.press('j');
		await expect(titulo(page)).toHaveText('Oferecimento inicial');
		await page.keyboard.press('k');
		await expect(titulo(page)).toHaveText('Sinal da Cruz');

		await abrirPreferencias(page);
		await page.getByLabel(/Atalhos de uma tecla/).uncheck();
		await fecharDialogo(page);
		// Ao fechar, o foco volta ao botão "Preferências"; Espaço nele o reabriria (comportamento
		// nativo do botão). Tira-se o foco para testar só os atalhos.
		await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

		await page.keyboard.press('j');
		await page.keyboard.press(' ');
		await expect(titulo(page)).toHaveText('Sinal da Cruz');
		await page.keyboard.press('ArrowRight');
		await expect(titulo(page)).toHaveText('Oferecimento inicial');
	});

	test('mostra as orações em latim, com lang="la" e o aviso de tradução não oficial', async ({
		page
	}) => {
		await abrir(page, GOZOSOS);
		await abrirPreferencias(page);
		await page.getByRole('radio', { name: 'Latim' }).check();
		await fecharDialogo(page);

		await expect(titulo(page)).toHaveText('Signum Crucis');
		await expect(titulo(page)).toHaveAttribute('lang', 'la');
		await page.keyboard.press('ArrowRight');
		await expect(titulo(page)).toHaveText('Oblatio initialis');
		await expect(page.getByText('(tradução não oficial)')).toBeVisible();
	});

	test('nada é gravado só por abrir a página', async ({ page }) => {
		await abrir(page, GOZOSOS);
		expect(await page.evaluate(() => localStorage.length)).toBe(0);
	});

	test('progresso e preferências sobrevivem ao recarregamento; "Apagar dados" limpa tudo', async ({
		page
	}) => {
		await abrir(page, GOZOSOS);
		for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
		const antes = await titulo(page).textContent();
		await abrirPreferencias(page);
		await page.getByLabel(/Mostrar o texto completo/).uncheck();
		await fecharDialogo(page);

		await page.reload();
		await expect(page.locator('[data-hidratado]')).toBeAttached();
		await expect(titulo(page)).toHaveText(antes ?? '');
		await expect(page.getByRole('button', { name: 'Texto das orações' })).toHaveAttribute(
			'aria-pressed',
			'false'
		);

		await abrirPreferencias(page);
		await page.getByRole('button', { name: 'Apagar dados deste aparelho' }).click();
		await expect(page.getByText('Dados apagados.')).toBeVisible();
		await fecharDialogo(page);
		expect(await page.evaluate(() => localStorage.length)).toBe(0);
		await expect(titulo(page)).toHaveText('Sinal da Cruz');
	});

	test('Esc volta ao menu do Terço', async ({ page }) => {
		await abrir(page, GOZOSOS);
		await page.keyboard.press('Escape');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terço');
	});

	test('rosário inteiro: 20 dezenas e 200 Ave-Marias', async ({ page }) => {
		await abrir(page, './terco/rosario/');
		await page.keyboard.press('End');
		await expect(page.getByText('Ave-Marias: 200 de 200')).toBeVisible();
		await page.keyboard.press('Home');
		for (let d = 1; d <= 6; d++) await page.keyboard.press('ArrowDown');
		await expect(page.locator('.rotulo').first()).toHaveText('1º mistério luminoso');
	});
});

test.describe('Terço de hoje', () => {
	test('usa a data do visitante e o esquema escolhido', async ({ page }) => {
		// 26/11/2026, quinta-feira (meio-dia UTC: quinta em qualquer fuso de −9 h a +9 h).
		await page.clock.setFixedTime(new Date(Date.UTC(2026, 10, 26, 12, 0)));
		await page.goto('./terco/');
		const comecar = page.getByRole('link', { name: /Começar o terço de hoje/ });
		await expect(comecar).toHaveText('Começar o terço de hoje: Mistérios Luminosos');
		await expect(comecar).toHaveAttribute('href', /terco\/luminosos\/$/);

		await page.getByRole('radio', { name: /Esquema de Montfort/ }).check();
		await expect(comecar).toHaveText('Começar o terço de hoje: Mistérios Gozosos');
		await page.reload();
		await expect(page.getByRole('link', { name: /Começar o terço de hoje/ })).toHaveText(
			'Começar o terço de hoje: Mistérios Gozosos'
		);

		await comecar.click();
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mistérios Gozosos');
	});
});

test.describe('Terço — qualidade', () => {
	const PAGINAS = ['./terco/', GOZOSOS, './terco/luminosos/', './terco/rosario/'];

	for (const caminho of PAGINAS) {
		test(`${caminho}: só a própria origem, sem erros, acessível nos dois temas e sem rolagem a 320 px`, async ({
			page,
			baseURL
		}) => {
			const origem = new URL(baseURL ?? 'http://localhost:4173').origin;
			const externas: string[] = [];
			const erros: string[] = [];
			page.on('request', (r) => {
				if (new URL(r.url()).origin !== origem) externas.push(r.url());
			});
			page.on('console', (m) => {
				if (m.type() === 'error') erros.push(m.text());
			});
			page.on('pageerror', (e) => erros.push(e.message));

			for (const esquema of ['light', 'dark'] as const) {
				await page.emulateMedia({ colorScheme: esquema });
				await page.goto(caminho);
				await page.waitForLoadState('networkidle');
				const axe = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
				expect(axe.violations, esquema).toEqual([]);
			}
			await page.setViewportSize({ width: 320, height: 640 });
			await page.goto(caminho);
			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth > document.documentElement.clientWidth
				)
			).toBe(false);
			expect(externas).toEqual([]);
			expect(erros).toEqual([]);
		});
	}

	test('diálogos de preferências e de atalhos são acessíveis', async ({ page }) => {
		await abrir(page, GOZOSOS);
		await abrirPreferencias(page);
		expect((await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()).violations).toEqual([]);
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).toBeHidden();
		await expect(titulo(page)).toBeVisible();

		await page.keyboard.press('?');
		await expect(page.getByRole('dialog', { name: 'Atalhos de teclado' })).toBeVisible();
		expect((await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()).violations).toEqual([]);
	});

	test('peso real de JS baixado (inclui o conteúdo carregado sob demanda)', async ({ page }) => {
		const LIMITES: Record<string, number> = {
			'./terco/': 50 * 1024,
			[GOZOSOS]: 70 * 1024,
			'./terco/rosario/': 90 * 1024
		};
		for (const [caminho, limite] of Object.entries(LIMITES)) {
			const corpos: Promise<Buffer>[] = [];
			const coletar = (r: import('@playwright/test').Response) => {
				if (r.url().endsWith('.js')) corpos.push(r.body());
			};
			page.on('response', coletar);
			await abrir(page, caminho);
			await page.waitForLoadState('networkidle');
			page.off('response', coletar);
			const total = (await Promise.all(corpos)).reduce(
				(soma, corpo) => soma + gzipSync(corpo, { level: 9 }).length,
				0
			);
			test.info().annotations.push({
				type: 'peso-js',
				description: `${caminho}: ${(total / 1024).toFixed(1)} KB gzip`
			});
			expect(total, caminho).toBeLessThanOrEqual(limite);
		}
	});
});
