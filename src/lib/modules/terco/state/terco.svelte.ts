import { conteudoPara } from '../comum.ts';
import {
	anterior,
	dezenaAnterior,
	fim,
	inicio,
	passoEquivalente,
	progresso,
	proximaDezena,
	proximo
} from '../domain/navegacao.ts';
import { montarSequencia, type ConfigTerco, type Passo } from '../domain/sequencia.ts';
import type { Comando } from '../domain/teclado.ts';
import type { SerieDeMisterios } from '../domain/tipos.ts';
import type { Preferencias } from './preferencias.ts';

/**
 * Estado de uma página do Terço. Criado por página (nunca como singleton de módulo):
 * cada visita começa do zero, e nada vaza entre páginas.
 */
export class EstadoTerco {
	readonly series: readonly SerieDeMisterios[];
	readonly #base: Omit<ConfigTerco, 'jaculatorias' | 'meditacoesMontfort' | 'clausulas'>;
	readonly #conteudo;

	indice = $state(0);
	preferencias: Preferencias = $state() as Preferencias;

	readonly passos: Passo[] = $derived.by(() => montarSequencia(this.#config(), this.#conteudo));
	readonly passo: Passo | undefined = $derived(this.passos[this.indice]);
	readonly progresso = $derived(progresso(this.passos, this.indice));

	constructor(
		series: readonly SerieDeMisterios[],
		base: Omit<ConfigTerco, 'jaculatorias' | 'meditacoesMontfort' | 'clausulas'>,
		preferencias: Preferencias
	) {
		this.series = series;
		this.#base = base;
		this.#conteudo = conteudoPara(series);
		this.preferencias = preferencias;
	}

	#config(): ConfigTerco {
		return {
			...this.#base,
			jaculatorias: this.preferencias.jaculatorias,
			meditacoesMontfort: this.preferencias.meditacoesMontfort,
			clausulas: this.preferencias.clausulas
		};
	}

	/** Aplica um comando de navegação. Devolve `true` se o comando é de navegação. */
	navegar(comando: Comando): boolean {
		const p = this.passos;
		const i = this.indice;
		const destino: Partial<Record<Comando, number>> = {
			proximo: proximo(p, i),
			anterior: anterior(p, i),
			'proxima-dezena': proximaDezena(p, i),
			'dezena-anterior': dezenaAnterior(p, i),
			inicio: inicio(),
			fim: fim(p)
		};
		const novo = destino[comando];
		if (novo === undefined) return false;
		this.indice = novo;
		return true;
	}

	irPara(indice: number): void {
		this.indice = Math.min(Math.max(0, Math.trunc(indice)), this.passos.length - 1);
	}

	/** Troca preferências mantendo a posição equivalente na nova sequência. */
	atualizar(parcial: Partial<Preferencias>): void {
		const antigos = this.passos;
		const indice = this.indice;
		this.preferencias = { ...this.preferencias, ...parcial };
		this.indice = passoEquivalente(antigos, indice, this.passos);
	}
}
