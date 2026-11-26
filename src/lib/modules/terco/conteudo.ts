import { SERIES_DE_MISTERIOS } from '#content/terco/misterios.ts';
import { conteudoPara } from './comum.ts';
import type { ConteudoTerco } from './domain/sequencia.ts';

/**
 * Conteúdo completo, com as quatro séries. Para testes e ferramentas: as páginas NÃO devem
 * importar este módulo (carregaria todas as séries); usam `comum.ts` e `carregar.ts`.
 */
export const CONTEUDO: ConteudoTerco = conteudoPara(SERIES_DE_MISTERIOS);

export { SERIES_DE_MISTERIOS };
export { CLAUSULAS, configPadrao, ESQUEMAS_DIAS, JACULATORIAS, ORACOES, PADROES } from './comum.ts';
