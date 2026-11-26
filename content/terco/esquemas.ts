// Conteúdo importado de garamogger/terco-diario (commit e4cbfd6) — ver SOURCES.md.
// Gerado por extração estática; edite à mão daqui em diante (esta pasta é a fonte única).
import type { EsquemaDias, Repeticao } from '#lib/modules/terco/domain/tipos.ts';

/** Série de mistérios por dia da semana (0 = domingo). */
export const ESQUEMAS = {
	'2002': ['gloriosos', 'gozosos', 'dolorosos', 'gloriosos', 'luminosos', 'dolorosos', 'gozosos'],
	montfort: ['gloriosos', 'gozosos', 'dolorosos', 'gloriosos', 'gozosos', 'dolorosos', 'gloriosos']
} as const satisfies Record<string, EsquemaDias>;

/** Padrões do terço na origem: esquema de dias, orações iniciais e finais, jaculatórias. */
export const PADROES = {
	esquema: '2002',
	abertura: [
		{
			oracao: 'sinal',
			vezes: 1
		},
		{
			oracao: 'ofi-montfort',
			vezes: 1
		},
		{
			oracao: 'credo',
			vezes: 1
		},
		{
			oracao: 'ofr-terco',
			vezes: 1
		},
		{
			oracao: 'pai-nosso',
			vezes: 1
		},
		{
			oracao: 'ave-maria',
			vezes: 3,
			nota: {
				pt: 'Em honra do Pai que gera o Filho, do Verbo que com o Pai produz o Espírito Santo, e do Espírito Santo que procede de ambos — pedindo Fé, Esperança e Caridade.',
				la: 'In honorem Patris, Verbi et Spiritus Sancti — pro Fide, Spe et Caritate.'
			}
		},
		{
			oracao: 'gloria',
			vezes: 1
		}
	],
	finais: [
		{
			oracao: 'saud-montfort',
			vezes: 1
		},
		{
			oracao: 'salve',
			vezes: 1
		},
		{
			oracao: 'colecta',
			vezes: 1
		},
		{
			oracao: 'anjo-trindade',
			vezes: 1
		},
		{
			oracao: 'anjo-creio',
			vezes: 1
		}
	],
	jaculatorias: ['gloria', 'fatima']
} as const satisfies {
	readonly esquema: keyof typeof ESQUEMAS;
	readonly abertura: readonly Repeticao[];
	readonly finais: readonly Repeticao[];
	readonly jaculatorias: readonly string[];
};
