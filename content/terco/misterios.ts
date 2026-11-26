// Índice das séries completas (cabeçalho + mistérios). As páginas NÃO usam este índice:
// carregam só a série de que precisam (src/lib/modules/terco/carregar.ts). Ele serve aos
// testes e a ferramentas que precisam de todas as séries.
import type { SerieDeMisterios } from '#lib/modules/terco/domain/tipos.ts';
import { MISTERIOS as dolorosos } from './misterios/dolorosos.ts';
import { MISTERIOS as gloriosos } from './misterios/gloriosos.ts';
import { MISTERIOS as gozosos } from './misterios/gozosos.ts';
import { MISTERIOS as luminosos } from './misterios/luminosos.ts';
import { SERIES } from './series.ts';

const misterios = { gozosos, luminosos, dolorosos, gloriosos } as const;

export const SERIES_DE_MISTERIOS: readonly SerieDeMisterios[] = SERIES.map((cabecalho) => ({
	...cabecalho,
	misterios: misterios[cabecalho.id]
}));
