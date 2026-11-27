import { describe, expect, it } from 'vitest';
import { ITENS_RASCUNHO, SECOES_RASCUNHO } from '../content/exame/rascunhos.ts';
import type { ItemRascunho } from '../src/lib/modules/exame/domain/montagem.ts';
import type { ItemExame, SecaoExame } from '../src/lib/modules/exame/domain/tipos.ts';
import { procurar, textosEmRevisao } from './check-rascunhos.ts';

// Os testes não dependem do status atual dos rascunhos: usam cópias "em revisão" dos reais.
const emRevisao = <T extends { readonly status: string }>(x: T) => ({
	...x,
	status: 'em-revisao' as const
});
const secoesReais: readonly SecaoExame[] = SECOES_RASCUNHO;
const secoesEmRevisao: SecaoExame[] = secoesReais.map((s) => ({
	...emRevisao(s),
	itens: s.itens.map((i) => emRevisao(i))
}));
const itensEmRevisao: ItemRascunho[] = ITENS_RASCUNHO.map((i: ItemRascunho) => emRevisao(i));

const [item] = itensEmRevisao;
if (!item) throw new Error('sem rascunhos');

describe('procura de rascunhos em revisão no build', () => {
	it('inclui ids e textos de itens e seções em revisão', () => {
		const textos = textosEmRevisao(secoesEmRevisao, itensEmRevisao);
		expect(textos).toContain(item.id);
		expect(textos).toContain(item.pergunta);
		expect(textos).toContain(item.acusacao);
		for (const secao of secoesEmRevisao) expect(textos).toContain(secao.enunciado);
	});

	it('não inclui o que já foi aprovado', () => {
		expect(textosEmRevisao([], [{ ...item, status: 'aprovado' }])).toEqual([]);
	});

	it('acha o texto em qualquer arquivo e aponta qual', () => {
		const textos = textosEmRevisao(secoesEmRevisao, itensEmRevisao);
		const arquivos = new Map([
			['exame/index.html', '<p>texto aprovado</p>'],
			['_app/immutable/chunks/x.js', `const a = ${JSON.stringify(item.pergunta)};`]
		]);
		expect(procurar(arquivos, textos)).toEqual([
			{ arquivo: '_app/immutable/chunks/x.js', texto: item.pergunta }
		]);
		expect(procurar(new Map([['a.html', 'nada']]), textos)).toEqual([]);
	});

	it('com o conteúdo atual, procura exatamente os ids em revisão (hoje, nenhum)', () => {
		const itens: ItemExame[] = [...secoesReais.flatMap((s) => s.itens), ...ITENS_RASCUNHO];
		const idsEmRevisao = itens.filter((i) => i.status !== 'aprovado').map((i) => i.id);
		const ids = new Set(itens.map((i) => i.id));
		expect(textosEmRevisao().filter((t) => ids.has(t))).toEqual(idsEmRevisao);
	});
});
