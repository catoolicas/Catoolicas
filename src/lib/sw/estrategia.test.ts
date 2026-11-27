import { describe, expect, it } from 'vitest';
import { cacheAntigo, caminhosAbsolutos, estrategia, nomeDoCache } from './estrategia.ts';

const SW = 'https://exemplo.org/Catoolicas/service-worker.js';
const ORIGEM = 'https://exemplo.org';
const listas = {
	imutaveis: new Set(caminhosAbsolutos(['_app/immutable/entry/app.abc123.js'], SW)),
	paginas: new Set(caminhosAbsolutos(['', 'exame/', 'terco/gozosos/', 'robots.txt'], SW))
};
const get = (url: string, mode?: string) => ({ method: 'GET', url, mode });

describe('estratégia do service worker', () => {
	it('converte os caminhos do manifesto a partir da pasta do service worker (com subcaminho)', () => {
		expect([...listas.paginas]).toEqual([
			'/Catoolicas/',
			'/Catoolicas/exame/',
			'/Catoolicas/terco/gozosos/',
			'/Catoolicas/robots.txt'
		]);
	});

	it('arquivos imutáveis do build: cache primeiro', () => {
		const url = `${ORIGEM}/Catoolicas/_app/immutable/entry/app.abc123.js`;
		expect(estrategia(get(url), ORIGEM, listas)).toEqual({ tipo: 'cache-primeiro' });
	});

	it('páginas e arquivos estáticos conhecidos: rede primeiro, com a página como chave', () => {
		for (const caminho of ['/Catoolicas/', '/Catoolicas/exame/', '/Catoolicas/robots.txt'])
			expect(estrategia(get(`${ORIGEM}${caminho}`), ORIGEM, listas)).toEqual({
				tipo: 'rede-primeiro',
				chave: caminho
			});
	});

	it('navegação com parâmetros usa a página guardada; outros pedidos com parâmetros, não', () => {
		const url = `${ORIGEM}/Catoolicas/exame/?fbclid=x`;
		expect(estrategia(get(url, 'navigate'), ORIGEM, listas)).toEqual({
			tipo: 'rede-primeiro',
			chave: '/Catoolicas/exame/'
		});
		expect(estrategia(get(url), ORIGEM, listas)).toEqual({ tipo: 'ignorar' });
	});

	it('navegação sem a barra final é redirecionada para a página com barra', () => {
		expect(estrategia(get(`${ORIGEM}/Catoolicas/exame?a=1`, 'navigate'), ORIGEM, listas)).toEqual({
			tipo: 'redirecionar',
			para: `${ORIGEM}/Catoolicas/exame/?a=1`
		});
		// Fora da navegação, ou se a página com barra não existe, não interfere.
		expect(estrategia(get(`${ORIGEM}/Catoolicas/exame`), ORIGEM, listas)).toEqual({
			tipo: 'ignorar'
		});
		expect(estrategia(get(`${ORIGEM}/Catoolicas/nada`, 'navigate'), ORIGEM, listas)).toEqual({
			tipo: 'ignorar'
		});
	});

	it('ignora outro método, outra origem, caminho fora da lista e version.json', () => {
		const ignorar = { tipo: 'ignorar' };
		expect(
			estrategia({ method: 'POST', url: `${ORIGEM}/Catoolicas/exame/` }, ORIGEM, listas)
		).toEqual(ignorar);
		expect(estrategia(get('https://outro.org/Catoolicas/exame/'), ORIGEM, listas)).toEqual(ignorar);
		expect(estrategia(get(`${ORIGEM}/Catoolicas/nao-existe/`), ORIGEM, listas)).toEqual(ignorar);
		expect(estrategia(get(`${ORIGEM}/Catoolicas/_app/version.json`), ORIGEM, listas)).toEqual(
			ignorar
		);
	});

	it('só apaga caches antigos deste site, nunca de outros sites da mesma origem', () => {
		const atual = nomeDoCache('124');
		expect(cacheAntigo(nomeDoCache('123'), atual)).toBe(true);
		expect(cacheAntigo(atual, atual)).toBe(false);
		expect(cacheAntigo('outro-site-v1', atual)).toBe(false);
		expect(cacheAntigo('workbox-precache-v2', atual)).toBe(false);
	});
});
