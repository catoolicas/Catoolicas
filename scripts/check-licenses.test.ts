import { describe, expect, it } from 'vitest';
import { expressaoPermitida, reprovados, type Relatorio } from './check-licenses.ts';

describe('expressaoPermitida', () => {
	it('aceita identificadores simples da lista', () => {
		expect(expressaoPermitida('MIT')).toBe(true);
		expect(expressaoPermitida('Apache-2.0')).toBe(true);
		expect(expressaoPermitida('MPL-2.0')).toBe(true);
	});

	it('recusa licenças incompatíveis com a GPLv3 ou desconhecidas', () => {
		expect(expressaoPermitida('GPL-2.0-only')).toBe(false);
		expect(expressaoPermitida('UNLICENSED')).toBe(false);
		expect(expressaoPermitida('Unknown')).toBe(false);
		expect(expressaoPermitida('')).toBe(false);
	});

	it('avalia OR: basta uma alternativa permitida', () => {
		expect(expressaoPermitida('(MIT OR GPL-2.0-only)')).toBe(true);
		expect(expressaoPermitida('GPL-2.0-only OR SSPL-1.0')).toBe(false);
		expect(expressaoPermitida('(MIT or Apache-2.0)')).toBe(true);
	});

	it('avalia AND: todas precisam ser permitidas', () => {
		expect(expressaoPermitida('MIT AND ISC')).toBe(true);
		expect(expressaoPermitida('MIT AND GPL-2.0-only')).toBe(false);
	});

	it('respeita precedência e parênteses', () => {
		// AND tem precedência sobre OR: GPL-2.0-only OR (MIT AND ISC)
		expect(expressaoPermitida('GPL-2.0-only OR MIT AND ISC')).toBe(true);
		expect(expressaoPermitida('(GPL-2.0-only OR MIT) AND SSPL-1.0')).toBe(false);
		expect(expressaoPermitida('((MIT))')).toBe(true);
	});

	it('só aceita "X WITH Y" listado literalmente', () => {
		expect(expressaoPermitida('Apache-2.0 WITH LLVM-exception')).toBe(false);
		expect(
			expressaoPermitida(
				'Apache-2.0 WITH LLVM-exception',
				new Set(['Apache-2.0 WITH LLVM-exception'])
			)
		).toBe(true);
	});

	it('recusa expressões malformadas', () => {
		expect(expressaoPermitida('(MIT OR ISC')).toBe(false);
		expect(expressaoPermitida('MIT OR')).toBe(false);
		expect(expressaoPermitida('MIT ISC')).toBe(false);
	});
});

describe('reprovados', () => {
	const relatorio: Relatorio = {
		MIT: [{ name: 'a', versions: ['1.0.0'], license: 'MIT' }],
		'GPL-2.0-only': [{ name: 'b', versions: ['2.0.0'], license: 'GPL-2.0-only' }],
		Unknown: [{ name: 'c', versions: ['0.1.0'], license: '' }]
	};

	it('lista os pacotes fora da lista permitida, usando o grupo quando falta o campo', () => {
		expect(reprovados(relatorio)).toEqual([
			{ pacote: 'b', versoes: ['2.0.0'], licenca: 'GPL-2.0-only' },
			{ pacote: 'c', versoes: ['0.1.0'], licenca: 'Unknown' }
		]);
	});

	it('ignora pacotes com exceção justificada', () => {
		expect(reprovados(relatorio, undefined, { b: 'motivo', c: 'motivo' })).toEqual([]);
	});
});
