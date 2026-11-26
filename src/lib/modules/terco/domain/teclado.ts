/**
 * Mapa de teclas do Terço, puro e testável. Quem chama decide quando ignorar o evento
 * (por exemplo, com o foco num campo de texto ou num botão).
 *
 * Acessibilidade (WCAG 2.2, critério 2.1.4): atalhos de **um só caractere** precisam poder
 * ser desligados, porque a entrada por voz pode dispará-los sem querer. Por cautela, todas as
 * letras (inclusive as do Vim), o `?` e o `Espaço` dependem de `letras`. Setas, PageUp/PageDown,
 * Home/End e Esc funcionam sempre.
 */

export type Comando =
	| 'proximo'
	| 'anterior'
	| 'proxima-dezena'
	| 'dezena-anterior'
	| 'inicio'
	| 'fim'
	| 'alternar-texto'
	| 'ajuda'
	| 'sair';

export type EventoTecla = {
	readonly key: string;
	readonly ctrlKey?: boolean;
	readonly metaKey?: boolean;
	readonly altKey?: boolean;
};

export type OpcoesTeclado = {
	/** Atalhos de um só caractere ligados: letras (inclusive Vim), `?` e `Espaço`. */
	readonly letras: boolean;
	/** Tecla anterior, para sequências de duas teclas (`gg`). */
	readonly teclaAnterior?: string;
};

const SEMPRE: Readonly<Record<string, Comando>> = {
	ArrowRight: 'proximo',
	ArrowLeft: 'anterior',
	ArrowDown: 'proxima-dezena',
	PageDown: 'proxima-dezena',
	ArrowUp: 'dezena-anterior',
	PageUp: 'dezena-anterior',
	Home: 'inicio',
	End: 'fim',
	Escape: 'sair'
};

const LETRAS: Readonly<Record<string, Comando>> = {
	' ': 'proximo',
	// Vim: j/l avançam, k/h voltam (j/k já eram usados pelo terco-diario).
	j: 'proximo',
	l: 'proximo',
	k: 'anterior',
	h: 'anterior',
	J: 'proxima-dezena',
	K: 'dezena-anterior',
	G: 'fim',
	t: 'alternar-texto',
	'?': 'ajuda'
};

export function resolverTecla(evento: EventoTecla, opcoes: OpcoesTeclado): Comando | null {
	if (evento.ctrlKey || evento.metaKey || evento.altKey) return null;
	const comando = SEMPRE[evento.key];
	if (comando) return comando;
	if (!opcoes.letras) return null;
	if (evento.key === 'g') return opcoes.teclaAnterior === 'g' ? 'inicio' : null;
	return LETRAS[evento.key] ?? null;
}

/** Tabela para a ajuda de atalhos exibida ao usuário. */
export const AJUDA_ATALHOS: readonly {
	readonly comando: Comando;
	readonly descricao: string;
	readonly teclas: readonly string[];
	readonly letras: readonly string[];
}[] = [
	{ comando: 'proximo', descricao: 'Próximo passo', teclas: ['→'], letras: ['Espaço', 'j', 'l'] },
	{ comando: 'anterior', descricao: 'Passo anterior', teclas: ['←'], letras: ['k', 'h'] },
	{
		comando: 'proxima-dezena',
		descricao: 'Próxima dezena',
		teclas: ['↓', 'PageDown'],
		letras: ['J']
	},
	{
		comando: 'dezena-anterior',
		descricao: 'Dezena anterior',
		teclas: ['↑', 'PageUp'],
		letras: ['K']
	},
	{ comando: 'inicio', descricao: 'Início', teclas: ['Home'], letras: ['gg'] },
	{ comando: 'fim', descricao: 'Fim', teclas: ['End'], letras: ['G'] },
	{
		comando: 'alternar-texto',
		descricao: 'Mostrar ou ocultar o texto das orações',
		teclas: [],
		letras: ['t']
	},
	{ comando: 'ajuda', descricao: 'Ajuda de atalhos', teclas: [], letras: ['?'] },
	{ comando: 'sair', descricao: 'Fechar ou voltar', teclas: ['Esc'], letras: [] }
];
