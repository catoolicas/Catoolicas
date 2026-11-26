import { ATOS } from '#content/exame/atos.ts';
import { TEXTOS } from '#content/exame/interface.ts';
import { ORACAO_INICIAL, ORIENTACOES, ROTEIRO } from '#content/exame/orientacoes.ts';
import { ITENS_APROVADOS, SECOES_APROVADAS } from '#content/exame/rascunhos-aprovados.ts';
import { SECOES } from '#content/exame/secoes.ts';
import { montarExame } from './domain/montagem.ts';
import type { SecaoExame } from './domain/tipos.ts';

export { ATOS, ORACAO_INICIAL, ORIENTACOES, ROTEIRO, TEXTOS };

/** Ato de contrição do resumo, como no terco-diario ("Meu Deus, eu me arrependo"). */
export const ATO_PADRAO = 'contricao';

/** O exame publicado: a base e os rascunhos já aprovados. */
export function exameAprovado(): SecaoExame[] {
	return montarExame(SECOES, SECOES_APROVADAS, ITENS_APROVADOS, { incluirRascunhos: false });
}

/**
 * Só no modo de desenvolvimento, para os revisores: inclui os rascunhos em revisão, que a
 * interface marca como tal. No build de produção esta função some (o chamador a protege com
 * `import.meta.env.DEV`), e o `rascunhos.ts` não entra no site publicado.
 */
export async function exameEmRevisao(): Promise<SecaoExame[]> {
	const { ITENS_RASCUNHO, SECOES_RASCUNHO } = await import('#content/exame/rascunhos.ts');
	return montarExame(SECOES, SECOES_RASCUNHO, ITENS_RASCUNHO, { incluirRascunhos: true });
}
