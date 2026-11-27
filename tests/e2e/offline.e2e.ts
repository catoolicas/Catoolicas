import { expect, test, type Page } from '@playwright/test';
import { SECOES } from '../../content/exame/secoes.ts';

// Uso sem internet (ADR-0005): depois da primeira visita a uma página com JavaScript, o service
// worker guarda as páginas e os arquivos do site, e tudo funciona em modo avião.

test.use({ serviceWorkers: 'allow' });

const PAGINAS = ['./', './sobre/', './terco/', './terco/gozosos/', './terco/rosario/', './exame/'];
const PERGUNTA = SECOES[0]?.itens[0]?.pergunta ?? '';

/** Primeira visita: espera o service worker instalar (guardar tudo) e ficar ativo. */
async function instalar(page: Page) {
	await page.goto('./terco/');
	await page.evaluate(async () => {
		const registro = await navigator.serviceWorker.ready;
		if (!registro.active) throw new Error('service worker sem ativar');
	});
}

test.describe('uso sem internet', () => {
	test('depois da primeira visita, todas as páginas abrem e funcionam em modo avião', async ({
		page,
		context
	}) => {
		const erros: string[] = [];
		page.on('pageerror', (e) => erros.push(e.message));
		await instalar(page);
		await context.setOffline(true);

		for (const caminho of PAGINAS) {
			const resposta = await page.goto(caminho);
			expect(resposta?.ok(), caminho).toBe(true);
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

	test('no Exame, com o service worker ativo, marcar não faz requisição nem muda o cache', async ({
		page
	}) => {
		await instalar(page);
		await page.goto('./exame/');
		await expect(page.locator('.exame[data-hidratado]')).toBeAttached();
		await page.waitForLoadState('networkidle');

		const retratoDoCache = () =>
			page.evaluate(async () => {
				const nomes = await caches.keys();
				const entradas = await Promise.all(
					nomes.map(async (n) => (await (await caches.open(n)).keys()).map((r) => r.url).sort())
				);
				return { nomes, entradas };
			});
		const antes = await retratoDoCache();
		const requisicoes: string[] = [];
		page.on('request', (r) => requisicoes.push(r.url()));

		await page.getByRole('checkbox', { name: PERGUNTA, exact: true }).check();
		await page.getByRole('textbox', { name: /^Quantas vezes/ }).fill('umas 3');
		await page.waitForTimeout(300);

		expect(requisicoes).toEqual([]);
		expect(await retratoDoCache()).toEqual(antes);
		// Nada do que foi escrito está em nenhuma entrada guardada.
		expect(JSON.stringify(antes)).not.toContain('umas');
	});
});
