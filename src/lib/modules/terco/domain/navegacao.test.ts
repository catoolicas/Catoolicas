import { describe, expect, it } from 'vitest';
import { CONTEUDO, configPadrao } from '../conteudo.ts';
import {
	anterior,
	dezenaAnterior,
	fim,
	inicio,
	passoEquivalente,
	progresso,
	proximaDezena,
	proximo
} from './navegacao.ts';
import { montarSequencia } from './sequencia.ts';

const seq = montarSequencia(configPadrao(['gozosos']), CONTEUDO);
const anuncios = seq.flatMap((p, i) => (p.tipo === 'anuncio' ? [i] : []));
const finalSerie = seq.findIndex((p) => p.tipo === 'oracao-final-serie');

describe('próximo e anterior', () => {
	it('andam um passo e param nos limites', () => {
		expect(proximo(seq, 0)).toBe(1);
		expect(anterior(seq, 1)).toBe(0);
		expect(anterior(seq, 0)).toBe(0);
		expect(proximo(seq, seq.length - 1)).toBe(seq.length - 1);
		expect(inicio()).toBe(0);
		expect(fim(seq)).toBe(seq.length - 1);
	});

	it('o avanço passa da última conta de uma dezena para a seguinte sem parar', () => {
		const fechoPrimeira = anuncios[1]! - 1;
		expect(seq[fechoPrimeira]?.tipo).toBe('fecho-dezena');
		expect(proximo(seq, fechoPrimeira)).toBe(anuncios[1]);
	});
});

describe('próxima dezena e dezena anterior', () => {
	it('da abertura, vai ao anúncio da primeira dezena', () => {
		expect(anuncios).toHaveLength(5);
		expect(proximaDezena(seq, 0)).toBe(anuncios[0]);
	});

	it('de dentro de uma dezena, vai ao anúncio da seguinte', () => {
		expect(proximaDezena(seq, anuncios[1]! + 5)).toBe(anuncios[2]);
	});

	it('da última dezena, vai à oração final da série; dali, ao fecho e ao fim', () => {
		expect(proximaDezena(seq, anuncios[4]! + 3)).toBe(finalSerie);
		expect(proximaDezena(seq, finalSerie)).toBe(finalSerie + 1);
		expect(proximaDezena(seq, seq.length - 1)).toBe(seq.length - 1);
	});

	it('volta ao anúncio da dezena atual; se já está nele, ao da anterior; na abertura, ao início', () => {
		expect(dezenaAnterior(seq, anuncios[2]! + 7)).toBe(anuncios[2]);
		expect(dezenaAnterior(seq, anuncios[2]!)).toBe(anuncios[1]);
		expect(dezenaAnterior(seq, anuncios[0]!)).toBe(0);
		expect(dezenaAnterior(seq, 3)).toBe(0);
	});
});

describe('progresso', () => {
	it('conta passos e Ave-Marias das dezenas (as iniciais não entram nas 50)', () => {
		expect(progresso(seq, 0)).toEqual({
			passo: 1,
			total: seq.length,
			avesRezadas: 0,
			totalAves: 50
		});
		const primeiraAve = seq.findIndex((p) => p.tipo === 'ave-maria');
		expect(progresso(seq, primeiraAve).avesRezadas).toBe(1);
		expect(progresso(seq, seq.length - 1).avesRezadas).toBe(50);
		expect(progresso(seq, 10_000).passo).toBe(seq.length);
	});
});

describe('passoEquivalente', () => {
	const semJac = montarSequencia({ ...configPadrao(['gozosos']), jaculatorias: [] }, CONTEUDO);

	it('mantém a mesma conta quando as jaculatórias mudam', () => {
		const ave = seq.findIndex(
			(p) => p.tipo === 'ave-maria' && p.dezena.indice === 3 && p.conta === 7
		);
		const nova = passoEquivalente(seq, ave, semJac);
		expect(semJac[nova]).toMatchObject({ tipo: 'ave-maria', conta: 7, dezena: { indice: 3 } });
	});

	it('numa jaculatória que deixou de existir, vai ao anúncio da mesma dezena', () => {
		const jac = seq.findIndex((p) => p.tipo === 'jaculatoria' && p.dezena.indice === 2);
		const nova = passoEquivalente(seq, jac, semJac);
		expect(semJac[nova]).toMatchObject({ tipo: 'anuncio', dezena: { indice: 2 } });
	});

	it('mantém orações da abertura e do fecho', () => {
		expect(passoEquivalente(seq, 0, semJac)).toBe(0);
		expect(passoEquivalente(seq, seq.length - 1, semJac)).toBe(semJac.length - 1);
	});
});
