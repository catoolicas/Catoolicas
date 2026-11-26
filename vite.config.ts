import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

// Arquitetura "estático primeiro" (docs/adr/0002-estatico-primeiro.md):
// toda rota é pré-renderizada; o build falha se alguma não puder ser (strict).
export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Força o modo runes no projeto, exceto em bibliotecas. Pode sair no Svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ strict: true }),
			// Subcaminho de publicação (por exemplo, `/Catoolicas` no GitHub Pages sem domínio próprio).
			// Vazio no desenvolvimento e nos testes locais; o workflow de publicação define BASE_PATH.
			paths: { base: (process.env.BASE_PATH ?? '') as '' | `/${string}` },
			// Em páginas pré-renderizadas a CSP vai numa <meta http-equiv>; nesse caso
			// frame-ancestors, report-uri e sandbox são ignorados e devem vir por cabeçalho
			// do host (ver docs/adr/0002-estatico-primeiro.md).
			csp: {
				mode: 'hash',
				directives: {
					'default-src': ['self'],
					'script-src': ['self'],
					'style-src': ['self'],
					'img-src': ['self'],
					'font-src': ['self'],
					'connect-src': ['self'],
					'object-src': ['none'],
					'base-uri': ['self'],
					'form-action': ['self']
				}
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: [
						'src/**/*.{test,spec}.{js,ts}',
						'scripts/**/*.{test,spec}.{js,ts}',
						'content/**/*.{test,spec}.{js,ts}'
					],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
