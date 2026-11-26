import { describe, expect, it } from 'vitest';
import { CONTEUDO, configPadrao, SERIES_DE_MISTERIOS } from '../conteudo.ts';
import { montarSequencia } from '../domain/sequencia.ts';
import { descreverPasso } from './descrever.ts';

describe('descreverPasso', () => {
	const passos = montarSequencia(configPadrao(['gozosos']), CONTEUDO);
	const descricoes = passos.map((p) => descreverPasso(p, SERIES_DE_MISTERIOS));

	it('descreve cada passo do terço com um texto não vazio', () => {
		expect(descricoes.every((d) => d.trim().length > 0)).toBe(true);
	});

	it('anuncia o mistério com número, série e título', () => {
		const i = passos.findIndex((p) => p.tipo === 'anuncio');
		expect(descricoes[i]).toBe(
			`1º mistério gozoso: ${SERIES_DE_MISTERIOS[0]?.misterios[0].titulo.pt}`
		);
	});

	it('conta as Ave-Marias e as repetições da abertura', () => {
		expect(descricoes).toContain('3º mistério gozoso, Ave-Maria 7 de 10');
		const iniciais = descricoes.filter((d) => /, \d de 3$/.test(d));
		expect(iniciais).toHaveLength(3);
	});
});
