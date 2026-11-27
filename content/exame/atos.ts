// Conteúdo importado de garamogger/terco-diario (commit e4cbfd6) — ver SOURCES.md.
// Gerado por extração estática; edite à mão daqui em diante (esta pasta é a fonte única).
import type { OracaoExame } from '#lib/modules/exame/domain/tipos.ts';

/** Confiteor e atos de contrição (Seleta do terco-diario, "Penitência e confissão"). */
export const ATOS = [
	{
		id: 'confiteor',
		nome: 'Confesso a Deus (Confiteor)',
		texto:
			'Confesso a Deus todo-poderoso e a vós, irmãos e irmãs, que pequei muitas vezes por pensamentos e palavras, atos e omissões, por minha culpa, minha tão grande culpa. E peço à Virgem Maria, aos anjos e santos e a vós, irmãos e irmãs, que rogueis por mim a Deus, Nosso Senhor.',
		procedencia: {
			origem: 'terco-diario@e4cbfd6'
		},
		status: 'aprovado'
	},
	{
		id: 'contricao',
		nome: 'Ato de contrição — «Meu Deus, eu me arrependo»',
		texto:
			'Meu Deus, eu me arrependo de todo o coração de todos os meus pecados e os detesto, porque, pecando, mereci as penas do inferno e perdi o Céu, mas sobretudo porque Vos ofendi, a Vós, sumo Bem, digno de ser amado sobre todas as coisas. Proponho firmemente, com o auxílio da Vossa graça, satisfazer pelos meus pecados, emendar minha vida e fugir das ocasiões de pecado. Senhor, tende piedade de mim, pecador. Amém.',
		procedencia: {
			origem: 'terco-diario@e4cbfd6'
		},
		status: 'aprovado'
	},
	{
		id: 'contricao-senhor',
		nome: 'Ato de contrição — «Senhor meu Jesus Cristo»',
		texto:
			'Senhor meu Jesus Cristo, Deus e homem verdadeiro, Criador e Redentor meu, por serdes Vós quem sois, sumamente bom e digno de ser amado sobre todas as coisas, e porque Vos amo e estimo, pesa-me, Senhor, de todo o meu coração, de Vos ter ofendido; e proponho firmemente, ajudado com os auxílios da Vossa divina graça, emendar-me e nunca mais Vos tornar a ofender; e espero alcançar o perdão das minhas culpas pela Vossa infinita misericórdia. Amém.',
		procedencia: {
			origem: 'terco-diario@e4cbfd6'
		},
		status: 'aprovado'
	},
	{
		id: 'contricao-breve',
		nome: 'Ato de contrição breve',
		texto:
			'Meu Deus, porque sois infinitamente bom e digno de ser amado sobre todas as coisas, pesa-me de Vos ter ofendido. Proponho firmemente, com o auxílio da Vossa graça, emendar-me e nunca mais Vos tornar a ofender.',
		procedencia: {
			origem: 'terco-diario@e4cbfd6'
		},
		status: 'aprovado'
	}
] as const satisfies readonly OracaoExame[];
