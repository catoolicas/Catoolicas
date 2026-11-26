import { describe, expect, it } from 'vitest';
import {
	apagarDados,
	CHAVE_PREFERENCIAS,
	CHAVE_PROGRESSO,
	gravarPreferencias,
	gravarProgresso,
	lerPreferencias,
	lerProgresso,
	preferenciasPadrao,
	validarPreferencias,
	type Armazenamento
} from './preferencias.ts';

const VALIDAS = new Set(['gloria', 'fatima', 'jose']);
const PADRAO = preferenciasPadrao(['gloria', 'fatima']);

function memoria(): Armazenamento & { dados: Map<string, string> } {
	const dados = new Map<string, string>();
	return {
		dados,
		getItem: (k) => dados.get(k) ?? null,
		setItem: (k, v) => void dados.set(k, v),
		removeItem: (k) => void dados.delete(k)
	};
}

const quebrado: Armazenamento = {
	getItem: () => {
		throw new Error('bloqueado');
	},
	setItem: () => {
		throw new Error('bloqueado');
	},
	removeItem: () => {
		throw new Error('bloqueado');
	}
};

describe('validarPreferencias', () => {
	it('aceita valores válidos', () => {
		const p = {
			idioma: 'la',
			esquema: 'montfort',
			meditacoesMontfort: false,
			clausulas: true,
			textoCompleto: false,
			atalhosLetras: false,
			jaculatorias: ['jose', 'gloria']
		};
		expect(validarPreferencias(p, PADRAO, VALIDAS)).toEqual(p);
	});

	it('troca cada campo inválido pelo padrão, sem descartar os válidos', () => {
		const p = validarPreferencias(
			{ idioma: 'en', esquema: 1, clausulas: 'sim', textoCompleto: false, jaculatorias: 'x' },
			PADRAO,
			VALIDAS
		);
		expect(p).toEqual({ ...PADRAO, textoCompleto: false });
	});

	it('descarta jaculatórias desconhecidas ou repetidas, mantendo a ordem', () => {
		const p = validarPreferencias(
			{ jaculatorias: ['fatima', 'inexistente', 'fatima', 3, 'gloria'] },
			PADRAO,
			VALIDAS
		);
		expect(p.jaculatorias).toEqual(['fatima', 'gloria']);
	});

	it('volta ao padrão com qualquer coisa que não seja objeto', () => {
		for (const bruto of [null, 3, 'x', [1, 2]]) {
			expect(validarPreferencias(bruto, PADRAO, VALIDAS)).toEqual(PADRAO);
		}
	});
});

describe('armazenamento', () => {
	it('grava e lê as preferências', () => {
		const m = memoria();
		const p = { ...PADRAO, idioma: 'la' as const };
		expect(gravarPreferencias(m, p)).toBe(true);
		expect(lerPreferencias(m, PADRAO, VALIDAS)).toEqual(p);
	});

	it('com JSON corrompido, volta ao padrão', () => {
		const m = memoria();
		m.setItem(CHAVE_PREFERENCIAS, '{não é json');
		expect(lerPreferencias(m, PADRAO, VALIDAS)).toEqual(PADRAO);
	});

	it('nunca quebra com armazenamento indisponível ou bloqueado', () => {
		expect(lerPreferencias(null, PADRAO, VALIDAS)).toEqual(PADRAO);
		expect(lerPreferencias(quebrado, PADRAO, VALIDAS)).toEqual(PADRAO);
		expect(gravarPreferencias(null, PADRAO)).toBe(false);
		expect(gravarPreferencias(quebrado, PADRAO)).toBe(false);
		expect(lerProgresso(quebrado, '2026-11-26', 'gozosos')).toBeNull();
		expect(gravarProgresso(quebrado, '2026-11-26', 'gozosos', 3)).toBe(false);
		expect(apagarDados(quebrado)).toBe(false);
		expect(apagarDados(null)).toBe(false);
	});

	it('o progresso só vale para a mesma data e a mesma página', () => {
		const m = memoria();
		gravarProgresso(m, '2026-11-26', 'gozosos', 12);
		expect(lerProgresso(m, '2026-11-26', 'gozosos')).toBe(12);
		expect(lerProgresso(m, '2026-11-27', 'gozosos')).toBeNull();
		expect(lerProgresso(m, '2026-11-26', 'rosario')).toBeNull();
		m.setItem(
			CHAVE_PROGRESSO,
			JSON.stringify({ data: '2026-11-26', pagina: 'gozosos', indice: -1 })
		);
		expect(lerProgresso(m, '2026-11-26', 'gozosos')).toBeNull();
	});

	it('apagar remove preferências e progresso', () => {
		const m = memoria();
		gravarPreferencias(m, PADRAO);
		gravarProgresso(m, '2026-11-26', 'gozosos', 1);
		expect(apagarDados(m)).toBe(true);
		expect(m.dados.size).toBe(0);
	});
});
