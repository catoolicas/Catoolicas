import { describe, expect, it } from 'vitest';
import { ITENS_RASCUNHO, SECOES_RASCUNHO } from '#content/exame/rascunhos.ts';
import { SECOES } from '#content/exame/secoes.ts';
import { montarExame, soAprovados, type ItemRascunho } from './montagem.ts';
import type { ItemExame, SecaoExame } from './tipos.ts';

// Os testes da porta editorial não dependem do status atual dos rascunhos: usam cópias deles
// "em revisão" ou "aprovadas", conforme o caso.
const emRevisao = <T extends { readonly status: string }>(x: T) => ({
	...x,
	status: 'em-revisao' as const
});
const aprovado = <T extends { readonly status: string }>(x: T) => ({
	...x,
	status: 'aprovado' as const
});
const secoesReais: readonly SecaoExame[] = SECOES_RASCUNHO;
const SECOES_EM_REVISAO: SecaoExame[] = secoesReais.map((s) => ({
	...emRevisao(s),
	itens: s.itens.map((i) => emRevisao(i))
}));
const ITENS_EM_REVISAO: ItemRascunho[] = ITENS_RASCUNHO.map((i: ItemRascunho) => emRevisao(i));

const [PRIMEIRA_SECAO] = SECOES_EM_REVISAO;
const [PRIMEIRO_ITEM] = ITENS_EM_REVISAO;
if (!PRIMEIRA_SECAO || !PRIMEIRO_ITEM) throw new Error('sem rascunhos para testar');

describe('montarExame — porta editorial', () => {
	it('em produção, nada em revisão aparece: a base fica intacta', () => {
		const secoes = montarExame(SECOES, SECOES_EM_REVISAO, ITENS_EM_REVISAO, {
			incluirRascunhos: false
		});
		expect(secoes.map((s) => s.id)).toEqual(SECOES.map((s) => s.id));
		const itens = secoes.flatMap((s) => s.itens);
		expect(itens).toHaveLength(37);
		expect(itens.every((i) => i.status === 'aprovado' && i.origem === 'base')).toBe(true);
	});

	it('para revisão, inclui rascunhos: itens no fim da seção e seções novas antes de "Omissões"', () => {
		const secoes = montarExame(SECOES, SECOES_EM_REVISAO, ITENS_EM_REVISAO, {
			incluirRascunhos: true
		});
		const ids = secoes.map((s) => s.id);
		expect(ids.indexOf('ex-preceitos')).toBe(ids.indexOf('ex-m9') - 1);
		const m4 = secoes.find((s) => s.id === 'ex-m4');
		expect(m4?.itens.slice(-2).map((i) => i.id)).toEqual(['ex-m4-r1', 'ex-m4-r2']);
		expect(secoes.flatMap((s) => s.itens)).toHaveLength(
			37 + ITENS_EM_REVISAO.length + SECOES_EM_REVISAO.flatMap((s) => s.itens).length
		);
	});

	it('quando um rascunho é aprovado, ele aparece mesmo sem incluir rascunhos', () => {
		const item = aprovado(PRIMEIRO_ITEM);
		const secoes = montarExame(SECOES, [], [item], { incluirRascunhos: false });
		expect(secoes.find((s) => s.id === item.secao)?.itens.at(-1)?.id).toBe(item.id);
	});

	it('recusa rascunho que aponta para seção inexistente', () => {
		const errado = { ...PRIMEIRO_ITEM, secao: 'nao-existe' };
		expect(() => montarExame(SECOES, [], [errado], { incluirRascunhos: true })).toThrow(
			/seção inexistente/
		);
	});
});

describe('soAprovados — o que pode ir para o site publicado', () => {
	it('com tudo em revisão, não sobra nada', () => {
		expect(soAprovados(SECOES_EM_REVISAO, ITENS_EM_REVISAO)).toEqual({ secoes: [], itens: [] });
	});

	it('leva só os itens aprovados, e uma seção nova só se ela e algum item estiverem aprovados', () => {
		const [primeiro, ...resto] = PRIMEIRA_SECAO.itens;
		if (!primeiro) throw new Error('seção sem itens');
		const secaoAprovada = { ...aprovado(PRIMEIRA_SECAO), itens: [aprovado(primeiro), ...resto] };
		const item = aprovado(PRIMEIRO_ITEM);
		const r = soAprovados([secaoAprovada], [item, ...ITENS_EM_REVISAO.slice(1)]);
		expect(r.secoes.map((s) => s.itens.map((i) => i.id))).toEqual([[primeiro.id]]);
		expect(r.itens.map((i) => i.id)).toEqual([item.id]);
		// Seção ainda em revisão: nem os itens aprovados dela saem.
		expect(soAprovados([emRevisao(secaoAprovada)], []).secoes).toEqual([]);
	});

	it('o conteúdo atual: cada rascunho aprovado vai para o site, cada um em revisão fica fora', () => {
		const r = soAprovados(SECOES_RASCUNHO, ITENS_RASCUNHO);
		const publicados = new Set([...r.secoes.flatMap((s) => s.itens), ...r.itens].map((i) => i.id));
		const todos: ItemExame[] = [...SECOES_RASCUNHO.flatMap((s) => s.itens), ...ITENS_RASCUNHO];
		for (const i of todos) expect(publicados.has(i.id), i.id).toBe(i.status === 'aprovado');
	});
});
