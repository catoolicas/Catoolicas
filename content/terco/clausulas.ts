// Conteúdo importado de garamogger/terco-diario (commit e4cbfd6) — ver SOURCES.md.
// Gerado por extração estática; edite à mão daqui em diante (esta pasta é a fonte única).
import type { Clausulas } from '#lib/modules/terco/domain/tipos.ts';

/** Uma cláusula por mistério, acrescentada ao nome de Jesus em cada Ave-Maria. */
export const CLAUSULAS = {
	gozosos: [
		{
			pt: '…JESUS encarnado',
			la: '…IESUS incarnatus'
		},
		{
			pt: '…JESUS santificado',
			la: '…IESUS sanctificans'
		},
		{
			pt: '…JESUS nascido na pobreza',
			la: '…IESUS in paupertate natus'
		},
		{
			pt: '…JESUS sacrificado',
			la: '…IESUS immolatus'
		},
		{
			pt: '…JESUS, Santo entre os santos',
			la: '…IESUS, Sanctus inter sanctos'
		}
	],
	luminosos: [
		{
			pt: '…JESUS batizado no Rio Jordão',
			la: '…IESUS in Iordane baptizatus'
		},
		{
			pt: '…JESUS nas Bodas de Caná',
			la: '…IESUS in nuptiis Canae'
		},
		{
			pt: '…JESUS que anunciou o Reino de Deus',
			la: '…IESUS regnum Dei annuntians'
		},
		{
			pt: '…JESUS transfigurado no Tabor',
			la: '…IESUS in Thabor transfiguratus'
		},
		{
			pt: '…JESUS, na Eucaristia',
			la: '…IESUS in Eucharistia'
		}
	],
	dolorosos: [
		{
			pt: '…JESUS em Sua agonia',
			la: '…IESUS in agonia sua'
		},
		{
			pt: '…JESUS flagelado',
			la: '…IESUS flagellatus'
		},
		{
			pt: '…JESUS coroado de espinhos',
			la: '…IESUS spinis coronatus'
		},
		{
			pt: '…JESUS carregando Sua Cruz',
			la: '…IESUS crucem suam baiulans'
		},
		{
			pt: '…JESUS crucificado',
			la: '…IESUS crucifixus'
		}
	],
	gloriosos: [
		{
			pt: '…JESUS ressuscitando da morte',
			la: '…IESUS a mortuis resurgens'
		},
		{
			pt: '…JESUS subindo ao Céu',
			la: '…IESUS in caelum ascendens'
		},
		{
			pt: '…JESUS enchendo-nos com o Espírito Santo',
			la: '…IESUS nos Spiritu Sancto replens'
		},
		{
			pt: '…JESUS elevando Nossa Senhora ao Céu',
			la: '…IESUS Dominam nostram in caelum assumens'
		},
		{
			pt: '…JESUS coroando Nossa Senhora no Céu',
			la: '…IESUS Dominam nostram in caelo coronans'
		}
	]
} as const satisfies Clausulas;
