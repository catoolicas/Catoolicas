import { defineParams } from '@sveltejs/kit/params';
import { ehSerie } from '#lib/modules/terco/series.ts';

// SvelteKit 3: matchers de parâmetros de rota. `/terco/[serie=serie]/` só existe para as quatro
// séries de mistérios, e `params.serie` chega já com o tipo `Serie`.
export const params = defineParams({
	serie: (valor) => (ehSerie(valor) ? valor : undefined)
});
