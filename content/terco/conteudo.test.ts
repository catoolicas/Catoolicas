import { describe, expect, it } from 'vitest';
import type { Serie, Texto } from '#lib/modules/terco/domain/tipos.ts';
import { CLAUSULAS } from './clausulas.ts';
import { ESQUEMAS, PADROES } from './esquemas.ts';
import { JACULATORIAS } from './jaculatorias.ts';
import { SERIES_DE_MISTERIOS } from './misterios.ts';
import { ORACOES } from './oracoes.ts';

const ORIGEM = 'terco-diario@e4cbfd6';
const SERIES: readonly Serie[] = ['gozosos', 'luminosos', 'dolorosos', 'gloriosos'];

function ehTexto(v: unknown): v is Texto {
	return typeof v === 'object' && v !== null && 'pt' in v && typeof v.pt === 'string';
}

/** Todos os textos do conteúdo, com o caminho de onde vieram. */
function todosOsTextos(): { onde: string; texto: Texto }[] {
	const achados: { onde: string; texto: Texto }[] = [];
	const visitar = (v: unknown, onde: string) => {
		if (ehTexto(v)) achados.push({ onde, texto: v });
		else if (Array.isArray(v)) v.forEach((x, i) => visitar(x, `${onde}[${i}]`));
		else if (typeof v === 'object' && v !== null)
			for (const [k, x] of Object.entries(v)) visitar(x, `${onde}.${k}`);
	};
	visitar(ORACOES, 'oracoes');
	visitar(SERIES_DE_MISTERIOS, 'misterios');
	visitar(CLAUSULAS, 'clausulas');
	visitar(JACULATORIAS, 'jaculatorias');
	visitar(PADROES, 'padroes');
	return achados;
}

describe('conteúdo do Terço importado do terco-diario', () => {
	it('tem as quatro séries, na ordem, com cinco mistérios cada', () => {
		expect(SERIES_DE_MISTERIOS.map((s) => s.id)).toEqual(SERIES);
		for (const serie of SERIES_DE_MISTERIOS) expect(serie.misterios).toHaveLength(5);
	});

	it('tem dez pontos de Montfort por mistério, exceto nos luminosos, que trazem aviso', () => {
		for (const serie of SERIES_DE_MISTERIOS) {
			for (const misterio of serie.misterios) {
				const pontos = 'pontos' in misterio ? misterio.pontos : undefined;
				if (serie.id === 'luminosos') expect(pontos).toBeUndefined();
				else expect(pontos).toHaveLength(10);
			}
		}
		const luminosos = SERIES_DE_MISTERIOS.find((s) => s.id === 'luminosos');
		expect(luminosos && 'aviso' in luminosos).toBe(true);
	});

	it('tem ao menos uma perícope por mistério', () => {
		for (const serie of SERIES_DE_MISTERIOS)
			for (const misterio of serie.misterios) expect(misterio.pericopes.length).toBeGreaterThan(0);
	});

	it('tem cinco cláusulas por série', () => {
		for (const serie of SERIES) expect(CLAUSULAS[serie]).toHaveLength(5);
	});

	it('todo texto tem português e latim não vazios, sem marcação HTML', () => {
		const textos = todosOsTextos();
		expect(textos.length).toBeGreaterThan(300);
		for (const { onde, texto } of textos) {
			expect(texto.pt.trim(), onde).not.toBe('');
			expect(texto.la?.trim(), onde).toBeTruthy();
			expect(texto.pt, onde).not.toMatch(/<[a-z/][^>]*>/i);
			expect(texto.la ?? '', onde).not.toMatch(/<[a-z/][^>]*>/i);
		}
	});

	it('marca como não oficial só o latim das três orações de Montfort sem versão latina na origem', () => {
		const naoOficiais = ORACOES.filter((o) => 'laNaoOficial' in o.texto).map((o) => o.id);
		expect(naoOficiais).toEqual(['ofi-montfort', 'ofr-terco', 'saud-montfort']);
	});

	it('tem ids únicos e procedência e status em todos os itens', () => {
		for (const lista of [ORACOES, JACULATORIAS, SERIES_DE_MISTERIOS]) {
			const ids = lista.map((x) => x.id);
			expect(new Set(ids).size).toBe(ids.length);
			for (const item of lista) {
				expect(item.procedencia.origem).toBe(ORIGEM);
				expect(item.status).toBe('aprovado');
			}
		}
	});

	it('tem esquemas de sete dias com séries válidas; só o de 2002 usa os luminosos', () => {
		for (const esquema of Object.values(ESQUEMAS)) {
			expect(esquema).toHaveLength(7);
			for (const serie of esquema) expect(SERIES).toContain(serie);
		}
		expect(ESQUEMAS['2002'][4]).toBe('luminosos');
		expect(ESQUEMAS.montfort).not.toContain('luminosos');
	});

	it('tem padrões que só referenciam orações, jaculatórias e esquemas existentes', () => {
		const oracoes = new Set<string>(ORACOES.map((o) => o.id));
		for (const r of [...PADROES.abertura, ...PADROES.finais]) {
			expect(oracoes.has(r.oracao), r.oracao).toBe(true);
			expect(r.vezes).toBeGreaterThan(0);
		}
		const jaculatorias = new Set<string>(JACULATORIAS.map((j) => j.id));
		for (const id of PADROES.jaculatorias) expect(jaculatorias.has(id), id).toBe(true);
		expect(Object.keys(ESQUEMAS)).toContain(PADROES.esquema);
	});
});
