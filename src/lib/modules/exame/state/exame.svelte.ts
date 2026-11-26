import { ATO_PADRAO } from '#lib/modules/exame/conteudo.ts';
import {
	filtrarPorEstados,
	montarResumo,
	soVisiveis,
	type Marcacoes,
	type Resumo
} from '#lib/modules/exame/domain/resumo.ts';
import type { EstadoDeVida, SecaoExame } from '#lib/modules/exame/domain/tipos.ts';

/**
 * Estado do Exame de consciência (ADR-0004).
 *
 * - Existe **só na memória da página**: criado pelo componente, nunca como singleton de módulo,
 *   e nunca copiado para armazenamento, URL, título, histórico ou rede.
 * - `limpar()` volta tudo ao início. A página chama ao apagar, ao sair (`pagehide`) e ao voltar
 *   do cache de navegação (`pageshow`).
 */
export class EstadoExame {
	readonly #todas: readonly SecaoExame[];

	marcacoes: Marcacoes = $state({});
	ultimaConfissao = $state('');
	estados: EstadoDeVida[] = $state([]);
	ato = $state(ATO_PADRAO);

	readonly secoes: SecaoExame[] = $derived.by(() => filtrarPorEstados(this.#todas, this.estados));
	readonly resumo: Resumo = $derived.by(() => montarResumo(this.secoes, this.marcacoes));
	readonly vazio = $derived(this.resumo.graves.length + this.resumo.outras.length === 0);

	constructor(secoes: readonly SecaoExame[]) {
		this.#todas = secoes;
	}

	marcado(id: string): boolean {
		return id in this.marcacoes;
	}

	marcar(id: string, sim: boolean): void {
		if (sim) this.marcacoes = { ...this.marcacoes, [id]: this.marcacoes[id] ?? '' };
		else
			this.marcacoes = Object.fromEntries(Object.entries(this.marcacoes).filter(([k]) => k !== id));
	}

	definirVezes(id: string, texto: string): void {
		if (this.marcado(id)) this.marcacoes = { ...this.marcacoes, [id]: texto };
	}

	alternarEstado(estado: EstadoDeVida, sim: boolean): void {
		this.estados = sim
			? [...this.estados.filter((e) => e !== estado), estado]
			: this.estados.filter((e) => e !== estado);
		this.marcacoes = soVisiveis(this.marcacoes, this.secoes);
	}

	limpar(): void {
		this.marcacoes = {};
		this.ultimaConfissao = '';
		this.estados = [];
		this.ato = ATO_PADRAO;
	}
}
