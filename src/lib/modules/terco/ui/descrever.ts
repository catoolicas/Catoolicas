import { jaculatoria, oracao } from '../comum.ts';
import type { Passo } from '../domain/sequencia.ts';
import type { Serie, SerieDeMisterios } from '../domain/tipos.ts';

const SINGULAR: Record<Serie, string> = {
	gozosos: 'gozoso',
	luminosos: 'luminoso',
	dolorosos: 'doloroso',
	gloriosos: 'glorioso'
};

/**
 * Descrição curta do passo, em português (idioma da interface), para a região
 * `aria-live` anunciada a leitores de tela a cada avanço.
 */
export function descreverPasso(passo: Passo, series: readonly SerieDeMisterios[]): string {
	if (passo.tipo === 'oracao') {
		const titulo = oracao(passo.oracao).titulo.pt;
		return passo.vezes > 1 ? `${titulo}, ${passo.vez} de ${passo.vezes}` : titulo;
	}
	if (passo.tipo === 'oracao-final-serie') {
		const serie = series.find((s) => s.id === passo.serie);
		return `Oração final${serie ? `, ${serie.nome.pt}` : ''}`;
	}
	const misterio = `${passo.dezena.misterio + 1}º mistério ${SINGULAR[passo.dezena.serie]}`;
	switch (passo.tipo) {
		case 'anuncio': {
			const serie = series.find((s) => s.id === passo.dezena.serie);
			const titulo = serie?.misterios[passo.dezena.misterio]?.titulo.pt;
			return titulo ? `${misterio}: ${titulo}` : misterio;
		}
		case 'pai-nosso':
			return `${misterio}, Pai-Nosso`;
		case 'ave-maria':
			return `${misterio}, Ave-Maria ${passo.conta} de 10`;
		case 'gloria':
			return `${misterio}, Glória`;
		case 'jaculatoria':
			return `${misterio}, jaculatória: ${jaculatoria(passo.jaculatoria).devocao.pt}`;
		case 'fecho-dezena':
			return `${misterio}, fecho da dezena`;
	}
}
