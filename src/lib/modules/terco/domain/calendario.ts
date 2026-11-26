import type { EsquemaDias, Misterio, Pericope, Serie } from './tipos.ts';

/**
 * Regras de calendário do Terço. Tudo usa a **data local** do aparelho: o HTML é
 * pré-renderizado no build e não sabe a data do visitante (ADR-0002, item 7).
 */

/** Série de mistérios do dia, segundo o esquema (0 = domingo). */
export function serieDoDia(data: Date, esquema: EsquemaDias): Serie {
	return esquema[data.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6];
}

/** Data local no formato AAAA-MM-DD (chave estável para o progresso do dia). */
export function dataLocal(data: Date): string {
	const ano = String(data.getFullYear()).padStart(4, '0');
	const mes = String(data.getMonth() + 1).padStart(2, '0');
	const dia = String(data.getDate()).padStart(2, '0');
	return `${ano}-${mes}-${dia}`;
}

/**
 * Número de dias desde 01/01/1970 contados pela data local.
 * Usa só ano, mês e dia, de modo que fuso horário e horário de verão não mudam o resultado.
 */
export function diasDesdeEpoca(data: Date): number {
	return Math.floor(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()) / 86_400_000);
}

/**
 * Perícope do dia para um mistério: alterna, um dia após o outro, entre as passagens
 * cadastradas. Determinística: a mesma data sempre dá a mesma passagem.
 */
export function pericopeDoDia(misterio: Misterio, data: Date): Pericope {
	const total = misterio.pericopes.length;
	const indice = ((diasDesdeEpoca(data) % total) + total) % total;
	return misterio.pericopes[indice] ?? misterio.pericopes[0];
}
