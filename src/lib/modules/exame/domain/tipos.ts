/**
 * Tipos do conteúdo do Exame de consciência. O conteúdo fica em `content/exame/` (ADR-0003):
 * só dados, com procedência e status editorial.
 */

export type StatusEditorial = 'aprovado' | 'em-revisao';

/** `base`: do terco-diario (aprovado). `rascunho-assistido`: redigido com IA, para revisão (ADR-0003, item 6). */
export type Origem = 'base' | 'rascunho-assistido';

export type Procedencia = {
	readonly origem: string;
	readonly fonte?: string;
};

/** Marcadores de itens próprios de um estado de vida (o filtro da interface usa estes valores). */
export type EstadoDeVida = 'casados' | 'pais' | 'trabalho';

export type ItemExame = {
	readonly id: string;
	/** Pergunta do exame, em primeira pessoa. */
	readonly pergunta: string;
	/** Frase curta para a lista levada à confissão. */
	readonly acusacao: string;
	/** Nota pastoral (o que não é pecado, o que diminui a culpa etc.). */
	readonly nota?: string;
	/** "Pode ser matéria grave". Nos rascunhos é só uma proposta, a confirmar na revisão. */
	readonly grave: boolean;
	readonly estados?: readonly EstadoDeVida[];
	readonly origem: Origem;
	readonly procedencia: Procedencia;
	readonly status: StatusEditorial;
};

export type SecaoExame = {
	readonly id: string;
	/** Número ou símbolo exibido (por exemplo, "1" ou "✦"). */
	readonly numero: string;
	readonly nome: string;
	readonly titulo: string;
	/** Enunciado do mandamento ou frase de abertura da seção. */
	readonly enunciado: string;
	readonly itens: readonly ItemExame[];
	readonly origem: Origem;
	readonly procedencia: Procedencia;
	readonly status: StatusEditorial;
};

export type Orientacao = {
	readonly destaque: string;
	readonly texto: string;
};

export type OracaoExame = {
	readonly id: string;
	readonly nome: string;
	readonly texto: string;
	readonly procedencia: Procedencia;
	readonly status: StatusEditorial;
};

/** Textos do resumo e do roteiro do confessionário. */
export type Roteiro = {
	readonly nenhumItem: string;
	readonly tituloGraves: string;
	readonly tituloOutras: string;
	readonly tituloConfessionario: string;
	readonly confessionario: readonly string[];
	readonly tituloAto: string;
	readonly depois: string;
	readonly procedencia: Procedencia;
	readonly status: StatusEditorial;
};
