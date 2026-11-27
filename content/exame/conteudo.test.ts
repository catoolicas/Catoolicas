import { describe, expect, it } from 'vitest';
import type { SecaoExame } from '#lib/modules/exame/domain/tipos.ts';
import { ATOS } from './atos.ts';
import { ORACAO_INICIAL, ORIENTACOES, ROTEIRO } from './orientacoes.ts';
import { ITENS_RASCUNHO, SECOES_RASCUNHO } from './rascunhos.ts';
import { SECOES as SECOES_LITERAIS } from './secoes.ts';

const SECOES: readonly SecaoExame[] = SECOES_LITERAIS;

const ESTADOS = new Set(['casados', 'pais', 'trabalho']);
const semHtml = (s: string) => !/<[a-z/][^>]*>/i.test(s);

describe('conteúdo do Exame — base do terco-diario', () => {
	it('tem 9 seções e 37 itens, todos aprovados e de origem "base"', () => {
		expect(SECOES).toHaveLength(9);
		const itens = SECOES.flatMap((s) => s.itens);
		expect(itens).toHaveLength(37);
		for (const x of [...SECOES, ...itens]) {
			expect(x.status).toBe('aprovado');
			expect(x.origem).toBe('base');
			expect(x.procedencia.origem).toBe('terco-diario@e4cbfd6');
		}
	});

	it('tem perguntas e frases de acusação não vazias e sem HTML', () => {
		for (const item of SECOES.flatMap((s) => s.itens)) {
			expect(item.pergunta.trim(), item.id).not.toBe('');
			expect(item.acusacao.trim(), item.id).not.toBe('');
			expect(semHtml(item.pergunta + item.acusacao + (item.nota ?? ''))).toBe(true);
		}
	});

	it('tem 7 orientações, a oração inicial, o roteiro e 4 atos (Confiteor e 3 de contrição)', () => {
		expect(ORIENTACOES).toHaveLength(7);
		expect(ORACAO_INICIAL.texto).toMatch(/^Vinde, Espírito Santo/);
		expect(ROTEIRO.confessionario).toHaveLength(2);
		expect(ATOS.map((a) => a.id)).toEqual([
			'confiteor',
			'contricao',
			'contricao-senhor',
			'contricao-breve'
		]);
		for (const t of [
			...ORIENTACOES.flatMap((o) => [o.destaque, o.texto]),
			...ATOS.map((a) => a.texto)
		])
			expect(semHtml(t)).toBe(true);
	});
});

describe('conteúdo do Exame — rascunhos assistidos', () => {
	const itensRascunho = [...ITENS_RASCUNHO, ...SECOES_RASCUNHO.flatMap((s) => s.itens)];

	it('estão todos em revisão e marcados como rascunho assistido', () => {
		for (const x of [...SECOES_RASCUNHO, ...itensRascunho]) {
			expect(x.status).toBe('em-revisao');
			expect(x.origem).toBe('rascunho-assistido');
		}
	});

	it('têm ids únicos, sem colidir com a base', () => {
		const ids = [
			...SECOES.flatMap((s) => s.itens.map((i) => i.id)),
			...itensRascunho.map((i) => i.id)
		];
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('apontam para seções existentes e usam só estados de vida conhecidos', () => {
		const secoes = new Set(SECOES.map((s) => s.id));
		for (const item of ITENS_RASCUNHO) {
			expect(secoes.has(item.secao), item.id).toBe(true);
			for (const e of 'estados' in item ? item.estados : []) expect(ESTADOS.has(e)).toBe(true);
		}
	});
});
