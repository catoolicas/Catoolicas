import type { ItemRascunho } from './montagem.ts';
import type { SecaoExame } from './tipos.ts';

/**
 * Gera a tabela de revisão dos rascunhos (docs/editorial/exame-rascunhos.md), legível para os
 * responsáveis aprovarem item a item. Um teste garante que o documento está em dia com os dados.
 */
export function tabelaRevisao(
	secoesRascunho: readonly SecaoExame[],
	itensRascunho: readonly ItemRascunho[],
	nomeDaSecao: (id: string) => string
): string {
	const celula = (s: string) => s.replaceAll('|', '\\|').replaceAll('\n', ' ');
	const linhas = [
		...secoesRascunho.flatMap((s) =>
			s.itens.map((i) => ({ secao: `${s.nome} (seção nova)`, item: i }))
		),
		...itensRascunho.map((i) => ({ secao: nomeDaSecao(i.secao), item: i }))
	];
	const tabela = linhas.map(
		({ secao, item }) =>
			`| \`${item.id}\` | ${celula(secao)} | ${celula(item.pergunta)} | ${celula(item.acusacao)} | ${celula(item.nota ?? '—')} | ${item.grave ? 'sim' : 'não'} | ${item.estados?.join(', ') ?? '—'} | ${item.status} |`
	);
	return [
		'# Rascunhos do Exame para revisão',
		'',
		'> Gerado a partir de `content/exame/rascunhos.ts` por `pnpm exame:rascunhos`. Não edite à mão.',
		'',
		'Itens redigidos com IA a partir da matriz de tópicos (`exame-matriz.md`), sem copiar frases dos PDFs de referência. **Nenhum é publicado enquanto não for aprovado** por `garamogger` ou `williamdasilvazoia8-blip`.',
		'',
		'**Para aprovar um item:** no PR, troque o `status` dele para `aprovado` em `content/exame/rascunhos.ts`. Também é possível pedir mudanças de texto, de gravidade ou de nota, ou remover o item.',
		'',
		'**Gravidade proposta:** "pode ser matéria grave". É só uma proposta, a confirmar na revisão.',
		'',
		'| Id | Seção | Pergunta | Frase para a confissão | Nota | Grave (proposta) | Estado de vida | Status |',
		'|---|---|---|---|---|---|---|---|',
		...tabela,
		''
	].join('\n');
}
