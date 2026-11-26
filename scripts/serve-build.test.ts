import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { resolverArquivo } from './serve-build.ts';

describe('resolverArquivo', () => {
	let raiz = '';

	beforeAll(() => {
		raiz = mkdtempSync(join(tmpdir(), 'serve-build-'));
		writeFileSync(join(raiz, 'index.html'), 'inicio');
		mkdirSync(join(raiz, 'sobre'));
		writeFileSync(join(raiz, 'sobre', 'index.html'), 'sobre');
		writeFileSync(join(raiz, 'favicon.svg'), '<svg/>');
	});

	it('serve index.html para caminhos com barra final', () => {
		expect(resolverArquivo(raiz, '/')).toBe(join(raiz, 'index.html'));
		expect(resolverArquivo(raiz, '/sobre/')).toBe(join(raiz, 'sobre', 'index.html'));
	});

	it('serve arquivos pelo caminho exato, ignorando query e fragmento', () => {
		expect(resolverArquivo(raiz, '/favicon.svg?v=1#x')).toBe(join(raiz, 'favicon.svg'));
	});

	it('não adivinha: diretório sem barra final e URL sem extensão dão 404', () => {
		expect(resolverArquivo(raiz, '/sobre')).toBeNull();
		expect(resolverArquivo(raiz, '/favicon')).toBeNull();
	});

	it('não permite sair da raiz', () => {
		expect(resolverArquivo(raiz, '/../etc/passwd')).toBeNull();
		expect(resolverArquivo(raiz, '/%2e%2e/%2e%2e/etc/passwd')).toBeNull();
		expect(resolverArquivo(raiz, '/sobre/..%2f..%2fetc%2fpasswd')).toBeNull();
	});

	it('recusa caminhos malformados', () => {
		expect(resolverArquivo(raiz, '/%E0%A4%A')).toBeNull();
		expect(resolverArquivo(raiz, '/index.html%00.txt')).toBeNull();
	});
});
