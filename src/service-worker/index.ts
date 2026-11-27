/**
 * Service worker do Catoolicas: o site funciona sem internet depois da primeira visita a uma
 * página com JavaScript (ADR-0005).
 *
 * Privacidade: guarda só os arquivos públicos do próprio site, listados no build. Não vê nada do
 * que a pessoa faz nas páginas (o Exame não faz requisições depois de aberto), não guarda
 * endereços desconhecidos, não envia nada a ninguém e não registra nada.
 */
import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { self } from '$app/service-worker';
import { caminhosAbsolutos, estrategia, nomeDoCache } from '#lib/sw/estrategia.ts';

const CACHE = nomeDoCache(version);
const endereco = self.location.href;
const relativos = (lista: readonly { path: string }[]) => lista.map((x) => x.path);

const IMUTAVEIS = caminhosAbsolutos(relativos(immutable), endereco);
const PAGINAS = caminhosAbsolutos([...relativos(prerendered), ...relativos(assets)], endereco);
const listas = { imutaveis: new Set(IMUTAVEIS), paginas: new Set(PAGINAS) };

self.addEventListener('install', (evento) => {
	evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([...IMUTAVEIS, ...PAGINAS])));
});

self.addEventListener('activate', (evento) => {
	// Caches de versões anteriores do site.
	evento.waitUntil(
		caches
			.keys()
			.then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
	);
});

async function cachePrimeiro(pedido: Request): Promise<Response> {
	const guardada = await caches.match(pedido, { cacheName: CACHE });
	return guardada ?? fetch(pedido);
}

async function redePrimeiro(pedido: Request): Promise<Response> {
	const cache = await caches.open(CACHE);
	try {
		const resposta = await fetch(pedido);
		// Mantém a cópia em dia (só de endereços conhecidos, ver `estrategia`).
		if (resposta.ok && resposta.type === 'basic') await cache.put(pedido, resposta.clone());
		return resposta;
	} catch (erro) {
		const guardada = await cache.match(pedido);
		if (guardada) return guardada;
		throw erro;
	}
}

self.addEventListener('fetch', (evento) => {
	const tipo = estrategia(evento.request, self.location.origin, listas);
	if (tipo === 'ignorar') return;
	evento.respondWith(
		tipo === 'cache-primeiro' ? cachePrimeiro(evento.request) : redePrimeiro(evento.request)
	);
});
