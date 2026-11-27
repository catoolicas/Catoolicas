// Textos da interface do exame no terco-diario (commit e4cbfd6) — ver SOURCES.md.
// Copiados sem alteração e conferidos por docs/changes/CHG-0005/conferir-exame.mjs.
import type { TextosInterface } from '#lib/modules/exame/domain/tipos.ts';

export const TEXTOS = {
	titulo: 'Exame de consciência',
	subtitulo: 'Preparação para a confissão',
	antesDeComecar: 'Antes de começar',
	minhaLista: 'Minha lista',
	naoGravado:
		'Nada fica gravado no navegador: ao fechar ou recarregar a página, as marcações se apagam.',
	destruirFolha: 'Destrua esta folha depois da confissão.',
	rotuloVezes: 'Quantas vezes, aproximadamente',
	procedencia: {
		origem: 'terco-diario@e4cbfd6'
	},
	status: 'aprovado'
} as const satisfies TextosInterface;
