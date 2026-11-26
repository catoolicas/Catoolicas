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
