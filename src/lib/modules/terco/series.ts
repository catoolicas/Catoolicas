import type { Serie } from './domain/tipos.ts';

/**
 * Lista das séries, sem nenhum conteúdo. Usada pelo matcher de rotas (`src/params.ts`), que vai
 * para o JS de todas as páginas: por isso não pode importar textos.
 */
export const SERIES: readonly Serie[] = ['gozosos', 'luminosos', 'dolorosos', 'gloriosos'];

export function ehSerie(valor: string): valor is Serie {
	return (SERIES as readonly string[]).includes(valor);
}
