// Conteúdo importado de garamogger/terco-diario (commit e4cbfd6) — ver SOURCES.md.
// Gerado por extração estática; edite à mão daqui em diante (esta pasta é a fonte única).
import type { SecaoExame } from '#lib/modules/exame/domain/tipos.ts';

export const SECOES = [
	{
		id: 'ex-m1',
		numero: '1',
		nome: 'Amar a Deus',
		titulo: '1º Mandamento',
		enunciado: 'Amar a Deus sobre todas as coisas.',
		itens: [
			{
				id: 'ex-m1-1',
				pergunta:
					'Neguei ou abandonei deliberadamente a fé, ou alimentei de propósito dúvidas contra ela?',
				acusacao: 'Neguei a fé, ou alimentei de propósito dúvidas contra ela',
				nota: 'Dúvida que aparece e você leva a sério, procurando resposta, não é pecado.',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m1-2',
				pergunta:
					'Consultei horóscopo dando-lhe crédito, tarô, cartomante, centro espírita, ou recorri a “trabalhos” e simpatias?',
				acusacao: 'Recorri a adivinhação, espiritismo ou superstição',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m1-3',
				pergunta:
					'Desesperei do perdão de Deus, ou pequei contando que Ele perdoaria de qualquer jeito?',
				acusacao: 'Desesperei do perdão de Deus, ou abusei da sua misericórdia',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m1-4',
				pergunta: 'Descuidei da oração, rezando só quando precisava de algo?',
				acusacao: 'Descuidei da oração',
				grave: false,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			}
		],
		origem: 'base',
		procedencia: {
			origem: 'terco-diario@e4cbfd6'
		},
		status: 'aprovado'
	},
	{
		id: 'ex-m2',
		numero: '2',
		nome: 'O santo nome',
		titulo: '2º Mandamento',
		enunciado: 'Não tomar seu santo nome em vão.',
		itens: [
			{
				id: 'ex-m2-1',
				pergunta: 'Blasfemei — falei com ódio ou desprezo contra Deus, Nossa Senhora ou os santos?',
				acusacao: 'Blasfemei',
				nota: 'Palavrão ou desabafo na dor, sem intenção de ofender a Deus, não é blasfêmia.',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m2-2',
				pergunta: 'Jurei em falso, tomando Deus por testemunha de uma mentira?',
				acusacao: 'Jurei em falso',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m2-3',
				pergunta: 'Usei o nome de Deus à toa, ou deixei de cumprir uma promessa feita a Deus?',
				acusacao: 'Usei o nome de Deus à toa, ou faltei a uma promessa',
				grave: false,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			}
		],
		origem: 'base',
		procedencia: {
			origem: 'terco-diario@e4cbfd6'
		},
		status: 'aprovado'
	},
	{
		id: 'ex-m3',
		numero: '3',
		nome: 'Domingo e sacramentos',
		titulo: '3º Mandamento',
		enunciado: 'Guardar domingos e festas de guarda.',
		itens: [
			{
				id: 'ex-m3-1',
				pergunta: 'Faltei à Missa no domingo ou em dia santo por minha culpa?',
				acusacao: 'Faltei à Missa de preceito por minha culpa',
				nota: 'Doença, cuidado de criança ou de doente, trabalho inevitável ou impossibilidade real dispensam. Nesses casos não há culpa.',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m3-2',
				pergunta: 'Comunguei sabendo que estava em pecado grave?',
				acusacao: 'Comunguei em pecado grave',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m3-3',
				pergunta: 'Escondi de propósito um pecado grave numa confissão?',
				acusacao: 'Escondi de propósito um pecado grave na confissão',
				nota: 'Esquecer não é esconder. Se foi esquecimento, a confissão valeu; basta dizê-lo agora.',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m3-4',
				pergunta: 'Fiquei na Missa distraído de propósito, ou me comportei sem respeito na igreja?',
				acusacao: 'Fiquei na Missa distraído de propósito, ou sem respeito',
				nota: 'Distração que vem sem ser querida não é pecado.',
				grave: false,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			}
		],
		origem: 'base',
		procedencia: {
			origem: 'terco-diario@e4cbfd6'
		},
		status: 'aprovado'
	},
	{
		id: 'ex-m4',
		numero: '4',
		nome: 'Família e autoridade',
		titulo: '4º Mandamento',
		enunciado: 'Honrar pai e mãe.',
		itens: [
			{
				id: 'ex-m4-1',
				pergunta: 'Abandonei pais, filhos ou cônjuge numa necessidade séria, podendo ajudar?',
				acusacao: 'Abandonei familiares em necessidade séria',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m4-2',
				pergunta: 'Sendo pai ou mãe, descuidei de batizar meus filhos ou de educá-los na fé?',
				acusacao: 'Descuidei da educação dos meus filhos na fé',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m4-3',
				pergunta: 'Desrespeitei ou desobedeci aos meus pais ou superiores em coisas justas?',
				acusacao: 'Desrespeitei pais ou superiores',
				grave: false,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m4-4',
				pergunta: 'Tratei mal minha família com gritos, desprezo ou frieza?',
				acusacao: 'Tratei mal minha família',
				grave: false,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			}
		],
		origem: 'base',
		procedencia: {
			origem: 'terco-diario@e4cbfd6'
		},
		status: 'aprovado'
	},
	{
		id: 'ex-m5',
		numero: '5',
		nome: 'A vida',
		titulo: '5º Mandamento',
		enunciado: 'Não matar.',
		itens: [
			{
				id: 'ex-m5-1',
				pergunta: 'Pratiquei, aconselhei, paguei ou pressionei alguém a fazer um aborto?',
				acusacao: 'Participei de um aborto',
				nota: 'Todo sacerdote pode absolver este pecado. Diga-o simplesmente: não há o que temer.',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m5-2',
				pergunta: 'Agredi alguém, ou desejei seriamente a morte ou um mal grave a alguém?',
				acusacao: 'Agredi alguém, ou desejei-lhe um mal grave',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m5-3',
				pergunta: 'Embriaguei-me, ou usei drogas?',
				acusacao: 'Embriaguei-me ou usei drogas',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m5-4',
				pergunta:
					'Pus em risco a minha vida ou a de outros — por exemplo, dirigindo depois de beber?',
				acusacao: 'Pus vidas em risco por imprudência grave',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m5-5',
				pergunta: 'Recusei-me a perdoar, guardando ódio no coração?',
				acusacao: 'Recusei-me a perdoar e guardei ódio',
				nota: 'Sentir a mágoa não é pecado; perdoar é decisão da vontade, não sentimento, e não obriga a reatar uma convivência que faz mal.',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m5-6',
				pergunta: 'Perdi a paciência, fiquei com raiva ou guardei rancor?',
				acusacao: 'Perdi a paciência ou guardei rancor',
				grave: false,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			}
		],
		origem: 'base',
		procedencia: {
			origem: 'terco-diario@e4cbfd6'
		},
		status: 'aprovado'
	},
	{
		id: 'ex-m6',
		numero: '6',
		nome: 'A castidade',
		titulo: '6º e 9º Mandamentos',
		enunciado: 'Não pecar contra a castidade. Não desejar a mulher do próximo.',
		itens: [
			{
				id: 'ex-m6-1',
				pergunta: 'Consenti de propósito em pensamentos ou desejos impuros?',
				acusacao: 'Consenti em pensamentos ou desejos impuros',
				nota: 'O pensamento que vem sem ser querido e é afastado não é pecado: é tentação vencida.',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m6-2',
				pergunta: 'Vi pornografia?',
				acusacao: 'Vi pornografia',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m6-3',
				pergunta: 'Pequei contra a castidade sozinho?',
				acusacao: 'Pequei contra a castidade sozinho',
				nota: 'Confesse o ato e a frequência aproximada. O hábito, a imaturidade e a angústia podem diminuir a culpa (CIC 2352): o juízo é do confessor, não seu.',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m6-4',
				pergunta: 'Tive relações ou intimidades sexuais fora do matrimônio?',
				acusacao: 'Tive relações ou intimidades fora do matrimônio',
				nota: 'Se a outra pessoa era casada, diga só isso, sem nomes nem detalhes.',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m6-5',
				pergunta: 'Sendo casado, usei contracepção artificial?',
				acusacao: 'Usei contracepção artificial',
				nota: 'Os métodos naturais, usados por motivos justos, são lícitos.',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m6-6',
				pergunta: 'Usei linguagem ou piadas indecentes?',
				acusacao: 'Usei linguagem ou piadas indecentes',
				grave: false,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			}
		],
		origem: 'base',
		procedencia: {
			origem: 'terco-diario@e4cbfd6'
		},
		status: 'aprovado'
	},
	{
		id: 'ex-m7',
		numero: '7',
		nome: 'Os bens',
		titulo: '7º e 10º Mandamentos',
		enunciado: 'Não furtar. Não cobiçar as coisas alheias.',
		itens: [
			{
				id: 'ex-m7-1',
				pergunta: 'Roubei, fraudei ou deixei de pagar o que devia, em valor considerável?',
				acusacao: 'Roubei ou fraudei',
				nota: 'Diga o valor aproximado. Restituir, quando possível, faz parte do arrependimento.',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m7-2',
				pergunta: 'Explorei quem trabalha para mim, ou paguei injustamente?',
				acusacao: 'Explorei ou paguei injustamente quem trabalha para mim',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m7-3',
				pergunta: 'Trabalhei com desleixo, ou fiquei com coisas pequenas que não eram minhas?',
				acusacao: 'Trabalhei com desleixo, ou fiquei com coisas pequenas alheias',
				grave: false,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m7-4',
				pergunta: 'Fui indiferente a quem passava necessidade, podendo ajudar?',
				acusacao: 'Fui indiferente a quem passava necessidade',
				grave: false,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m7-5',
				pergunta: 'Invejei os bens ou o sucesso dos outros?',
				acusacao: 'Invejei os outros',
				grave: false,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			}
		],
		origem: 'base',
		procedencia: {
			origem: 'terco-diario@e4cbfd6'
		},
		status: 'aprovado'
	},
	{
		id: 'ex-m8',
		numero: '8',
		nome: 'A verdade',
		titulo: '8º Mandamento',
		enunciado: 'Não levantar falso testemunho.',
		itens: [
			{
				id: 'ex-m8-1',
				pergunta:
					'Caluniei alguém, ou destruí a reputação de alguém contando faltas graves sem necessidade?',
				acusacao: 'Caluniei ou destruí a reputação de alguém',
				grave: true,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m8-2',
				pergunta: 'Menti?',
				acusacao: 'Menti',
				nota: 'Se a mentira causou dano sério a alguém, diga-o.',
				grave: false,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m8-3',
				pergunta: 'Participei de fofocas, ou julguei os outros sem fundamento?',
				acusacao: 'Participei de fofocas, ou julguei sem fundamento',
				grave: false,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			}
		],
		origem: 'base',
		procedencia: {
			origem: 'terco-diario@e4cbfd6'
		},
		status: 'aprovado'
	},
	{
		id: 'ex-m9',
		numero: '✦',
		nome: 'Omissões',
		titulo: 'Por fim',
		enunciado: 'Aquele que sabe fazer o bem e não o faz, comete pecado (Tg 4,17).',
		itens: [
			{
				id: 'ex-m9-1',
				pergunta:
					'Deixei de fazer o bem que estava ao meu alcance — ajudar, consolar, pedir perdão?',
				acusacao: 'Deixei de fazer o bem que podia',
				grave: false,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			},
			{
				id: 'ex-m9-2',
				pergunta: 'Fui orgulhoso, vaidoso ou preguiçoso no cumprimento dos meus deveres?',
				acusacao: 'Fui orgulhoso, vaidoso ou preguiçoso',
				grave: false,
				origem: 'base',
				procedencia: {
					origem: 'terco-diario@e4cbfd6'
				},
				status: 'aprovado'
			}
		],
		origem: 'base',
		procedencia: {
			origem: 'terco-diario@e4cbfd6'
		},
		status: 'aprovado'
	}
] as const satisfies readonly SecaoExame[];
