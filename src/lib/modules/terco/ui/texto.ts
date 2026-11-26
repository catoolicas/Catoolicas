import type { Idioma, Texto } from '../domain/tipos.ts';

export type TextoExibido = {
	readonly conteudo: string;
	/** Valor para o atributo `lang` (leitores de tela pronunciam conforme o idioma). */
	readonly lang: 'pt-BR' | 'la';
	/** Latim marcado na origem como tradução não oficial. */
	readonly naoOficial: boolean;
};

/** Escolhe o idioma pedido, com o português como reserva quando não há latim. */
export function exibir(texto: Texto, idioma: Idioma): TextoExibido {
	if (idioma === 'la' && texto.la) {
		return { conteudo: texto.la, lang: 'la', naoOficial: texto.laNaoOficial === true };
	}
	return { conteudo: texto.pt, lang: 'pt-BR', naoOficial: false };
}
