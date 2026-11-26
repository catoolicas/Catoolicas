import { describe, expect, it } from 'vitest';
import { ESQUEMAS } from '#content/terco/esquemas.ts';
import { dataLocal, diasDesdeEpoca, pericopeDoDia, serieDoDia } from './calendario.ts';
import type { Misterio, Texto } from './tipos.ts';

const t = (pt: string): Texto => ({ pt: `[texto de teste] ${pt}` });

/** Mistério de teste com três perícopes (fixture: não é conteúdo real). */
const misterio: Misterio = {
	titulo: t('título'),
	fruto: t('fruto'),
	pericopes: [
		{ referencia: t('ref A'), texto: t('A') },
		{ referencia: t('ref B'), texto: t('B') },
		{ referencia: t('ref C'), texto: t('C') }
	],
	oferecimento: t('oferecimento'),
	fecho: t('fecho')
};

describe('serieDoDia', () => {
	it('segue o esquema de 2002 (quinta-feira: luminosos)', () => {
		expect(serieDoDia(new Date(2026, 10, 26), ESQUEMAS['2002'])).toBe('luminosos');
		expect(serieDoDia(new Date(2026, 10, 29), ESQUEMAS['2002'])).toBe('gloriosos');
		expect(serieDoDia(new Date(2026, 10, 30), ESQUEMAS['2002'])).toBe('gozosos');
	});

	it('segue o esquema de Montfort (quinta-feira: gozosos)', () => {
		expect(serieDoDia(new Date(2026, 10, 26), ESQUEMAS.montfort)).toBe('gozosos');
		expect(serieDoDia(new Date(2026, 10, 28), ESQUEMAS.montfort)).toBe('gloriosos');
	});
});

describe('dataLocal', () => {
	it('formata a data local com zeros à esquerda', () => {
		expect(dataLocal(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
		expect(dataLocal(new Date(2026, 11, 31, 0, 0))).toBe('2026-12-31');
	});
});

describe('diasDesdeEpoca', () => {
	it('conta dias pela data local, ignorando a hora', () => {
		expect(diasDesdeEpoca(new Date(1970, 0, 1, 0, 0))).toBe(0);
		expect(diasDesdeEpoca(new Date(1970, 0, 2, 23, 59))).toBe(1);
	});

	it('avança exatamente um por dia ao longo de um ano inteiro (sem saltos de horário de verão)', () => {
		const inicio = new Date(2026, 0, 1, 12, 0);
		for (let i = 1; i <= 366; i++) {
			const dia = new Date(2026, 0, 1 + i, 0, 30);
			expect(diasDesdeEpoca(dia) - diasDesdeEpoca(inicio)).toBe(i);
		}
	});
});

describe('pericopeDoDia', () => {
	it('alterna entre as passagens cadastradas, um dia após o outro', () => {
		const base = new Date(2026, 10, 26);
		const sequencia = [0, 1, 2, 3, 4, 5].map(
			(d) => pericopeDoDia(misterio, new Date(2026, 10, 26 + d)).texto.pt
		);
		const primeira = misterio.pericopes.findIndex(
			(p) => p.texto.pt === pericopeDoDia(misterio, base).texto.pt
		);
		const esperado = [0, 1, 2, 3, 4, 5].map(
			(d) => misterio.pericopes[(primeira + d) % 3]?.texto.pt
		);
		expect(sequencia).toEqual(esperado);
	});

	it('é determinística: a mesma data dá a mesma passagem, a qualquer hora', () => {
		expect(pericopeDoDia(misterio, new Date(2026, 10, 26, 0, 1))).toBe(
			pericopeDoDia(misterio, new Date(2026, 10, 26, 23, 59))
		);
	});

	it('com uma única passagem, devolve sempre a mesma', () => {
		const unico: Misterio = { ...misterio, pericopes: [{ referencia: t('r'), texto: t('x') }] };
		for (let d = 0; d < 5; d++)
			expect(pericopeDoDia(unico, new Date(2026, 0, 1 + d)).texto.pt).toBe('[texto de teste] x');
	});
});
