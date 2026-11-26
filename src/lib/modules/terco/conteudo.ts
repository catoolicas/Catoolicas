import { CLAUSULAS } from '#content/terco/clausulas.ts';
import { ESQUEMAS, PADROES } from '#content/terco/esquemas.ts';
import { JACULATORIAS } from '#content/terco/jaculatorias.ts';
import { SERIES_DE_MISTERIOS } from '#content/terco/misterios.ts';
import { ORACOES } from '#content/terco/oracoes.ts';
import type { ConfigTerco, ConteudoTerco } from './domain/sequencia.ts';
import type { EsquemaDias, Serie } from './domain/tipos.ts';

/** Liga o domínio ao conteúdo de `content/terco/` (fonte única, ADR-0003). */
export const CONTEUDO: ConteudoTerco = {
	series: SERIES_DE_MISTERIOS,
	clausulas: CLAUSULAS,
	oracoes: new Set(ORACOES.map((o) => o.id)),
	jaculatorias: new Set(JACULATORIAS.map((j) => j.id))
};

export const ESQUEMAS_DIAS: Readonly<Record<keyof typeof ESQUEMAS, EsquemaDias>> = ESQUEMAS;

/** Configuração inicial: os padrões da origem (terco-diario), para uma série. */
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

export { ORACOES, JACULATORIAS, SERIES_DE_MISTERIOS, CLAUSULAS, PADROES };
