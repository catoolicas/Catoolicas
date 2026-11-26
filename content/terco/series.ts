// Conteúdo importado de garamogger/terco-diario (commit e4cbfd6) — ver SOURCES.md.
// Cabeçalho de cada série; os mistérios ficam em ./misterios/<serie>.ts.
import type { CabecalhoSerie } from '#lib/modules/terco/domain/tipos.ts';

export const SERIES = [
	{
		id: 'gozosos',
		nome: {
			pt: 'Mistérios Gozosos',
			la: 'Mysteria Gaudiosa'
		},
		tema: {
			pt: 'A alegria da Encarnação',
			la: 'Gaudium Incarnationis'
		},
		oracaoFinal: {
			pt: 'Graças aos Mistérios Gozosos, descei às nossas almas e fazei-as realmente santas.',
			la: 'Gratia Mysteriorum Gaudiosorum, descende in animas nostras et fac eas vere sanctas.'
		},
		procedencia: {
			origem: 'terco-diario@e4cbfd6',
			fonte: 'O Santo Rosário Meditado — método de São Luís Maria Grignion de Montfort'
		},
		status: 'aprovado'
	},
	{
		id: 'luminosos',
		nome: {
			pt: 'Mistérios Luminosos',
			la: 'Mysteria Luminosa'
		},
		tema: {
			pt: 'A vida pública do Senhor',
			la: 'Vita publica Domini'
		},
		oracaoFinal: {
			pt: 'Graças aos Mistérios Luminosos, descei às nossas almas e fazei-as realmente convertidas.',
			la: 'Gratia Mysteriorum Luminosorum, descende in animas nostras et fac eas vere conversas.'
		},
		aviso: {
			pt: 'Estes cinco mistérios foram propostos por São João Paulo II em 2002 e não fazem parte do método de dez pontos de Montfort, falecido em 1716. Em vez de inventar pontos que as fontes não têm, cada dezena traz uma frase-guia breve, repetida ou variada mentalmente a cada Ave-Maria, conforme o método abreviado tradicional.',
			la: 'Haec quinque mysteria a Sancto Ioanne Paulo II anno 2002 proposita sunt nec ad methodum decem punctorum Montfortii, anno 1716 defuncti, pertinent. Loco punctorum quae fontes non habent fingendorum, singulae decades brevem sententiam ducem praebent, ad singulas Ave Maria mente repetendam vel variandam, secundum modum brevem traditum.'
		},
		procedencia: {
			origem: 'terco-diario@e4cbfd6',
			fonte: 'O Santo Rosário Meditado — método de São Luís Maria Grignion de Montfort'
		},
		status: 'aprovado'
	},
	{
		id: 'dolorosos',
		nome: {
			pt: 'Mistérios Dolorosos',
			la: 'Mysteria Dolorosa'
		},
		tema: {
			pt: 'A Paixão do Senhor',
			la: 'Passio Domini'
		},
		oracaoFinal: {
			pt: 'Graças aos Mistérios Dolorosos, descei às nossas almas e fazei-as realmente pacientes.',
			la: 'Gratia Mysteriorum Dolorosorum, descende in animas nostras et fac eas vere patientes.'
		},
		procedencia: {
			origem: 'terco-diario@e4cbfd6',
			fonte: 'O Santo Rosário Meditado — método de São Luís Maria Grignion de Montfort'
		},
		status: 'aprovado'
	},
	{
		id: 'gloriosos',
		nome: {
			pt: 'Mistérios Gloriosos',
			la: 'Mysteria Gloriosa'
		},
		tema: {
			pt: 'O triunfo de Cristo e de Maria',
			la: 'Triumphus Christi et Mariae'
		},
		oracaoFinal: {
			pt: 'Graças aos Mistérios Gloriosos, descei às nossas almas e fazei-as eternamente felizes.',
			la: 'Gratia Mysteriorum Gloriosorum, descende in animas nostras et fac eas aeternaliter beatas.'
		},
		procedencia: {
			origem: 'terco-diario@e4cbfd6',
			fonte: 'O Santo Rosário Meditado — método de São Luís Maria Grignion de Montfort'
		},
		status: 'aprovado'
	}
] as const satisfies readonly CabecalhoSerie[];
