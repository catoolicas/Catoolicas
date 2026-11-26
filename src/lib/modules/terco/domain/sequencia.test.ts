import { describe, expect, it } from 'vitest';
import { CLAUSULAS, CONTEUDO, configPadrao, SERIES_DE_MISTERIOS } from '../conteudo.ts';
import { ConfigInvalida, montarSequencia, type Passo } from './sequencia.ts';

const doTipo = <T extends Passo['tipo']>(passos: Passo[], tipo: T) =>
	passos.filter((p): p is Extract<Passo, { tipo: T }> => p.tipo === tipo);

describe('montarSequencia — terço com os padrões da origem', () => {
	const passos = montarSequencia(configPadrao(['gozosos']), CONTEUDO);

	it('tem abertura (9), 5 dezenas de 16 passos, oração final da série e fecho (5)', () => {
		// abertura: sinal, oferecimento, Credo, oferecimento do terço, Pai-Nosso, 3 Ave-Marias, Glória
		// dezena: anúncio, Pai-Nosso, 10 Ave-Marias, Glória, 2 jaculatórias, fecho
		expect(passos).toHaveLength(9 + 5 * 16 + 1 + 5);
		expect(passos[0]).toMatchObject({ tipo: 'oracao', parte: 'abertura', oracao: 'sinal' });
		expect(passos.at(-1)).toMatchObject({ tipo: 'oracao', parte: 'fecho', oracao: 'anjo-creio' });
	});

	it('reza três Ave-Marias iniciais numeradas, com a intenção da origem', () => {
		const iniciais = doTipo(passos, 'oracao').filter((p) => p.oracao === 'ave-maria');
		expect(iniciais.map((p) => [p.vez, p.vezes])).toEqual([
			[1, 3],
			[2, 3],
			[3, 3]
		]);
		for (const p of iniciais) expect(p.nota?.pt).toMatch(/^Em honra do Pai/);
	});

	it('tem 50 Ave-Marias, de 1 a 10 em cada uma das 5 dezenas', () => {
		const aves = doTipo(passos, 'ave-maria');
		expect(aves).toHaveLength(50);
		for (let d = 0; d < 5; d++) {
			const daDezena = aves.filter((a) => a.dezena.indice === d);
			expect(daDezena.map((a) => a.conta)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
			expect(daDezena.every((a) => a.dezena.serie === 'gozosos' && a.dezena.misterio === d)).toBe(
				true
			);
		}
	});

	it('com meditações de Montfort, cada Ave-Maria traz o seu ponto e nenhuma cláusula', () => {
		const pontos = SERIES_DE_MISTERIOS.find((s) => s.id === 'gozosos')?.misterios[2].pontos ?? [];
		expect(pontos).toHaveLength(10);
		const aves = doTipo(passos, 'ave-maria').filter((a) => a.dezena.misterio === 2);
		expect(aves.map((a) => a.ponto?.pt)).toEqual(pontos.map((p) => p.pt));
		expect(aves.every((a) => a.clausula === undefined)).toBe(true);
	});

	it('reza as jaculatórias padrão, na ordem, ao fim de cada dezena', () => {
		const jac = doTipo(passos, 'jaculatoria');
		expect(jac).toHaveLength(10);
		expect(jac.slice(0, 2).map((j) => j.jaculatoria)).toEqual(['gloria', 'fatima']);
	});
});

describe('montarSequencia — opções', () => {
	it('nos luminosos (sem pontos), a meditação usa a cláusula como frase-guia', () => {
		const aves = doTipo(montarSequencia(configPadrao(['luminosos']), CONTEUDO), 'ave-maria');
		for (const a of aves) {
			expect(a.ponto).toBeUndefined();
			expect(a.clausula?.pt).toBe(CLAUSULAS.luminosos[a.dezena.misterio]?.pt);
		}
	});

	it('com o rosário das cláusulas, toda Ave-Maria traz a cláusula do seu mistério', () => {
		const config = { ...configPadrao(['dolorosos']), clausulas: true };
		for (const a of doTipo(montarSequencia(config, CONTEUDO), 'ave-maria')) {
			expect(a.clausula?.pt).toBe(CLAUSULAS.dolorosos[a.dezena.misterio]?.pt);
			expect(a.ponto).toBeDefined();
		}
	});

	it('sem meditações nem cláusulas, as Ave-Marias vêm sem ponto e sem cláusula', () => {
		const config = { ...configPadrao(['luminosos']), meditacoesMontfort: false };
		for (const a of doTipo(montarSequencia(config, CONTEUDO), 'ave-maria')) {
			expect(a.ponto).toBeUndefined();
			expect(a.clausula).toBeUndefined();
		}
	});

	it('aceita nenhuma jaculatória ou outra ordem', () => {
		const sem = montarSequencia({ ...configPadrao(['gozosos']), jaculatorias: [] }, CONTEUDO);
		expect(doTipo(sem, 'jaculatoria')).toHaveLength(0);
		const outra = montarSequencia(
			{ ...configPadrao(['gozosos']), jaculatorias: ['fatima', 'jose', 'gloria'] },
			CONTEUDO
		);
		expect(
			doTipo(outra, 'jaculatoria')
				.slice(0, 3)
				.map((j) => j.jaculatoria)
		).toEqual(['fatima', 'jose', 'gloria']);
	});

	it('rosário inteiro: abertura e fecho uma vez, 20 dezenas numeradas e uma oração final por série', () => {
		const series = ['gozosos', 'luminosos', 'dolorosos', 'gloriosos'] as const;
		const passos = montarSequencia(configPadrao(series), CONTEUDO);
		const anuncios = doTipo(passos, 'anuncio');
		expect(anuncios.map((a) => a.dezena.indice)).toEqual(Array.from({ length: 20 }, (_, i) => i));
		expect(doTipo(passos, 'oracao-final-serie').map((p) => p.serie)).toEqual([...series]);
		expect(doTipo(passos, 'oracao').filter((p) => p.oracao === 'sinal')).toHaveLength(1);
		expect(doTipo(passos, 'ave-maria')).toHaveLength(200);
	});
});

describe('montarSequencia — validação', () => {
	it('recusa configurações inválidas com erro explícito', () => {
		const base = configPadrao(['gozosos']);
		expect(() => montarSequencia({ ...base, series: [] }, CONTEUDO)).toThrow(ConfigInvalida);
		expect(() =>
			montarSequencia({ ...base, abertura: [{ oracao: 'inexistente', vezes: 1 }] }, CONTEUDO)
		).toThrow(/oração inexistente/);
		expect(() =>
			montarSequencia({ ...base, finais: [{ oracao: 'salve', vezes: 0 }] }, CONTEUDO)
		).toThrow(/repetição inválida/);
		expect(() => montarSequencia({ ...base, jaculatorias: ['nenhuma'] }, CONTEUDO)).toThrow(
			/jaculatória inexistente/
		);
	});
});
