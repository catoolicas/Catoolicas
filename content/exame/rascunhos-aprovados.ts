// GERADO por `pnpm exame:rascunhos` a partir de content/exame/rascunhos.ts. Não edite à mão.
// Só os rascunhos aprovados: é o único arquivo de rascunhos que o site publicado importa.
import type { ItemRascunho } from '#lib/modules/exame/domain/montagem.ts';
import type { SecaoExame } from '#lib/modules/exame/domain/tipos.ts';

export const SECOES_APROVADAS: readonly SecaoExame[] = [
	{
		"id": "ex-preceitos",
		"numero": "✠",
		"nome": "Os preceitos da Igreja",
		"titulo": "Mandamentos da Igreja",
		"enunciado": "O que a Igreja pede a todos os fiéis, além da Missa aos domingos e dias santos.",
		"itens": [
			{
				"id": "ex-preceitos-1",
				"pergunta": "Passei mais de um ano sem me confessar, tendo pecados graves a confessar?",
				"acusacao": "Passei mais de um ano sem confessar pecados graves",
				"nota": "A obrigação de confessar ao menos uma vez por ano diz respeito aos pecados graves (cân. 989).",
				"grave": true,
				"origem": "rascunho-assistido",
				"procedencia": {
					"origem": "rascunho-assistido (CHG-0005)"
				},
				"status": "aprovado"
			},
			{
				"id": "ex-preceitos-2",
				"pergunta": "Deixei de comungar ao menos uma vez no ano, no tempo pascal, por descuido?",
				"acusacao": "Deixei de comungar no tempo pascal",
				"nota": "A Igreja pede a Comunhão ao menos uma vez por ano, no tempo pascal, salvo justa causa (cân. 920).",
				"grave": true,
				"origem": "rascunho-assistido",
				"procedencia": {
					"origem": "rascunho-assistido (CHG-0005)"
				},
				"status": "aprovado"
			},
			{
				"id": "ex-preceitos-3",
				"pergunta": "Deixei, sem motivo justo, de guardar o jejum ou a abstinência nos dias estabelecidos pela Igreja?",
				"acusacao": "Deixei de guardar o jejum ou a abstinência de preceito",
				"nota": "A abstinência obriga a partir dos 14 anos completos; o jejum, dos 18 anos até o início dos 60 (cân. 97 e 1252). Os bispos podem determinar outras formas de penitência (cân. 1253). Na dúvida sobre a própria obrigação, pergunte ao confessor.",
				"grave": false,
				"origem": "rascunho-assistido",
				"procedencia": {
					"origem": "rascunho-assistido (CHG-0005)"
				},
				"status": "aprovado"
			},
			{
				"id": "ex-preceitos-4",
				"pergunta": "Deixei de ajudar a Igreja em suas necessidades, conforme as minhas possibilidades?",
				"acusacao": "Deixei de ajudar a Igreja em suas necessidades",
				"grave": false,
				"origem": "rascunho-assistido",
				"procedencia": {
					"origem": "rascunho-assistido (CHG-0005)"
				},
				"status": "aprovado"
			}
		],
		"origem": "rascunho-assistido",
		"procedencia": {
			"origem": "rascunho-assistido (CHG-0005)"
		},
		"status": "aprovado"
	}
];

export const ITENS_APROVADOS: readonly ItemRascunho[] = [
	{
		"secao": "ex-m3",
		"id": "ex-m3-r1",
		"pergunta": "Deixei de cumprir a penitência da última confissão?",
		"acusacao": "Deixei de cumprir a penitência",
		"nota": "Se esqueceu sem culpa, não é pecado: reze algo equivalente ou pergunte ao confessor.",
		"grave": false,
		"origem": "rascunho-assistido",
		"procedencia": {
			"origem": "rascunho-assistido (CHG-0005)"
		},
		"status": "aprovado"
	},
	{
		"secao": "ex-m4",
		"id": "ex-m4-r1",
		"pergunta": "Sendo pai ou mãe, dei mau exemplo aos meus filhos, ou descuidei de corrigi-los e de saber com quem andam e o que veem?",
		"acusacao": "Descuidei do exemplo, da correção ou da vigilância com meus filhos",
		"grave": false,
		"estados": [
			"pais"
		],
		"origem": "rascunho-assistido",
		"procedencia": {
			"origem": "rascunho-assistido (CHG-0005)"
		},
		"status": "aprovado"
	},
	{
		"secao": "ex-m4",
		"id": "ex-m4-r2",
		"pergunta": "Fui frio, duro ou desleal com meu cônjuge, ou deixei de cuidar do nosso casamento?",
		"acusacao": "Faltei com o amor e o cuidado devidos ao meu cônjuge",
		"grave": false,
		"estados": [
			"casados"
		],
		"origem": "rascunho-assistido",
		"procedencia": {
			"origem": "rascunho-assistido (CHG-0005)"
		},
		"status": "aprovado"
	},
	{
		"secao": "ex-m5",
		"id": "ex-m5-r1",
		"pergunta": "Comi ou bebi em excesso, por falta de domínio de mim mesmo?",
		"acusacao": "Comi ou bebi em excesso",
		"grave": false,
		"origem": "rascunho-assistido",
		"procedencia": {
			"origem": "rascunho-assistido (CHG-0005)"
		},
		"status": "aprovado"
	},
	{
		"secao": "ex-m6",
		"id": "ex-m6-r1",
		"pergunta": "Sendo casado, recusei ao meu cônjuge, sem motivo sério, a intimidade própria do casamento?",
		"acusacao": "Recusei sem motivo sério a intimidade conjugal",
		"nota": "Doença, cansaço real e outros motivos sérios justificam a recusa.",
		"grave": false,
		"estados": [
			"casados"
		],
		"origem": "rascunho-assistido",
		"procedencia": {
			"origem": "rascunho-assistido (CHG-0005)"
		},
		"status": "aprovado"
	},
	{
		"secao": "ex-m7",
		"id": "ex-m7-r1",
		"pergunta": "No trabalho, enganei no horário, nas contas ou no que me cabia fazer?",
		"acusacao": "Fui desonesto no trabalho",
		"nota": "Se o prejuízo foi considerável, diga o valor aproximado.",
		"grave": false,
		"estados": [
			"trabalho"
		],
		"origem": "rascunho-assistido",
		"procedencia": {
			"origem": "rascunho-assistido (CHG-0005)"
		},
		"status": "aprovado"
	},
	{
		"secao": "ex-m7",
		"id": "ex-m7-r2",
		"pergunta": "Apeguei-me ao dinheiro e aos bens a ponto de esquecer Deus ou os outros?",
		"acusacao": "Fui apegado ao dinheiro e aos bens",
		"grave": false,
		"origem": "rascunho-assistido",
		"procedencia": {
			"origem": "rascunho-assistido (CHG-0005)"
		},
		"status": "aprovado"
	}
];
