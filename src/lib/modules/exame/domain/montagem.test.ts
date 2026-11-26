import { describe, expect, it } from 'vitest';
import { ITENS_RASCUNHO, SECOES_RASCUNHO } from '#content/exame/rascunhos.ts';
import { SECOES } from '#content/exame/secoes.ts';
import { montarExame, soAprovados, type ItemRascunho } from './montagem.ts';

describe('montarExame — porta editorial', () => {
	it('em produção mostra só o que está aprovado: a base intacta, sem nenhum rascunho', () => {
		const secoes = montarExame(SECOES, SECOES_RASCUNHO, ITENS_RASCUNHO, {
			incluirRascunhos: false
		});
		expect(secoes.map((s) => s.id)).toEqual(SECOES.map((s) => s.id));
		const itens = secoes.flatMap((s) => s.itens);
		expect(itens).toHaveLength(37);
		expect(itens.every((i) => i.status === 'aprovado' && i.origem === 'base')).toBe(true);
	});

	it('para revisão, inclui rascunhos: itens no fim da seção e seções novas antes de "Omissões"', () => {
		const secoes = montarExame(SECOES, SECOES_RASCUNHO, ITENS_RASCUNHO, { incluirRascunhos: true });
		const ids = secoes.map((s) => s.id);
		expect(ids.indexOf('ex-preceitos')).toBe(ids.indexOf('ex-m9') - 1);
		const m4 = secoes.find((s) => s.id === 'ex-m4');
		expect(m4?.itens.slice(-2).map((i) => i.id)).toEqual(['ex-m4-r1', 'ex-m4-r2']);
		expect(secoes.flatMap((s) => s.itens)).toHaveLength(
			37 + ITENS_RASCUNHO.length + SECOES_RASCUNHO.flatMap((s) => s.itens).length
		);
	});

	it('quando um rascunho é aprovado, ele aparece mesmo sem incluir rascunhos', () => {
		const aprovado = { ...ITENS_RASCUNHO[0], status: 'aprovado' as const };
		const secoes = montarExame(SECOES, [], [aprovado], { incluirRascunhos: false });
		expect(secoes.find((s) => s.id === aprovado.secao)?.itens.at(-1)?.id).toBe(aprovado.id);
	});

	it('recusa rascunho que aponta para seção inexistente', () => {
		const errado = { ...ITENS_RASCUNHO[0], secao: 'nao-existe' };
		expect(() => montarExame(SECOES, [], [errado], { incluirRascunhos: true })).toThrow(
			/seção inexistente/
		);
	});
});

describe('soAprovados — o que pode ir para o site publicado', () => {
	it('hoje, com todos os rascunhos em revisão, não sobra nada', () => {
		expect(soAprovados(SECOES_RASCUNHO, ITENS_RASCUNHO)).toEqual({ secoes: [], itens: [] });
	});

	it('leva só os itens aprovados, e uma seção nova só se ela e algum item estiverem aprovados', () => {
		const [secao] = SECOES_RASCUNHO;
		if (!secao) throw new Error('sem seção de rascunho');
		const [primeiro, ...resto] = secao.itens;
		if (!primeiro) throw new Error('seção sem itens');
		const secaoAprovada = {
			...secao,
			status: 'aprovado' as const,
			itens: [{ ...primeiro, status: 'aprovado' as const }, ...resto]
		};
		const [primeiroItem] = ITENS_RASCUNHO;
		if (!primeiroItem) throw new Error('sem itens de rascunho');
		const item: ItemRascunho = { ...primeiroItem, status: 'aprovado' };
		const r = soAprovados([secaoAprovada], [item, ...ITENS_RASCUNHO.slice(1)]);
		expect(r.secoes.map((s) => s.itens.map((i) => i.id))).toEqual([[primeiro.id]]);
		expect(r.itens.map((i) => i.id)).toEqual([item.id]);
		// Seção ainda em revisão: nem os itens aprovados dela saem.
		expect(soAprovados([{ ...secaoAprovada, status: 'em-revisao' }], []).secoes).toEqual([]);
	});
});
