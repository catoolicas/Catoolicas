/**
 * Como o service worker trata cada pedido (ADR-0005). Função pura, testada sem navegador.
 *
 * - `ignorar`: o navegador segue sozinho (outro método, outra origem, fora da lista guardada).
 * - `cache-primeiro`: arquivos imutáveis do build (nome com hash): o cache nunca fica velho.
 * - `rede-primeiro`: páginas e arquivos estáticos guardados: busca a versão nova e, sem
 *   internet, usa a cópia guardada.
 *
 * Só o que está na lista guardada na instalação é tratado: o service worker nunca guarda
 * endereços que não conhece (por exemplo, com parâmetros na URL).
 */
export type Estrategia = 'ignorar' | 'cache-primeiro' | 'rede-primeiro';

export type Pedido = { readonly method: string; readonly url: string };

export type Listas = {
	/** Caminhos absolutos (pathname) dos arquivos imutáveis do build. */
	readonly imutaveis: ReadonlySet<string>;
	/** Caminhos absolutos (pathname) das páginas pré-renderizadas e dos arquivos estáticos. */
	readonly paginas: ReadonlySet<string>;
};

export function estrategia(pedido: Pedido, origem: string, listas: Listas): Estrategia {
	if (pedido.method !== 'GET') return 'ignorar';
	const url = new URL(pedido.url);
	if (url.origin !== origem || url.search !== '') return 'ignorar';
	if (listas.imutaveis.has(url.pathname)) return 'cache-primeiro';
	if (listas.paginas.has(url.pathname)) return 'rede-primeiro';
	return 'ignorar';
}

/** Caminhos do manifesto (relativos à base) como pathnames absolutos, a partir do endereço do SW. */
export function caminhosAbsolutos(
	caminhos: readonly string[],
	enderecoDoServiceWorker: string
): string[] {
	// Resolve contra a PASTA do service worker: '' (a página inicial) resolvido contra o próprio
	// endereço do service worker daria o endereço dele, e não a raiz do site.
	const pasta = new URL('./', enderecoDoServiceWorker);
	return caminhos.map((c) => new URL(c, pasta).pathname);
}

/** Nome do cache de uma versão do site; caches com outro nome são de versões antigas. */
export const nomeDoCache = (versao: string) => `catoolicas-${versao}`;
