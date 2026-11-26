import { CLAUSULAS } from '#content/terco/clausulas.ts';
import { ESQUEMAS, PADROES } from '#content/terco/esquemas.ts';
import { JACULATORIAS } from '#content/terco/jaculatorias.ts';
import { ORACOES } from '#content/terco/oracoes.ts';
import type { ConfigTerco, ConteudoTerco } from './domain/sequencia.ts';
import type { EsquemaDias, Jaculatoria, Oracao, Serie, SerieDeMisterios } from './domain/tipos.ts';

/**
 * Conteúdo comum a todas as páginas do Terço (orações, jaculatórias, cláusulas, esquemas e
 * padrões). As séries de mistérios NÃO entram aqui: cada página carrega só a sua
 * (`carregar.ts`), para caber no orçamento de desempenho.
 */

export { ehSerie, SERIES } from './series.ts';

export const ESQUEMAS_DIAS: Readonly<Record<keyof typeof ESQUEMAS, EsquemaDias>> = ESQUEMAS;
export type NomeEsquema = keyof typeof ESQUEMAS;

// Buscas montadas sob demanda (e não ao carregar o módulo), para que páginas que não usam as
// orações — como o menu do Terço — não baixem o texto delas.
let oracoesPorId: Map<string, Oracao> | undefined;
let jaculatoriasPorId: Map<string, Jaculatoria> | undefined;

export function oracao(id: string): Oracao {
	oracoesPorId ??= new Map<string, Oracao>(ORACOES.map((o) => [o.id, o]));
	const o = oracoesPorId.get(id);
	if (!o) throw new Error(`oração inexistente: ${id}`);
	return o;
}

export function jaculatoria(id: string): Jaculatoria {
	jaculatoriasPorId ??= new Map<string, Jaculatoria>(JACULATORIAS.map((j) => [j.id, j]));
	const j = jaculatoriasPorId.get(id);
	if (!j) throw new Error(`jaculatória inexistente: ${id}`);
	return j;
}

/** Conteúdo para montar a sequência com as séries já carregadas. */
export function conteudoPara(series: readonly SerieDeMisterios[]): ConteudoTerco {
	return {
		series,
		clausulas: CLAUSULAS,
		oracoes: new Set(ORACOES.map((o) => o.id)),
		jaculatorias: new Set(JACULATORIAS.map((j) => j.id))
	};
}

/** Configuração inicial: os padrões da origem (terco-diario). */
export function configPadrao(series: readonly Serie[]): ConfigTerco {
	return {
		series,
		abertura: PADROES.abertura,
		finais: PADROES.finais,
		jaculatorias: PADROES.jaculatorias,
		meditacoesMontfort: true,
		clausulas: false
	};
}

export { CLAUSULAS, JACULATORIAS, ORACOES, PADROES };
