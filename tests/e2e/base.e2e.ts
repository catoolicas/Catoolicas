import { expect, test, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const ROTAS = [
	{ caminho: './', h1: 'Catoolicas', linkAtual: 'Início' },
	{ caminho: './terco/', h1: 'Terço', linkAtual: 'Terço' },
	{ caminho: './sobre/', h1: 'Sobre o projeto', linkAtual: 'Sobre' }
] as const;

// Meta do projeto: WCAG 2.2 nível AA.
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Registra requisições a outras origens e erros de console/página (inclui violações de CSP). */
function vigiar(page: Page, origem: string) {
	const externas: string[] = [];
	const erros: string[] = [];
	page.on('request', (req) => {
		const url = new URL(req.url());
		if (url.protocol !== 'data:' && url.origin !== origem) externas.push(req.url());
	});
	page.on('console', (msg) => {
		if (msg.type() === 'error') erros.push(msg.text());
	});
	page.on('pageerror', (erro) => erros.push(erro.message));
	return { externas, erros };
}

for (const rota of ROTAS) {
	test.describe(`rota ${rota.caminho}`, () => {
		test('carrega só da própria origem, sem erros, cookies nem armazenamento', async ({
			page,
			baseURL
		}) => {
			const origem = new URL(baseURL ?? 'http://localhost:4173').origin;
			const { externas, erros } = vigiar(page, origem);

			const resposta = await page.goto(rota.caminho);
			expect(resposta?.ok()).toBe(true);
			await page.waitForLoadState('networkidle');

			expect(externas).toEqual([]);
			expect(erros).toEqual([]);
			const estado = await page.evaluate(() => ({
				cookies: document.cookie,
				local: localStorage.length,
				sessao: sessionStorage.length
			}));
			expect(estado).toEqual({ cookies: '', local: 0, sessao: 0 });
		});

		test('tem idioma, título, um único h1 e CSP restritiva', async ({ page }) => {
			const resposta = await page.goto(rota.caminho);
			if (!resposta) throw new Error(`sem resposta para ${rota.caminho}`);

			await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
			await expect(page).toHaveTitle(/\S/);
			await expect(page.locator('h1')).toHaveCount(1);
			await expect(page.locator('h1')).toHaveText(rota.h1);

			const html = await resposta.text();
			const csp =
				/<meta http-equiv="content-security-policy" content="([^"]+)"/i.exec(html)?.[1] ?? '';
			expect(csp).toContain("default-src 'self'");
			expect(csp).toContain("object-src 'none'");
			expect(csp).not.toContain('unsafe-inline');
			expect(csp).not.toContain('unsafe-eval');
		});

		test('marca o link da página atual na navegação', async ({ page }) => {
			await page.goto(rota.caminho);
			const atual = page
				.getByRole('navigation', { name: 'Principal' })
				.locator('[aria-current="page"]');
			await expect(atual).toHaveCount(1);
			await expect(atual).toHaveText(rota.linkAtual);
		});

		test('todos os links internos respondem 200 no servidor estático estrito', async ({
			page,
			baseURL
		}) => {
			const origem = new URL(baseURL ?? 'http://localhost:4173').origin;
			await page.goto(rota.caminho);
			const hrefs = await page
				.locator('a[href]')
				.evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).href));
			const internos = [...new Set(hrefs.map((h) => h.split('#')[0] ?? h))].filter(
				(h) => new URL(h).origin === origem
			);
			expect(internos.length).toBeGreaterThan(0);
			for (const url of internos) {
				const resposta = await page.request.get(url, { maxRedirects: 0 });
				expect(resposta.status(), url).toBe(200);
			}
		});

		for (const esquema of ['light', 'dark'] as const) {
			test(`sem violações automáticas de acessibilidade (tema ${esquema})`, async ({ page }) => {
				await page.emulateMedia({ colorScheme: esquema });
				await page.goto(rota.caminho);
				const resultado = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
				expect(resultado.violations).toEqual([]);
			});
		}

		test('não tem rolagem horizontal a 320 px de largura (reflow)', async ({ page }) => {
			await page.setViewportSize({ width: 320, height: 640 });
			await page.goto(rota.caminho);
			const transborda = await page.evaluate(
				() => document.documentElement.scrollWidth > document.documentElement.clientWidth
			);
			expect(transborda).toBe(false);
		});
	});
}

test('o link "pular para o conteúdo" é o primeiro foco e leva ao conteúdo principal', async ({
	page,
	browserName
}) => {
	await page.goto('./');
	const pular = page.getByRole('link', { name: 'Pular para o conteúdo' });

	await page.keyboard.press('Tab');
	// No WebKit, Tab pode não focar links (preferência do Safari); Alt+Tab foca.
	if (browserName === 'webkit' && !(await pular.evaluate((el) => el === document.activeElement))) {
		await page.keyboard.press('Alt+Tab');
	}
	await expect(pular).toBeFocused();
	await expect(pular).toBeInViewport();

	await page.keyboard.press('Enter');
	await expect(page.locator('#conteudo')).toBeFocused();
});
