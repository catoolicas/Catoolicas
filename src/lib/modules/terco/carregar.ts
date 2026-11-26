import { SERIES } from '#content/terco/series.ts';
import type { CincoMisterios, Serie, SerieDeMisterios } from './domain/tipos.ts';

/**
 * Carrega sob demanda os mistérios de uma série. Cada arquivo de `content/terco/misterios/`
 * vira um pedaço de JS separado, e cada página baixa só o que usa. Os cabeçalhos das séries
 * (nome, tema, oração final) são pequenos e ficam sempre disponíveis.
 */
const modulos = import.meta.glob<{ MISTERIOS: CincoMisterios }>('/content/terco/misterios/*.ts');

export const CABECALHOS = SERIES;

export async function carregarSerie(serie: Serie): Promise<SerieDeMisterios> {
	const cabecalho = SERIES.find((s) => s.id === serie);
	const carregar = modulos[`/content/terco/misterios/${serie}.ts`];
	if (!cabecalho || !carregar) throw new Error(`série sem conteúdo: ${serie}`);
	return { ...cabecalho, misterios: (await carregar()).MISTERIOS };
}
