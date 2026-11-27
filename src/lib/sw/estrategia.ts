/**
 * Como o service worker trata cada pedido (ADR-0005). Funções puras, testadas sem navegador.
 *
 * - `ignorar`: o navegador segue sozinho (outro método, outra origem, endereço desconhecido).
 * - `cache-primeiro`: arquivos imutáveis do build (nome com hash).
 * - `rede-primeiro`: páginas e arquivos estáticos; sem internet, a cópia guardada (`chave`).
 * - `redirecionar`: navegação para uma página sem a barra final, como `/terco`.
 *
 * O cache de cada versão é uma fotografia fixa, feita na instalação: nada é acrescentado ou
 * trocado durante o uso, e nenhum endereço desconhecido é guardado.
 */
export type Decisao =
	| { readonly tipo: 'ignorar' }
	| { readonly tipo: 'cache-primeiro' }
	| { readonly tipo: 'rede-primeiro'; readonly chave: string }
	| { readonly tipo: 'redirecionar'; readonly para: string };

export type Pedido = { readonly method: string; readonly url: string; readonly mode?: string };

export type Listas = {
	/** Caminhos absolutos (pathname) dos arquivos imutáveis do build. */
	readonly imutaveis: ReadonlySet<string>;
	/** Caminhos absolutos (pathname) das páginas pré-renderizadas e dos arquivos estáticos. */
	readonly paginas: ReadonlySet<string>;
};

const IGNORAR: Decisao = { tipo: 'ignorar' };

export function estrategia(pedido: Pedido, origem: string, listas: Listas): Decisao {
	if (pedido.method !== 'GET') return IGNORAR;
	const url = new URL(pedido.url);
	if (url.origin !== origem) return IGNORAR;
	const navegacao = pedido.mode === 'navigate';
	// Parâmetros na URL: só a navegação (por exemplo, `?fbclid=...` num link) usa a página guardada.
	if (url.search !== '' && !navegacao) return IGNORAR;

	if (listas.imutaveis.has(url.pathname)) return { tipo: 'cache-primeiro' };
	if (listas.paginas.has(url.pathname)) return { tipo: 'rede-primeiro', chave: url.pathname };
	if (navegacao && !url.pathname.endsWith('/') && listas.paginas.has(`${url.pathname}/`))
		return { tipo: 'redirecionar', para: `${url.origin}${url.pathname}/${url.search}` };
	return IGNORAR;
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

const PREFIXO = 'catoolicas-';

/** Nome do cache de uma versão do site. */
export const nomeDoCache = (versao: string) => `${PREFIXO}${versao}`;

/**
 * Cache de uma versão anterior deste site. A origem pode ser compartilhada com outros sites (por
 * exemplo, `<conta>.github.io`): caches de outros nomes nunca são tocados.
 */
export const cacheAntigo = (nome: string, atual: string) =>
	nome.startsWith(PREFIXO) && nome !== atual;
