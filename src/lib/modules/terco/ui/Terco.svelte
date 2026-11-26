<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { JACULATORIAS, PADROES } from '../comum.ts';
	import { dataLocal } from '../domain/calendario.ts';
	import { resolverTecla, type Comando } from '../domain/teclado.ts';
	import type { SerieDeMisterios } from '../domain/tipos.ts';
	import {
		apagarDados,
		armazenamentoLocal,
		gravarPreferencias,
		gravarProgresso,
		lerPreferencias,
		lerProgresso,
		preferenciasPadrao,
		type Preferencias
	} from '../state/preferencias.ts';
	import { EstadoTerco } from '../state/terco.svelte.ts';
	import AjudaAtalhos from './AjudaAtalhos.svelte';
	import ContasRosario from './ContasRosario.svelte';
	import Controles from './Controles.svelte';
	import { descreverPasso } from './descrever.ts';
	import PainelPreferencias from './PainelPreferencias.svelte';
	import PassoAtual from './PassoAtual.svelte';

	type Props = {
		series: readonly SerieDeMisterios[];
		/** Identifica a página para o progresso do dia: a série ou "rosario". */
		pagina: string;
	};
	let { series, pagina }: Props = $props();

	const jaculatoriasValidas = new Set(JACULATORIAS.map((j) => j.id));
	const padrao = preferenciasPadrao(PADROES.jaculatorias);
	// As props não mudam durante a vida da página (cada rota cria a sua).
	// svelte-ignore state_referenced_locally
	const estado = new EstadoTerco(
		series,
		{ series: series.map((s) => s.id), abertura: PADROES.abertura, finais: PADROES.finais },
		padrao
	);

	let hidratado = $state(false);
	let data = $state(new Date());
	let anuncio = $state('');
	let dialogoPreferencias: HTMLDialogElement | undefined = $state();
	let dialogoAjuda: HTMLDialogElement | undefined = $state();
	let teclaAnterior = '';

	const serieAtual = $derived(
		estado.passo && 'dezena' in estado.passo ? estado.passo.dezena.serie : series[0]?.id
	);
	const ultimo = $derived(estado.indice === estado.passos.length - 1);

	onMount(() => {
		// Só no navegador: data do visitante, preferências e progresso deste aparelho.
		data = new Date();
		const armazenamento = armazenamentoLocal();
		estado.atualizar(lerPreferencias(armazenamento, padrao, jaculatoriasValidas));
		const salvo = lerProgresso(armazenamento, dataLocal(data), pagina);
		if (salvo !== null) estado.irPara(salvo);
		hidratado = true;
	});

	function executar(comando: Comando) {
		if (estado.navegar(comando)) {
			// Nada é gravado só por abrir a página: só depois de a pessoa avançar.
			gravarProgresso(armazenamentoLocal(), dataLocal(data), pagina, estado.indice);
			if (estado.passo) anuncio = descreverPasso(estado.passo, series);
			return;
		}
		if (comando === 'alternar-texto')
			mudarPreferencias({ textoCompleto: !estado.preferencias.textoCompleto });
		else if (comando === 'ajuda') dialogoAjuda?.showModal();
		else if (comando === 'sair') void goto(resolve('terco/'));
	}

	function mudarPreferencias(parcial: Partial<Preferencias>) {
		estado.atualizar(parcial);
		gravarPreferencias(armazenamentoLocal(), estado.preferencias);
	}

	function apagar() {
		apagarDados(armazenamentoLocal());
		estado.atualizar(padrao);
		estado.irPara(0);
	}

	function aoTeclar(evento: KeyboardEvent) {
		if (!hidratado || evento.defaultPrevented) return;
		if (document.querySelector('dialog[open]')) return;
		const alvo = evento.target instanceof HTMLElement ? evento.target : null;
		if (alvo?.closest('input, textarea, select, [contenteditable]')) return;
		if ((evento.key === ' ' || evento.key === 'Enter') && alvo?.closest('button, a, summary'))
			return;
		const comando = resolverTecla(evento, {
			letras: estado.preferencias.atalhosLetras,
			teclaAnterior
		});
		teclaAnterior = evento.key === 'g' && teclaAnterior !== 'g' ? 'g' : '';
		if (!comando) return;
		evento.preventDefault();
		executar(comando);
	}
</script>

<svelte:window onkeydown={aoTeclar} />

<div class="terco" data-serie={serieAtual} data-hidratado={hidratado ? '' : undefined}>
	<noscript>
		<p class="rubrica">O terço interativo precisa de JavaScript ativado neste navegador.</p>
	</noscript>

	<div class="colunas">
		<aside class="trilho" aria-label="Contas">
			<ContasRosario passos={estado.passos} indice={estado.indice} />
		</aside>

		<div class="principal">
			{#if estado.passo}
				<PassoAtual
					passo={estado.passo}
					{series}
					idioma={estado.preferencias.idioma}
					textoCompleto={estado.preferencias.textoCompleto}
					{data}
					{ultimo}
				/>
			{/if}

			<Controles
				progresso={estado.progresso}
				textoCompleto={estado.preferencias.textoCompleto}
				aoComandar={executar}
				aoAbrirPreferencias={() => dialogoPreferencias?.showModal()}
			/>
		</div>
	</div>

	<p class="visualmente-oculto" aria-live="polite" aria-atomic="true">{anuncio}</p>

	<dialog bind:this={dialogoPreferencias} aria-labelledby="titulo-preferencias">
		<PainelPreferencias
			preferencias={estado.preferencias}
			aoMudar={mudarPreferencias}
			aoApagar={apagar}
			aoFechar={() => dialogoPreferencias?.close()}
		/>
	</dialog>

	<dialog bind:this={dialogoAjuda} aria-labelledby="titulo-ajuda">
		<AjudaAtalhos
			letrasLigadas={estado.preferencias.atalhosLetras}
			aoFechar={() => dialogoAjuda?.close()}
		/>
	</dialog>
</div>

<style>
	.colunas {
		display: grid;
		gap: var(--espaco-4);
	}

	.principal {
		display: grid;
		gap: var(--espaco-4);
		min-width: 0;
	}

	@media (min-width: 960px) {
		.colunas {
			grid-template-columns: 14rem minmax(0, 1fr);
			align-items: start;
		}

		.trilho {
			position: sticky;
			top: var(--espaco-4);
		}
	}

	dialog {
		width: min(36rem, calc(100vw - 2 * var(--margem-lateral)));
		max-height: calc(100vh - 2rem);
		padding: var(--espaco-4);
		border: 1px solid var(--cor-filete);
		border-radius: 8px;
		background: var(--cor-papel);
		color: var(--cor-tinta);
	}

	dialog::backdrop {
		background: rgb(0 0 0 / 0.45);
	}
</style>
