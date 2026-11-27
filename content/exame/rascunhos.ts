// RASCUNHOS ASSISTIDOS — itens novos do Exame, redigidos com IA a partir da matriz de tópicos
// (docs/editorial/exame-matriz.md), sem copiar frases dos PDFs de referência (ADR-0003, item 6).
//
// Nada aqui é publicado enquanto `status` não for 'aprovado' por um dos responsáveis
// (garamogger ou williamdasilvazoia8-blip). A marcação `grave` é só uma PROPOSTA.
// Cânones citados conferidos em vatican.va em 26/11/2026 (ver SOURCES.md).
import type { ItemExame, SecaoExame } from '#lib/modules/exame/domain/tipos.ts';

const PROCEDENCIA = { origem: 'rascunho-assistido (CHG-0005)' } as const;

const rascunho = {
	origem: 'rascunho-assistido',
	procedencia: PROCEDENCIA,
	status: 'em-revisao'
} as const;

/** Seção nova proposta: os preceitos da Igreja que a base ainda não cobre (a Missa já está no 3º). */
export const SECOES_RASCUNHO = [
	{
		id: 'ex-preceitos',
		numero: '✠',
		nome: 'Os preceitos da Igreja',
		titulo: 'Mandamentos da Igreja',
		enunciado: 'O que a Igreja pede a todos os fiéis, além da Missa aos domingos e dias santos.',
		itens: [
			{
				id: 'ex-preceitos-1',
				pergunta: 'Passei mais de um ano sem me confessar, tendo pecados graves a confessar?',
				acusacao: 'Passei mais de um ano sem confessar pecados graves',
				nota: 'A obrigação de confessar ao menos uma vez por ano diz respeito aos pecados graves (cân. 989).',
				grave: true,
				...rascunho
			},
			{
				id: 'ex-preceitos-2',
				pergunta: 'Deixei de comungar ao menos uma vez no ano, no tempo pascal, por descuido?',
				acusacao: 'Deixei de comungar no tempo pascal',
				nota: 'A Igreja pede a Comunhão ao menos uma vez por ano, no tempo pascal, salvo justa causa (cân. 920).',
				grave: true,
				...rascunho
			},
			{
				id: 'ex-preceitos-3',
				pergunta:
					'Deixei, sem motivo justo, de guardar o jejum ou a abstinência nos dias estabelecidos pela Igreja?',
				acusacao: 'Deixei de guardar o jejum ou a abstinência de preceito',
				nota: 'A abstinência obriga a partir dos 14 anos completos; o jejum, dos 18 anos até o início dos 60 (cân. 97 e 1252). Os bispos podem determinar outras formas de penitência (cân. 1253). Na dúvida sobre a própria obrigação, pergunte ao confessor.',
				grave: false,
				...rascunho
			},
			{
				id: 'ex-preceitos-4',
				pergunta:
					'Deixei de ajudar a Igreja em suas necessidades, conforme as minhas possibilidades?',
				acusacao: 'Deixei de ajudar a Igreja em suas necessidades',
				grave: false,
				...rascunho
			}
		],
		...rascunho
	}
] as const satisfies readonly SecaoExame[];

/** Itens novos propostos para seções da base, identificadas por `secao`. */
export const ITENS_RASCUNHO = [
	{
		secao: 'ex-m3',
		id: 'ex-m3-r1',
		pergunta: 'Deixei de cumprir a penitência da última confissão?',
		acusacao: 'Deixei de cumprir a penitência',
		nota: 'Se esqueceu sem culpa, não é pecado: reze algo equivalente ou pergunte ao confessor.',
		grave: false,
		...rascunho
	},
	{
		secao: 'ex-m4',
		id: 'ex-m4-r1',
		pergunta:
			'Sendo pai ou mãe, dei mau exemplo aos meus filhos, ou descuidei de corrigi-los e de saber com quem andam e o que veem?',
		acusacao: 'Descuidei do exemplo, da correção ou da vigilância com meus filhos',
		grave: false,
		estados: ['pais'],
		...rascunho
	},
	{
		secao: 'ex-m4',
		id: 'ex-m4-r2',
		pergunta: 'Fui frio, duro ou desleal com meu cônjuge, ou deixei de cuidar do nosso casamento?',
		acusacao: 'Faltei com o amor e o cuidado devidos ao meu cônjuge',
		grave: false,
		estados: ['casados'],
		...rascunho
	},
	{
		secao: 'ex-m5',
		id: 'ex-m5-r1',
		pergunta: 'Comi ou bebi em excesso, por falta de domínio de mim mesmo?',
		acusacao: 'Comi ou bebi em excesso',
		grave: false,
		...rascunho
	},
	{
		secao: 'ex-m6',
		id: 'ex-m6-r1',
		pergunta:
			'Sendo casado, recusei ao meu cônjuge, sem motivo sério, a intimidade própria do casamento?',
		acusacao: 'Recusei sem motivo sério a intimidade conjugal',
		nota: 'Doença, cansaço real e outros motivos sérios justificam a recusa.',
		grave: false,
		estados: ['casados'],
		...rascunho
	},
	{
		secao: 'ex-m7',
		id: 'ex-m7-r1',
		pergunta: 'No trabalho, enganei no horário, nas contas ou no que me cabia fazer?',
		acusacao: 'Fui desonesto no trabalho',
		nota: 'Se o prejuízo foi considerável, diga o valor aproximado.',
		grave: false,
		estados: ['trabalho'],
		...rascunho
	},
	{
		secao: 'ex-m7',
		id: 'ex-m7-r2',
		pergunta: 'Apeguei-me ao dinheiro e aos bens a ponto de esquecer Deus ou os outros?',
		acusacao: 'Fui apegado ao dinheiro e aos bens',
		grave: false,
		...rascunho
	}
] as const satisfies readonly (ItemExame & { readonly secao: string })[];
