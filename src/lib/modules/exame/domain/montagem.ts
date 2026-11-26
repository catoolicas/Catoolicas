import type { ItemExame, SecaoExame } from './tipos.ts';

export type ItemRascunho = ItemExame & { readonly secao: string };

export type OpcoesMontagem = {
	/**
	 * Incluir itens e seções em revisão. Só no modo de desenvolvimento, para os revisores:
	 * em produção a porta editorial (ADR-0003, item 4) mostra apenas o que foi aprovado.
	 */
	readonly incluirRascunhos: boolean;
};

const ID_OMISSOES = 'ex-m9';

/**
 * Junta a base com os rascunhos e aplica a porta editorial.
 * - Itens de rascunho entram no fim da seção indicada em `secao`.
 * - Seções novas entram antes de "Omissões", que fecha o exame.
 * - Sem `incluirRascunhos`, nada em revisão aparece; seções que ficariam vazias somem.
 */
export function montarExame(
	base: readonly SecaoExame[],
	secoesRascunho: readonly SecaoExame[],
	itensRascunho: readonly ItemRascunho[],
	opcoes: OpcoesMontagem
): SecaoExame[] {
	const visivel = (x: { readonly status: string }) =>
		opcoes.incluirRascunhos || x.status === 'aprovado';

	const ids = new Set([...base, ...secoesRascunho].map((s) => s.id));
	for (const item of itensRascunho) {
		if (!ids.has(item.secao))
			throw new Error(`rascunho ${item.id} aponta para seção inexistente: ${item.secao}`);
	}

	const comRascunhos = (secao: SecaoExame): SecaoExame => ({
		...secao,
		itens: [
			...secao.itens,
			...itensRascunho.filter((i) => i.secao === secao.id).map(({ secao, ...item }) => item)
		].filter(visivel)
	});

	const posOmissoes = base.findIndex((s) => s.id === ID_OMISSOES);
	const corte = posOmissoes === -1 ? base.length : posOmissoes;
	const ordem = [...base.slice(0, corte), ...secoesRascunho, ...base.slice(corte)];

	return ordem
		.filter(visivel)
		.map(comRascunhos)
		.filter((s) => s.itens.length > 0);
}
