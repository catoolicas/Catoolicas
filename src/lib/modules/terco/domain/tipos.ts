/**
 * Tipos do conteúdo do Terço. O conteúdo em si fica em `content/terco/` (ADR-0003):
 * só dados, com procedência e status editorial; nenhuma lógica.
 */

/** Idiomas de conteúdo do Terço. A interface é sempre em português. */
export type Idioma = 'pt' | 'la';

/** Texto em português, com versão latina quando a origem tiver. */
export type Texto = {
	readonly pt: string;
	readonly la?: string;
	/** A versão latina é tradução não oficial, assim marcada na origem. */
	readonly laNaoOficial?: true;
};

export type StatusEditorial = 'aprovado' | 'em-revisao';

export type Procedencia = {
	/** Origem da importação, por exemplo `terco-diario@e4cbfd6`. */
	readonly origem: string;
	/** Fonte declarada na origem, quando houver (por exemplo, "Missal Romano, festa do Rosário"). */
	readonly fonte?: string;
};

export type Oracao = {
	readonly id: string;
	readonly titulo: Texto;
	readonly texto: Texto;
	/** Versículo e resposta que seguem a oração (por exemplo, depois da Salve-Rainha). */
	readonly versiculo?: { readonly v: Texto; readonly r: Texto };
	readonly nota?: Texto;
	readonly procedencia: Procedencia;
	readonly status: StatusEditorial;
};

/** Uma oração da abertura ou do fecho do terço, rezada `vezes` vezes. */
export type Repeticao = {
	readonly oracao: string;
	readonly vezes: number;
	/** Intenção própria deste ponto (por exemplo, as três Ave-Marias iniciais). */
	readonly nota?: Texto;
};

export type Serie = 'gozosos' | 'luminosos' | 'dolorosos' | 'gloriosos';

export type Pericope = { readonly referencia: Texto; readonly texto: Texto };

type Cinco<T> = readonly [T, T, T, T, T];
type Sete<T> = readonly [T, T, T, T, T, T, T];

export type Misterio = {
	readonly titulo: Texto;
	readonly fruto: Texto;
	/** Passagens cadastradas para o mistério; a alternância diária escolhe uma delas. */
	readonly pericopes: readonly [Pericope, ...Pericope[]];
	readonly oferecimento: Texto;
	/** Intenção anunciada antes do Pai-Nosso (método de Montfort). */
	readonly intencaoPaiNosso?: Texto;
	readonly fecho: Texto;
	/** Os dez pontos de meditação de Montfort, um por Ave-Maria, quando existem. */
	readonly pontos?: readonly Texto[];
	readonly nota?: Texto;
};

export type SerieDeMisterios = {
	readonly id: Serie;
	readonly nome: Texto;
	readonly tema: Texto;
	readonly oracaoFinal: Texto;
	readonly aviso?: Texto;
	readonly misterios: Cinco<Misterio>;
	readonly procedencia: Procedencia;
	readonly status: StatusEditorial;
};

export type Clausulas = {
	readonly [S in Serie]: Cinco<Texto>;
};

export type Jaculatoria = {
	readonly id: string;
	readonly devocao: Texto;
	readonly texto: Texto;
	readonly procedencia: Procedencia;
	readonly status: StatusEditorial;
};

/** Série de mistérios para cada dia da semana, de domingo (0) a sábado (6). */
export type EsquemaDias = Sete<Serie>;
