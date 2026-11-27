import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { SECOES } from '../../content/exame/secoes.ts';

// Uso sem internet (ADR-0005): depois da primeira visita ao Terço, o service worker guarda as
// páginas e os arquivos do site, e tudo funciona em modo avião.

test.use({ serviceWorkers: 'allow' });

const PAGINAS = ['./', './sobre/', './terco/', './terco/gozosos/', './terco/rosario/', './exame/'];
const PERGUNTA = SECOES[0]?.itens[0]?.pergunta ?? '';

/**
 * Primeira visita ao Terço: espera o service worker instalar (guardar tudo) e ficar ativo. No
 * Chromium tem de funcionar; em outro navegador que não o aceite, o teste é pulado com o motivo.
 */
async function instalar(page: Page, browserName: string) {
	await page.goto('./terco/');
	const ativo = await page.evaluate(async () => {
		const prazo = new Promise<false>((r) => setTimeout(() => r(false), 15_000));
		const pronto = navigator.serviceWorker.ready.then((r) => Boolean(r.active));
		return Promise.race([pronto, prazo]);
	});
	if (!ativo && browserName !== 'chromium')
		test.skip(true, `service worker não ficou ativo em ${browserName}`);
	expect(ativo).toBe(true);
}

/** Modo avião de verdade: nem a página nem o próprio service worker alcançam a rede. */
async function desligarRede(context: BrowserContext) {
	await context.setOffline(true);
	await context.route('**', (rota) => rota.abort('internetdisconnected'));
}

test.describe('uso sem internet', () => {
	test('depois da primeira visita ao Terço, as páginas abrem e funcionam em modo avião', async ({
		page,
		context,
		browserName
	}) => {
		const erros: string[] = [];
		page.on('pageerror', (e) => erros.push(e.message));
		await instalar(page, browserName);
		await desligarRede(context);

		for (const caminho of PAGINAS) {
			const resposta = await page.goto(caminho);
			expect(resposta?.ok(), caminho).toBe(true);
			// Veio mesmo do service worker (e não de uma rede que ainda funcionasse).
			expect(resposta?.fromServiceWorker(), caminho).toBe(true);
			await expect(page.locator('h1')).toHaveCount(1);
		}

		// Terço: uma série, com o conteúdo carregado sob demanda.
		await page.goto('./terco/gozosos/');
		await expect(page.locator('[data-hidratado]')).toBeAttached();
		const titulo = page.locator('#titulo-passo');
		const antes = await titulo.textContent();
		await page.getByRole('button', { name: 'Próximo', exact: true }).click();
		await expect(titulo).not.toHaveText(antes ?? '');

		// Exame: marcar e ver a lista.
		await page.goto('./exame/');
		await expect(page.locator('.exame[data-hidratado]')).toBeAttached();
		await page.getByRole('checkbox', { name: PERGUNTA, exact: true }).check();
		await expect(page.locator('.resumo li')).toHaveCount(1);

		expect(erros).toEqual([]);
	});

	test('sem internet, links com parâmetros e endereços sem a barra final também abrem', async ({
		page,
		context,
		browserName
	}) => {
		await instalar(page, browserName);
		await desligarRede(context);

		const comParametro = await page.goto('./exame/?fbclid=teste');
		expect(comParametro?.ok()).toBe(true);
		await expect(page.locator('.exame[data-hidratado]')).toBeAttached();

		await page.goto('./terco');
		await expect(page).toHaveURL(/\/terco\/$/);
		await expect(page.locator('h1')).toHaveText('Terço');
	});

	test('no Exame, com o service worker ativo, marcar e escrever não faz requisição nem muda o cache', async ({
		page,
		context,
		browserName
	}) => {
		await instalar(page, browserName);
		await page.goto('./exame/');
		await expect(page.locator('.exame[data-hidratado]')).toBeAttached();
		await page.waitForLoadState('networkidle');

		// Nomes, endereços e um resumo do conteúdo de cada resposta guardada.
		const retratoDoCache = () =>
			page.evaluate(async () => {
				const resumo = async (r: Response) => {
					const bytes = await crypto.subtle.digest('SHA-256', await r.arrayBuffer());
					return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
				};
				const retrato: Record<string, Record<string, string>> = {};
				for (const nome of await caches.keys()) {
					const cache = await caches.open(nome);
					retrato[nome] = {};
					for (const pedido of await cache.keys()) {
						const resposta = await cache.match(pedido);
						if (resposta) retrato[nome][pedido.url] = await resumo(resposta);
					}
				}
				return retrato;
			});
		const antes = await retratoDoCache();
		expect(Object.keys(antes).length).toBeGreaterThan(0);

		// No contexto aparecem também os pedidos feitos pelo próprio service worker.
		const requisicoes: string[] = [];
		context.on('request', (r) => requisicoes.push(r.url()));

		await page.getByRole('checkbox', { name: PERGUNTA, exact: true }).check();
		await page.getByRole('textbox', { name: /^Quantas vezes/ }).fill('umas 3');
		await page.getByRole('textbox', { name: /^Tempo desde/ }).fill('dois meses');
		await page.waitForTimeout(500);

		expect(requisicoes).toEqual([]);
		expect(await retratoDoCache()).toEqual(antes);
	});

	test('abrir só o Exame não registra service worker (a página mantém worker-src none)', async ({
		page
	}) => {
		await page.goto('./exame/');
		await expect(page.locator('.exame[data-hidratado]')).toBeAttached();
		await page.waitForLoadState('load');
		await page.waitForTimeout(1000);
		expect(
			await page.evaluate(() => navigator.serviceWorker.getRegistrations().then((r) => r.length))
		).toBe(0);
	});
});
