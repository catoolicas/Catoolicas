import type { Passo } from './sequencia.ts';

/**
 * Navegação pela sequência de passos. Funções puras: recebem a sequência e o índice
 * atual e devolvem o novo índice, sempre dentro dos limites.
 */

function limitar(sequencia: readonly Passo[], indice: number): number {
	if (sequencia.length === 0) return 0;
	return Math.min(Math.max(indice, 0), sequencia.length - 1);
}

export function proximo(sequencia: readonly Passo[], indice: number): number {
	return limitar(sequencia, indice + 1);
}

export function anterior(sequencia: readonly Passo[], indice: number): number {
	return limitar(sequencia, indice - 1);
}

export function inicio(): number {
	return 0;
}

export function fim(sequencia: readonly Passo[]): number {
	return limitar(sequencia, sequencia.length - 1);
}

const ehAnuncio = (p: Passo | undefined) => p?.tipo === 'anuncio';

/**
 * Vai ao anúncio da próxima dezena. Na última dezena, vai à oração final da série ou às
 * orações finais; dali em diante, ao último passo.
 */
export function proximaDezena(sequencia: readonly Passo[], indice: number): number {
	for (let i = indice + 1; i < sequencia.length; i++) if (ehAnuncio(sequencia[i])) return i;
	const posDezenas = sequencia.findIndex(
		(p, i) =>
			i > indice &&
			(p.tipo === 'oracao-final-serie' || (p.tipo === 'oracao' && p.parte === 'fecho'))
	);
	return posDezenas === -1 ? fim(sequencia) : posDezenas;
}

/**
 * Volta ao anúncio da dezena atual; se já estiver nele, ao da dezena anterior.
 * Antes da primeira dezena, volta ao início.
 */
export function dezenaAnterior(sequencia: readonly Passo[], indice: number): number {
	for (let i = indice - 1; i >= 0; i--) if (ehAnuncio(sequencia[i])) return i;
	return inicio();
}

export type Progresso = {
	/** Posição 1-based na sequência e total de passos. */
	readonly passo: number;
	readonly total: number;
	/** Ave-Marias das dezenas até o passo atual, inclusive, e total de Ave-Marias das dezenas. */
	readonly avesRezadas: number;
	readonly totalAves: number;
};

export function progresso(sequencia: readonly Passo[], indice: number): Progresso {
	const atual = limitar(sequencia, indice);
	let avesRezadas = 0;
	let totalAves = 0;
	sequencia.forEach((p, i) => {
		if (p.tipo !== 'ave-maria') return;
		totalAves++;
		if (i <= atual) avesRezadas++;
	});
	return { passo: atual + 1, total: sequencia.length, avesRezadas, totalAves };
}

/**
 * Posição equivalente numa nova sequência, quando uma preferência muda a lista de passos
 * (por exemplo, menos jaculatórias). Procura, nesta ordem: o mesmo passo (mesma dezena,
 * tipo, conta, oração ou jaculatória); o anúncio da mesma dezena; o passo de mesmo índice.
 */
export function passoEquivalente(
	antiga: readonly Passo[],
	indice: number,
	nova: readonly Passo[]
): number {
	const atual = antiga[limitar(antiga, indice)];
	if (!atual || nova.length === 0) return 0;
	const chave = (p: Passo): string => {
		switch (p.tipo) {
			case 'oracao':
				return `oracao:${p.parte}:${p.oracao}:${p.vez}`;
			case 'ave-maria':
				return `ave:${p.dezena.indice}:${p.conta}`;
			case 'jaculatoria':
				return `jac:${p.dezena.indice}:${p.jaculatoria}`;
			case 'oracao-final-serie':
				return `final:${p.serie}`;
			default:
				return `${p.tipo}:${p.dezena.indice}`;
		}
	};
	const procurada = chave(atual);
	const mesmo = nova.findIndex((p) => chave(p) === procurada);
	if (mesmo !== -1) return mesmo;
	if ('dezena' in atual) {
		const anuncio = nova.findIndex(
			(p) => p.tipo === 'anuncio' && p.dezena.indice === atual.dezena.indice
		);
		if (anuncio !== -1) return anuncio;
	}
	return limitar(nova, indice);
}
