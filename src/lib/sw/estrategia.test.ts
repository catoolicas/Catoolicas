import { describe, expect, it } from 'vitest';
import { caminhosAbsolutos, estrategia, nomeDoCache } from './estrategia.ts';

const SW = 'https://exemplo.org/Catoolicas/service-worker.js';
const ORIGEM = 'https://exemplo.org';
const listas = {
	imutaveis: new Set(caminhosAbsolutos(['_app/immutable/entry/app.abc123.js'], SW)),
	paginas: new Set(caminhosAbsolutos(['', 'exame/', 'terco/gozosos/', 'robots.txt'], SW))
};
const get = (url: string) => ({ method: 'GET', url });

describe('estratégia do service worker', () => {
	it('converte os caminhos do manifesto a partir do endereço do service worker (com subcaminho)', () => {
		expect([...listas.paginas]).toEqual([
			'/Catoolicas/',
			'/Catoolicas/exame/',
			'/Catoolicas/terco/gozosos/',
			'/Catoolicas/robots.txt'
		]);
	});

	it('arquivos imutáveis do build: cache primeiro', () => {
		expect(
			estrategia(get(`${ORIGEM}/Catoolicas/_app/immutable/entry/app.abc123.js`), ORIGEM, listas)
		).toBe('cache-primeiro');
	});

	it('páginas e arquivos estáticos conhecidos: rede primeiro (o cache só sem internet)', () => {
		for (const caminho of ['/Catoolicas/', '/Catoolicas/exame/', '/Catoolicas/robots.txt'])
			expect(estrategia(get(`${ORIGEM}${caminho}`), ORIGEM, listas)).toBe('rede-primeiro');
	});

	it('ignora o que não conhece: outro método, outra origem, parâmetros na URL, caminho fora da lista', () => {
		expect(estrategia({ method: 'POST', url: `${ORIGEM}/Catoolicas/exame/` }, ORIGEM, listas)).toBe(
			'ignorar'
		);
		expect(estrategia(get('https://outro.org/Catoolicas/exame/'), ORIGEM, listas)).toBe('ignorar');
		expect(estrategia(get(`${ORIGEM}/Catoolicas/exame/?x=1`), ORIGEM, listas)).toBe('ignorar');
		expect(estrategia(get(`${ORIGEM}/Catoolicas/nao-existe/`), ORIGEM, listas)).toBe('ignorar');
		expect(estrategia(get(`${ORIGEM}/Catoolicas/_app/version.json`), ORIGEM, listas)).toBe(
			'ignorar'
		);
	});

	it('o nome do cache muda a cada versão', () => {
		expect(nomeDoCache('123')).toBe('catoolicas-123');
		expect(nomeDoCache('124')).not.toBe(nomeDoCache('123'));
	});
});
