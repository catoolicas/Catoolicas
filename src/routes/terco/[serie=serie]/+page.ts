import { carregarSerie } from '#lib/modules/terco/carregar.ts';
import { SERIES } from '#lib/modules/terco/series.ts';
import type { EntryGenerator, PageLoad } from './$types';

// Pré-renderiza as quatro séries (o build estático não descobre rotas dinâmicas sozinho).
export const entries: EntryGenerator = () => SERIES.map((serie) => ({ serie }));

export const load: PageLoad = async ({ params }) => ({
	serie: await carregarSerie(params.serie)
});
