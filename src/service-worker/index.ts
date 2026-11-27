/**
 * Service worker do Catoolicas: o site funciona sem internet depois da primeira visita ao Terço
 * (ADR-0005). Registrado só pelas páginas do Terço (`src/routes/terco/+layout.svelte`); a página
 * do Exame mantém `worker-src 'none'`, mas também passa a abrir sem internet.
 *
 * Privacidade: guarda só os arquivos públicos do próprio site, listados no build, numa fotografia
 * fixa feita na instalação. Não vê nada do que a pessoa faz nas páginas (o Exame não faz
 * requisições depois de aberto), não guarda nada durante o uso, não envia nada a ninguém e não
 * registra nada.
 */
import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { self } from '$app/service-worker';
import { cacheAntigo, caminhosAbsolutos, estrategia, nomeDoCache } from '#lib/sw/estrategia.ts';

const CACHE = nomeDoCache(version);
const endereco = self.location.href;
const relativos = (lista: readonly { path: string }[]) => lista.map((x) => x.path);

const IMUTAVEIS = caminhosAbsolutos(relativos(immutable), endereco);
const PAGINAS = caminhosAbsolutos([...relativos(prerendered), ...relativos(assets)], endereco);
const listas = { imutaveis: new Set(IMUTAVEIS), paginas: new Set(PAGINAS) };

/** Tempo máximo de espera pela rede antes de usar a cópia guardada (conexão fraca). */
const PRAZO_DA_REDE_MS = 3000;

self.addEventListener('install', (evento) => {
	// `cache: 'reload'`: busca na rede, não no cache HTTP do navegador, para a fotografia ser toda
	// da mesma versão (uma página antiga em cache apontaria para arquivos que não existem mais).
	evento.waitUntil(
		caches
			.open(CACHE)
			.then((cache) =>
				cache.addAll([...IMUTAVEIS, ...PAGINAS].map((u) => new Request(u, { cache: 'reload' })))
			)
	);
});

self.addEventListener('activate', (evento) => {
	// Só caches de versões anteriores deste site: a origem pode ser de vários sites.
	evento.waitUntil(
		caches
			.keys()
			.then((nomes) =>
				Promise.all(nomes.filter((n) => cacheAntigo(n, CACHE)).map((n) => caches.delete(n)))
			)
	);
});

/** A cópia guardada desta versão, ou nada (inclusive se o cache estiver indisponível). */
async function guardada(chave: string): Promise<Response | undefined> {
	try {
		const cache = await caches.open(CACHE);
		return await cache.match(new URL(chave, self.location.origin).href);
	} catch {
		return undefined;
	}
}

async function cachePrimeiro(pedido: Request): Promise<Response> {
	return (await guardada(new URL(pedido.url).pathname)) ?? fetch(pedido);
}

async function redePrimeiro(pedido: Request, chave: string): Promise<Response> {
	const copia = guardada(chave);
	const rede = fetch(pedido);
	rede.catch(() => undefined); // a rede pode falhar depois de a cópia já ter sido entregue
	const prazo = new Promise<'prazo'>((r) => setTimeout(() => r('prazo'), PRAZO_DA_REDE_MS));
	try {
		const primeiro = await Promise.race([rede, prazo]);
		if (primeiro === 'prazo') return (await copia) ?? (await rede);
		// Erro do servidor (404, 503...): a cópia guardada, se houver.
		if (!primeiro.ok) return (await copia) ?? primeiro;
		return primeiro;
	} catch (erro) {
		const c = await copia;
		if (c) return c;
		throw erro;
	}
}

self.addEventListener('fetch', (evento) => {
	const decisao = estrategia(evento.request, self.location.origin, listas);
	switch (decisao.tipo) {
		case 'ignorar':
			return;
		case 'cache-primeiro':
			evento.respondWith(cachePrimeiro(evento.request));
			return;
		case 'rede-primeiro':
			evento.respondWith(redePrimeiro(evento.request, decisao.chave));
			return;
		case 'redirecionar':
			evento.respondWith(Response.redirect(decisao.para, 301));
			return;
	}
});
