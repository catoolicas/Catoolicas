import { describe, expect, it } from 'vitest';
import { ITENS_RASCUNHO, SECOES_RASCUNHO } from '#content/exame/rascunhos.ts';
import { SECOES as BASE } from '#content/exame/secoes.ts';
import { montarExame } from './montagem.ts';
import { estadosPresentes, filtrarPorEstados, montarResumo, soVisiveis } from './resumo.ts';
import type { SecaoExame } from './tipos.ts';

const SECOES: readonly SecaoExame[] = BASE;

const emRevisao = montarExame(SECOES, SECOES_RASCUNHO, ITENS_RASCUNHO, { incluirRascunhos: true });
const itens = SECOES.flatMap((s) => s.itens);
const grave = itens.find((i) => i.grave);
const leve = itens.find((i) => !i.grave);
if (!grave || !leve) throw new Error('a base deveria ter itens graves e leves');

describe('montarResumo', () => {
	it('sem marcações, nada', () => {
		expect(montarResumo(SECOES, {})).toEqual({ graves: [], outras: [] });
	});

	it('graves primeiro, com "quantas vezes" aparado; nas outras faltas o número não entra', () => {
		const r = montarResumo(SECOES, { [leve.id]: 'ignorado', [grave.id]: '  umas 3  ' });
		expect(r.graves).toEqual([{ id: grave.id, acusacao: grave.acusacao, vezes: 'umas 3' }]);
		expect(r.outras).toEqual([{ id: leve.id, acusacao: leve.acusacao, vezes: '' }]);
	});

	it('segue a ordem do exame, não a ordem em que a pessoa marcou', () => {
		const graves = itens.filter((i) => i.grave).slice(0, 3);
		const marcacoes = Object.fromEntries(graves.toReversed().map((i) => [i.id, '']));
		expect(montarResumo(SECOES, marcacoes).graves.map((l) => l.id)).toEqual(
			graves.map((i) => i.id)
		);
	});

	it('ignora ids que não estão no exame', () => {
		expect(montarResumo(SECOES, { 'nao-existe': '2' })).toEqual({ graves: [], outras: [] });
	});
});

describe('estados de vida', () => {
	it('a base não tem itens por estado de vida; os rascunhos têm', () => {
		expect(estadosPresentes(SECOES)).toEqual([]);
		expect(estadosPresentes(emRevisao).toSorted()).toEqual(['casados', 'pais', 'trabalho']);
	});

	it('sem escolha, só os itens gerais; escolhendo um estado, entram os itens dele', () => {
		const gerais = filtrarPorEstados(emRevisao, []).flatMap((s) => s.itens);
		expect(gerais.every((i) => !i.estados?.length)).toBe(true);
		const comCasados = filtrarPorEstados(emRevisao, ['casados']).flatMap((s) => s.itens);
		const casados = comCasados.filter((i) => i.estados?.length);
		expect(casados.length).toBeGreaterThan(0);
		expect(casados.every((i) => i.estados?.includes('casados'))).toBe(true);
	});

	it('não altera a base, que não tem itens por estado', () => {
		expect(filtrarPorEstados(SECOES, [])).toEqual(SECOES);
	});

	it('soVisiveis descarta marcações de itens escondidos', () => {
		const casado = emRevisao.flatMap((s) => s.itens).find((i) => i.estados?.includes('casados'));
		if (!casado) throw new Error('sem item de casados');
		const marcacoes = { [casado.id]: '1', [grave.id]: '' };
		expect(soVisiveis(marcacoes, filtrarPorEstados(emRevisao, []))).toEqual({ [grave.id]: '' });
		expect(soVisiveis(marcacoes, filtrarPorEstados(emRevisao, ['casados']))).toEqual(marcacoes);
	});
});
