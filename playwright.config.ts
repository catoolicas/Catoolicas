import { defineConfig, devices } from '@playwright/test';

// Os testes rodam contra o build de produção (`pnpm build` antes), nunca contra o dev server:
// é o mesmo artefato que será publicado e medido pelo orçamento de desempenho.
//
// PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH permite usar um Chromium já instalado no ambiente
// (por exemplo, em contêineres de desenvolvimento) em vez do baixado pelo Playwright.
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const chromiumLaunch = chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {};

export default defineConfig({
	testDir: 'tests/e2e',
	testMatch: '**/*.e2e.ts',
	forbidOnly: !!process.env.CI,
	retries: 0,
	reporter: process.env.CI ? [['list'], ['github']] : 'list',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'off'
	},
	webServer: {
		command: 'pnpm preview',
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
