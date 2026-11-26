import type { Idioma } from '../domain/tipos.ts';

/**
 * Preferências e progresso do Terço, guardados **só neste aparelho** (localStorage).
 *
 * - Nada é gravado só por abrir a página: só quando a pessoa muda uma preferência ou avança.
 * - Tudo é validado campo a campo: valor inválido ou corrompido volta ao padrão.
 * - O armazenamento pode não existir (navegação privada, bloqueio): nunca quebra a página.
 * - Intenções particulares NÃO são guardadas aqui.
 */

export type NomeEsquema = '2002' | 'montfort';

export type Preferencias = {
	readonly idioma: Idioma;
	readonly esquema: NomeEsquema;
	readonly meditacoesMontfort: boolean;
	readonly clausulas: boolean;
	readonly textoCompleto: boolean;
	readonly atalhosLetras: boolean;
	readonly jaculatorias: readonly string[];
};

export type Armazenamento = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const CHAVE_PREFERENCIAS = 'catoolicas:terco:v1';
export const CHAVE_PROGRESSO = 'catoolicas:terco:progresso';

export function preferenciasPadrao(jaculatoriasPadrao: readonly string[]): Preferencias {
	return {
		idioma: 'pt',
		esquema: '2002',
		meditacoesMontfort: true,
		clausulas: false,
		textoCompleto: true,
		atalhosLetras: true,
		jaculatorias: [...jaculatoriasPadrao]
	};
}

const ehObjeto = (v: unknown): v is Record<string, unknown> =>
	typeof v === 'object' && v !== null && !Array.isArray(v);

export function validarPreferencias(
	bruto: unknown,
	padrao: Preferencias,
	jaculatoriasValidas: ReadonlySet<string>
): Preferencias {
	if (!ehObjeto(bruto)) return padrao;
	const bool = (k: keyof Preferencias, atual: boolean) =>
		typeof bruto[k] === 'boolean' ? bruto[k] : atual;
	const jac = Array.isArray(bruto.jaculatorias)
		? bruto.jaculatorias.filter(
				(j, i, lista): j is string =>
					typeof j === 'string' && jaculatoriasValidas.has(j) && lista.indexOf(j) === i
			)
		: padrao.jaculatorias;
	return {
		idioma: bruto.idioma === 'pt' || bruto.idioma === 'la' ? bruto.idioma : padrao.idioma,
		esquema:
			bruto.esquema === '2002' || bruto.esquema === 'montfort' ? bruto.esquema : padrao.esquema,
		meditacoesMontfort: bool('meditacoesMontfort', padrao.meditacoesMontfort),
		clausulas: bool('clausulas', padrao.clausulas),
		textoCompleto: bool('textoCompleto', padrao.textoCompleto),
		atalhosLetras: bool('atalhosLetras', padrao.atalhosLetras),
		jaculatorias: jac
	};
}

function lerJson(armazenamento: Armazenamento | null, chave: string): unknown {
	try {
		const texto = armazenamento?.getItem(chave);
		return texto ? (JSON.parse(texto) as unknown) : null;
	} catch {
		return null;
	}
}

function gravarJson(armazenamento: Armazenamento | null, chave: string, valor: unknown): boolean {
	try {
		if (!armazenamento) return false;
		armazenamento.setItem(chave, JSON.stringify(valor));
		return true;
	} catch {
		return false;
	}
}

export function lerPreferencias(
	armazenamento: Armazenamento | null,
	padrao: Preferencias,
	jaculatoriasValidas: ReadonlySet<string>
): Preferencias {
	return validarPreferencias(
		lerJson(armazenamento, CHAVE_PREFERENCIAS),
		padrao,
		jaculatoriasValidas
	);
}

export function gravarPreferencias(armazenamento: Armazenamento | null, p: Preferencias): boolean {
	return gravarJson(armazenamento, CHAVE_PREFERENCIAS, p);
}

/** Progresso salvo só vale para a mesma data local e a mesma página (série ou rosário). */
export function lerProgresso(
	armazenamento: Armazenamento | null,
	data: string,
	pagina: string
): number | null {
	const bruto = lerJson(armazenamento, CHAVE_PROGRESSO);
	if (!ehObjeto(bruto) || bruto.data !== data || bruto.pagina !== pagina) return null;
	const indice = bruto.indice;
	return typeof indice === 'number' && Number.isInteger(indice) && indice >= 0 ? indice : null;
}

export function gravarProgresso(
	armazenamento: Armazenamento | null,
	data: string,
	pagina: string,
	indice: number
): boolean {
	return gravarJson(armazenamento, CHAVE_PROGRESSO, { data, pagina, indice });
}

/** Apaga tudo o que o Terço guardou neste aparelho. */
export function apagarDados(armazenamento: Armazenamento | null): boolean {
	try {
		armazenamento?.removeItem(CHAVE_PREFERENCIAS);
		armazenamento?.removeItem(CHAVE_PROGRESSO);
		return armazenamento !== null;
	} catch {
		return false;
	}
}

/** O localStorage do navegador, ou `null` se indisponível (SSR, bloqueio, navegação privada). */
export function armazenamentoLocal(): Armazenamento | null {
	try {
		return typeof window === 'undefined' ? null : window.localStorage;
	} catch {
		return null;
	}
}
