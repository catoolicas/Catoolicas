import { carregarSerie } from '#lib/modules/terco/carregar.ts';
import { SERIES } from '#lib/modules/terco/series.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => ({
	series: await Promise.all(SERIES.map((serie) => carregarSerie(serie)))
});
