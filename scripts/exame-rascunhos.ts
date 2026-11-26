/**
 * Regenera docs/editorial/exame-rascunhos.md a partir de content/exame/rascunhos.ts.
 * Uso: pnpm exame:rascunhos
 */
import { realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ITENS_RASCUNHO, SECOES_RASCUNHO } from '../content/exame/rascunhos.ts';
import { SECOES } from '../content/exame/secoes.ts';
import { tabelaRevisao } from '../src/lib/modules/exame/domain/revisao.ts';

export const CAMINHO_DOC = 'docs/editorial/exame-rascunhos.md';

export function gerarDoc(): string {
	const nomes = new Map<string, string>(SECOES.map((s) => [s.id, `${s.titulo} — ${s.nome}`]));
	return tabelaRevisao(SECOES_RASCUNHO, ITENS_RASCUNHO, (id) => nomes.get(id) ?? id);
}

const executadoDiretamente =
	process.argv[1] !== undefined &&
	realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (executadoDiretamente) {
	const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
	writeFileSync(join(raiz, CAMINHO_DOC), gerarDoc());
	console.log(`Gerado ${CAMINHO_DOC}`);
}
