import { describe, expect, it } from 'vitest';
import { AJUDA_ATALHOS, resolverTecla } from './teclado.ts';

const com = { letras: true };
const sem = { letras: false };

describe('resolverTecla', () => {
	it('setas, PageUp/PageDown, Home/End e Esc funcionam sempre', () => {
		for (const opcoes of [com, sem]) {
			expect(resolverTecla({ key: 'ArrowRight' }, opcoes)).toBe('proximo');
			expect(resolverTecla({ key: 'ArrowLeft' }, opcoes)).toBe('anterior');
			expect(resolverTecla({ key: 'ArrowDown' }, opcoes)).toBe('proxima-dezena');
			expect(resolverTecla({ key: 'PageDown' }, opcoes)).toBe('proxima-dezena');
			expect(resolverTecla({ key: 'ArrowUp' }, opcoes)).toBe('dezena-anterior');
			expect(resolverTecla({ key: 'PageUp' }, opcoes)).toBe('dezena-anterior');
			expect(resolverTecla({ key: 'Home' }, opcoes)).toBe('inicio');
			expect(resolverTecla({ key: 'End' }, opcoes)).toBe('fim');
			expect(resolverTecla({ key: 'Escape' }, opcoes)).toBe('sair');
		}
	});

	it('atalhos de um caractere (Espaço, letras, Vim, ?) só com a opção ligada (WCAG 2.1.4)', () => {
		const casos = [
			[' ', 'proximo'],
			['j', 'proximo'],
			['l', 'proximo'],
			['k', 'anterior'],
			['h', 'anterior'],
			['J', 'proxima-dezena'],
			['K', 'dezena-anterior'],
			['G', 'fim'],
			['t', 'alternar-texto'],
			['?', 'ajuda']
		] as const;
		for (const [key, comando] of casos) {
			expect(resolverTecla({ key }, com), key).toBe(comando);
			expect(resolverTecla({ key }, sem), key).toBeNull();
		}
	});

	it('gg vai ao início; g sozinho não faz nada', () => {
		expect(resolverTecla({ key: 'g' }, com)).toBeNull();
		expect(resolverTecla({ key: 'g' }, { letras: true, teclaAnterior: 'g' })).toBe('inicio');
		expect(resolverTecla({ key: 'g' }, { letras: false, teclaAnterior: 'g' })).toBeNull();
	});

	it('ignora combinações com Ctrl, Cmd ou Alt e teclas desconhecidas', () => {
		expect(resolverTecla({ key: 'ArrowRight', ctrlKey: true }, com)).toBeNull();
		expect(resolverTecla({ key: 'j', metaKey: true }, com)).toBeNull();
		expect(resolverTecla({ key: 'k', altKey: true }, com)).toBeNull();
		expect(resolverTecla({ key: 'x' }, com)).toBeNull();
		expect(resolverTecla({ key: 'Enter' }, com)).toBeNull();
	});
});

describe('AJUDA_ATALHOS', () => {
	const NOMES: Record<string, string> = {
		'→': 'ArrowRight',
		'←': 'ArrowLeft',
		'↓': 'ArrowDown',
		'↑': 'ArrowUp',
		Espaço: ' ',
		Esc: 'Escape'
	};

	it('descreve exatamente o que resolverTecla faz', () => {
		for (const item of AJUDA_ATALHOS) {
			for (const tecla of item.teclas)
				expect(resolverTecla({ key: NOMES[tecla] ?? tecla }, { letras: false }), tecla).toBe(
					item.comando
				);
			for (const tecla of item.letras) {
				if (tecla === 'gg') {
					expect(resolverTecla({ key: 'g' }, { letras: true, teclaAnterior: 'g' })).toBe(
						item.comando
					);
					continue;
				}
				const key = NOMES[tecla] ?? tecla;
				expect(resolverTecla({ key }, { letras: true }), tecla).toBe(item.comando);
				expect(resolverTecla({ key }, { letras: false }), tecla).toBeNull();
			}
		}
	});
});
