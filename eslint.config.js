import prettier from 'eslint-config-prettier';
import path from 'node:path';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import { ARQUIVOS_DO_EXAME, REGRAS_DE_PRIVACIDADE } from './scripts/eslint-privacidade.ts';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	// docs/ guarda ferramentas de registro (por exemplo, a importação da CHG-0002), não código do app.
	{ ignores: ['docs/**'] },
	js.configs.recommended,
	ts.configs.recommendedTypeChecked,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: {
			parserOptions: { projectService: true },
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',
			// Permite omitir campos com desestruturação: `({ campo, ...resto }) => resto`.
			'@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		}
	},
	{
		// Exame de consciência: nada sai da memória da página (docs/adr/0004-privacidade-exame.md).
		// Os testes unitários rodam no Node, não no navegador, e ficam de fora.
		files: ARQUIVOS_DO_EXAME,
		ignores: ['**/*.test.ts'],
		rules: REGRAS_DE_PRIVACIDADE
	}
);
