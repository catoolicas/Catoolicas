// Conteúdo importado de garamogger/terco-diario (commit e4cbfd6) — ver SOURCES.md.
// Gerado por extração estática; edite à mão daqui em diante (esta pasta é a fonte única).
import type { OracaoExame, Orientacao, Roteiro } from '#lib/modules/exame/domain/tipos.ts';

/** Oração antes do exame. */
export const ORACAO_INICIAL = {
	id: 'peca-luz',
	nome: 'Peça luz.',
	texto:
		'Vinde, Espírito Santo: iluminai a minha consciência, para que eu conheça os meus pecados com verdade e sem medo, e deles me arrependa por amor de Vós. Amém.',
	procedencia: {
		origem: 'terco-diario@e4cbfd6'
	},
	status: 'aprovado'
} as const satisfies OracaoExame;

/** Princípios exibidos antes do exame ("Antes de começar"). */
export const ORIENTACOES = [
	{
		destaque: 'Um exame, uma vez.',
		texto:
			'Cerca de quinze minutos, sem voltar atrás para conferir. Este roteiro é curto de propósito: a maior parte das respostas será “não”.'
	},
	{
		destaque: 'Pecado mortal pede três coisas juntas:',
		texto:
			'matéria grave, pleno conhecimento e consentimento deliberado (CIC 1857). Faltando uma, não é pecado mortal.'
	},
	{
		destaque: 'O que vem à mente sem ser querido',
		texto: 'e é afastado não é pecado: é tentação vencida, e há mérito nisso.'
	},
	{
		destaque: 'Na dúvida se consentiu, não presuma pecado grave.',
		texto: 'Siga em paz, ou diga a dúvida ao confessor em uma frase.'
	},
	{
		destaque: 'Os pecados veniais não são de confissão obrigatória.',
		texto: 'Confessá-los é muito bom, mas não é condição para receber o perdão (CIC 1458).'
	},
	{
		destaque: 'O esquecido sem culpa está perdoado.',
		texto: 'Se lembrar depois, diga-o na próxima confissão; a absolvição já recebida valeu.'
	},
	{
		destaque: 'Se você tende ao escrúpulo,',
		texto: 'obedeça ao seu confessor mais do que a qualquer roteiro, inclusive este.'
	}
] as const satisfies readonly Orientacao[];

/** Textos do resumo e do roteiro do confessionário. */
export const ROTEIRO = {
	nenhumItem:
		'Nenhum item marcado. Dê graças a Deus. Se quiser se confessar mesmo assim, pode acusar uma falta leve, ou um pecado da vida passada já perdoado, e receber a graça do sacramento.',
	tituloGraves: 'Primeiro: o que pode ser matéria grave',
	tituloOutras: 'Depois: outras faltas',
	tituloConfessionario: 'No confessionário',
	confessionario: [
		'“Abençoe-me, padre, porque pequei. Minha última confissão foi há…” Diga cada item em uma frase, com o número aproximado quando for grave. Sem nomes, sem detalhes, sem justificativas. Se travar: “Padre, pode me ajudar com perguntas?”',
		'Ao terminar: “Destes e de todos os pecados da minha vida, peço perdão a Deus e penitência ao senhor.”'
	],
	tituloAto: 'Ato de contrição',
	depois: 'Depois da confissão, cumpra a penitência e não volte a examinar o que já foi perdoado.',
	procedencia: {
		origem: 'terco-diario@e4cbfd6'
	},
	status: 'aprovado'
} as const satisfies Roteiro;
