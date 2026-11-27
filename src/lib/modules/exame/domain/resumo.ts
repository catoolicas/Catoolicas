import type { EstadoDeVida, SecaoExame } from './tipos.ts';

/**
 * Itens marcados pela pessoa: id do item → "quantas vezes" (texto livre, pode ser vazio).
 * Vive só na memória da página (ADR-0004).
 */
export type Marcacoes = Readonly<Record<string, string>>;

export type LinhaResumo = {
	readonly id: string;
	readonly acusacao: string;
	readonly vezes: string;
};

export type Resumo = {
	readonly graves: readonly LinhaResumo[];
	readonly outras: readonly LinhaResumo[];
};

/** Estados de vida que aparecem em algum item, na ordem em que aparecem. */
export function estadosPresentes(secoes: readonly SecaoExame[]): EstadoDeVida[] {
	const vistos: EstadoDeVida[] = [];
	for (const item of secoes.flatMap((s) => s.itens))
		for (const e of item.estados ?? []) if (!vistos.includes(e)) vistos.push(e);
	return vistos;
}

/**
 * Itens gerais sempre aparecem; os de um estado de vida, só se a pessoa escolheu esse estado.
 * Seções que ficariam vazias somem.
 */
export function filtrarPorEstados(
	secoes: readonly SecaoExame[],
	escolhidos: readonly EstadoDeVida[]
): SecaoExame[] {
	return secoes
		.map((s) => ({
			...s,
			itens: s.itens.filter(
				(i) => !i.estados?.length || i.estados.some((e) => escolhidos.includes(e))
			)
		}))
		.filter((s) => s.itens.length > 0);
}

/** Descarta marcações de itens que não estão mais visíveis (nada fica guardado à toa). */
export function soVisiveis(marcacoes: Marcacoes, secoes: readonly SecaoExame[]): Marcacoes {
	const visiveis = new Set(secoes.flatMap((s) => s.itens.map((i) => i.id)));
	return Object.fromEntries(Object.entries(marcacoes).filter(([id]) => visiveis.has(id)));
}

/**
 * A lista levada à confissão, na ordem do exame: primeiro o que pode ser matéria grave, depois
 * as outras faltas (como no terco-diario). "Quantas vezes" só vale para os itens graves.
 */
export function montarResumo(secoes: readonly SecaoExame[], marcacoes: Marcacoes): Resumo {
	const graves: LinhaResumo[] = [];
	const outras: LinhaResumo[] = [];
	for (const item of secoes.flatMap((s) => s.itens)) {
		const vezes = marcacoes[item.id];
		if (vezes === undefined) continue;
		if (item.grave) graves.push({ id: item.id, acusacao: item.acusacao, vezes: vezes.trim() });
		else outras.push({ id: item.id, acusacao: item.acusacao, vezes: '' });
	}
	return { graves, outras };
}
