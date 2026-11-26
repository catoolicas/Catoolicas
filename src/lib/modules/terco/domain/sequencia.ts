import type { Clausulas, Repeticao, Serie, SerieDeMisterios, Texto } from './tipos.ts';

/**
 * Monta a sequência linear de passos do terço ou do rosário: uma lista em que cada
 * passo é uma conta ou uma oração. A navegação (navegacao.ts) só anda por essa lista, então
 * o "avanço automático" para a dezena seguinte sai naturalmente da ordem dos passos.
 */

export type ConfigTerco = {
	/** Uma série para o terço; várias para o rosário inteiro, na ordem. */
	readonly series: readonly Serie[];
	readonly abertura: readonly Repeticao[];
	readonly finais: readonly Repeticao[];
	/** Ids das jaculatórias rezadas ao fim de cada dezena, na ordem. */
	readonly jaculatorias: readonly string[];
	/** Mostrar os pontos de meditação de Montfort, um por Ave-Maria. */
	readonly meditacoesMontfort: boolean;
	/** Rosário das cláusulas: acrescentar a cláusula do mistério em cada Ave-Maria. */
	readonly clausulas: boolean;
};

export type ConteudoTerco = {
	readonly series: readonly SerieDeMisterios[];
	readonly clausulas: Clausulas;
	/** Ids existentes, para validar a configuração. */
	readonly oracoes: ReadonlySet<string>;
	readonly jaculatorias: ReadonlySet<string>;
};

/** Posição de um passo dentro de uma dezena. */
export type Dezena = {
	/** Índice global da dezena na sequência (0, 1, 2…). */
	readonly indice: number;
	readonly serie: Serie;
	/** Índice do mistério na série (0 a 4). */
	readonly misterio: number;
};

export type Passo =
	| {
			readonly tipo: 'oracao';
			readonly parte: 'abertura' | 'fecho';
			readonly oracao: string;
			/** Repetição atual e total (por exemplo, 2 de 3 Ave-Marias iniciais). */
			readonly vez: number;
			readonly vezes: number;
			readonly nota?: Texto;
	  }
	| { readonly tipo: 'anuncio'; readonly dezena: Dezena }
	| { readonly tipo: 'pai-nosso'; readonly dezena: Dezena }
	| {
			readonly tipo: 'ave-maria';
			readonly dezena: Dezena;
			/** Conta da dezena, de 1 a 10. */
			readonly conta: number;
			readonly ponto?: Texto;
			readonly clausula?: Texto;
	  }
	| { readonly tipo: 'gloria'; readonly dezena: Dezena }
	| { readonly tipo: 'jaculatoria'; readonly dezena: Dezena; readonly jaculatoria: string }
	| { readonly tipo: 'fecho-dezena'; readonly dezena: Dezena }
	| { readonly tipo: 'oracao-final-serie'; readonly serie: Serie };

export class ConfigInvalida extends Error {
	override name = 'ConfigInvalida';
}

function validar(config: ConfigTerco, conteudo: ConteudoTerco): void {
	if (config.series.length === 0) throw new ConfigInvalida('nenhuma série escolhida');
	for (const serie of config.series) {
		if (!conteudo.series.some((s) => s.id === serie))
			throw new ConfigInvalida(`série sem conteúdo: ${serie}`);
	}
	for (const r of [...config.abertura, ...config.finais]) {
		if (!conteudo.oracoes.has(r.oracao))
			throw new ConfigInvalida(`oração inexistente: ${r.oracao}`);
		if (!Number.isInteger(r.vezes) || r.vezes < 1)
			throw new ConfigInvalida(`repetição inválida: ${r.oracao} × ${r.vezes}`);
	}
	for (const j of config.jaculatorias) {
		if (!conteudo.jaculatorias.has(j)) throw new ConfigInvalida(`jaculatória inexistente: ${j}`);
	}
}

function oracoes(parte: 'abertura' | 'fecho', lista: readonly Repeticao[]): Passo[] {
	return lista.flatMap((r) =>
		Array.from({ length: r.vezes }, (_, i): Passo => {
			const passo = {
				tipo: 'oracao',
				parte,
				oracao: r.oracao,
				vez: i + 1,
				vezes: r.vezes
			} as const;
			return r.nota ? { ...passo, nota: r.nota } : passo;
		})
	);
}

export function montarSequencia(config: ConfigTerco, conteudo: ConteudoTerco): Passo[] {
	validar(config, conteudo);
	const passos: Passo[] = oracoes('abertura', config.abertura);
	let indiceDezena = 0;

	for (const idSerie of config.series) {
		const serie = conteudo.series.find((s) => s.id === idSerie);
		if (!serie) throw new ConfigInvalida(`série sem conteúdo: ${idSerie}`);

		serie.misterios.forEach((misterio, m) => {
			const dezena: Dezena = { indice: indiceDezena++, serie: idSerie, misterio: m };
			const clausula = conteudo.clausulas[idSerie][m];
			const pontos = misterio.pontos;
			// Sem pontos de Montfort (luminosos), a meditação usa a cláusula como frase-guia.
			const usarClausula = config.clausulas || (config.meditacoesMontfort && !pontos);

			passos.push({ tipo: 'anuncio', dezena }, { tipo: 'pai-nosso', dezena });
			for (let conta = 1; conta <= 10; conta++) {
				const ponto = config.meditacoesMontfort ? pontos?.[conta - 1] : undefined;
				passos.push({
					tipo: 'ave-maria',
					dezena,
					conta,
					...(ponto ? { ponto } : {}),
					...(usarClausula ? { clausula } : {})
				});
			}
			passos.push({ tipo: 'gloria', dezena });
			for (const jaculatoria of config.jaculatorias)
				passos.push({ tipo: 'jaculatoria', dezena, jaculatoria });
			passos.push({ tipo: 'fecho-dezena', dezena });
		});
		passos.push({ tipo: 'oracao-final-serie', serie: idSerie });
	}

	passos.push(...oracoes('fecho', config.finais));
	return passos;
}
