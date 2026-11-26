/**
 * Regenera, a partir de content/exame/rascunhos.ts:
 * - docs/editorial/exame-rascunhos.md, a tabela de revisão;
 * - content/exame/rascunhos-aprovados.ts, só com os rascunhos aprovados. É o único arquivo de
 *   rascunhos que o site publicado importa: texto em revisão não chega ao navegador.
 * Uso: pnpm exame:rascunhos (testes falham se algum dos dois ficar fora de dia).
 */
import { realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ITENS_RASCUNHO, SECOES_RASCUNHO } from '../content/exame/rascunhos.ts';
import { SECOES } from '../content/exame/secoes.ts';
import { soAprovados } from '../src/lib/modules/exame/domain/montagem.ts';
import { tabelaRevisao } from '../src/lib/modules/exame/domain/revisao.ts';

export const CAMINHO_DOC = 'docs/editorial/exame-rascunhos.md';
export const CAMINHO_APROVADOS = 'content/exame/rascunhos-aprovados.ts';

export function gerarDoc(): string {
	const nomes = new Map<string, string>(SECOES.map((s) => [s.id, `${s.titulo} — ${s.nome}`]));
	return tabelaRevisao(SECOES_RASCUNHO, ITENS_RASCUNHO, (id) => nomes.get(id) ?? id);
}

export function gerarAprovados(): string {
	const { secoes, itens } = soAprovados(SECOES_RASCUNHO, ITENS_RASCUNHO);
	const json = (x: unknown) => JSON.stringify(x, null, '\t');
	return [
		'// GERADO por `pnpm exame:rascunhos` a partir de content/exame/rascunhos.ts. Não edite à mão.',
		'// Só os rascunhos aprovados: é o único arquivo de rascunhos que o site publicado importa.',
		"import type { ItemRascunho } from '#lib/modules/exame/domain/montagem.ts';",
		"import type { SecaoExame } from '#lib/modules/exame/domain/tipos.ts';",
		'',
		`export const SECOES_APROVADAS: readonly SecaoExame[] = ${json(secoes)};`,
		'',
		`export const ITENS_APROVADOS: readonly ItemRascunho[] = ${json(itens)};`,
		''
	].join('\n');
}

const executadoDiretamente =
	process.argv[1] !== undefined &&
	realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (executadoDiretamente) {
	const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
	writeFileSync(join(raiz, CAMINHO_DOC), gerarDoc());
	writeFileSync(join(raiz, CAMINHO_APROVADOS), gerarAprovados());
	console.log(`Gerados ${CAMINHO_DOC} e ${CAMINHO_APROVADOS}`);
}
