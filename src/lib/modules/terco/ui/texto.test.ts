import { describe, expect, it } from 'vitest';
import { exibir } from './texto.ts';

describe('exibir', () => {
	it('usa o latim quando pedido e disponível, com lang="la"', () => {
		expect(exibir({ pt: 'Ave', la: 'Ave Maria' }, 'la')).toEqual({
			conteudo: 'Ave Maria',
			lang: 'la',
			naoOficial: false
		});
	});

	it('marca o latim não oficial', () => {
		expect(exibir({ pt: 'x', la: 'y', laNaoOficial: true }, 'la').naoOficial).toBe(true);
	});

	it('cai para o português quando não há latim, e nunca marca o português como não oficial', () => {
		expect(exibir({ pt: 'Só português' }, 'la')).toEqual({
			conteudo: 'Só português',
			lang: 'pt-BR',
			naoOficial: false
		});
		expect(exibir({ pt: 'x', la: 'y', laNaoOficial: true }, 'pt').naoOficial).toBe(false);
	});
});
