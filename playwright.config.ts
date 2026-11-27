import { defineConfig, devices } from '@playwright/test';

// Os testes rodam contra a pasta `build/` (rode `pnpm build` antes), servida por um servidor
// estático estrito (scripts/serve-build.ts) — não pelo dev server nem pelo `vite preview`, que
// resolve URLs sem extensão e esconderia links que quebram em hospedagens estáticas simples.
//
// PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH permite usar um Chromium já instalado no ambiente
// (por exemplo, em contêineres de desenvolvimento) em vez do baixado pelo Playwright.
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
// Mesmo subcaminho usado no build (BASE_PATH), para testar o artefato exatamente como será publicado.
const base = process.env.BASE_PATH ?? '';
const chromiumLaunch = chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {};

export default defineConfig({
	testDir: 'tests/e2e',
	testMatch: '**/*.e2e.ts',
	forbidOnly: !!process.env.CI,
	retries: 0,
	reporter: process.env.CI ? [['list'], ['github']] : 'list',
	use: {
		baseURL: `http://localhost:4173${base}/`,
		trace: 'off',
		// Os testes rodam sem service worker, para não dependerem de instalação em segundo plano;
		// a suíte de uso sem internet (offline.e2e.ts) o liga (ADR-0005).
		serviceWorkers: 'block'
	},
	webServer: {
		command: `node scripts/serve-build.ts 4173 ${base}`,
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'], ...chromiumLaunch } },
		{ name: 'chromium-movel', use: { ...devices['Pixel 7'], ...chromiumLaunch } },
		{ name: 'firefox', use: { ...devices['Desktop Firefox'] } },
		{ name: 'webkit', use: { ...devices['Desktop Safari'] } },
		{ name: 'webkit-movel', use: { ...devices['iPhone 13'] } }
	]
});
