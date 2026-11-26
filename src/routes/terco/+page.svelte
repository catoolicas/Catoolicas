<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { CABECALHOS } from '#lib/modules/terco/carregar.ts';
	import { ESQUEMAS, PADROES } from '#content/terco/esquemas.ts';
	import { JACULATORIAS } from '#content/terco/jaculatorias.ts';
	import { serieDoDia } from '#lib/modules/terco/domain/calendario.ts';
	import type { Serie } from '#lib/modules/terco/domain/tipos.ts';
	import {
		armazenamentoLocal,
		gravarPreferencias,
		lerPreferencias,
		preferenciasPadrao,
		type NomeEsquema,
		type Preferencias
	} from '#lib/modules/terco/state/preferencias.ts';

	const DIAS = [
		'domingo',
		'segunda-feira',
		'terça-feira',
		'quarta-feira',
		'quinta-feira',
		'sexta-feira',
		'sábado'
	];
	const OPCOES_ESQUEMA: { id: NomeEsquema; rotulo: string }[] = [
		{ id: '2002', rotulo: 'Esquema de 2002 (com os mistérios luminosos)' },
		{ id: 'montfort', rotulo: 'Esquema de Montfort (os quinze mistérios tradicionais)' }
	];

	const padrao = preferenciasPadrao(PADROES.jaculatorias);
	let preferencias: Preferencias = $state(padrao);
	/** Só existe no navegador: o HTML pré-renderizado não sabe a data do visitante. */
	let hoje: Date | null = $state(null);

	const serieHoje: Serie | null = $derived(
		hoje ? serieDoDia(hoje, ESQUEMAS[preferencias.esquema]) : null
	);
	const cabecalhoHoje = $derived(CABECALHOS.find((c) => c.id === serieHoje));

	onMount(() => {
		preferencias = lerPreferencias(
			armazenamentoLocal(),
			padrao,
			new Set(JACULATORIAS.map((j) => j.id))
		);
		hoje = new Date();
	});

	function escolherEsquema(esquema: NomeEsquema) {
		preferencias = { ...preferencias, esquema };
		gravarPreferencias(armazenamentoLocal(), preferencias);
	}

	const hrefSerie = (serie: Serie) => resolve(`terco/${serie}/`);
</script>

<svelte:head>
	<title>Terço — Catoolicas</title>
	<meta
		name="description"
		content="Rezar o terço do dia ou o rosário inteiro, conta a conta, com as meditações de São Luís Maria Grignion de Montfort."
	/>
</svelte:head>

<h1>Terço</h1>

<section
	class="hoje"
	aria-labelledby="titulo-hoje"
	aria-live="polite"
	data-hidratado={hoje ? '' : undefined}
>
	<h2 id="titulo-hoje" class="visualmente-oculto">Terço de hoje</h2>
	{#if hoje && serieHoje && cabecalhoHoje}
		<a class="comecar" href={hrefSerie(serieHoje)} data-serie={serieHoje}>
			Começar o terço de hoje: {cabecalhoHoje.nome.pt}
		</a>
		<p class="rubrica">Hoje é {DIAS[hoje.getDay()]}. {cabecalhoHoje.tema.pt}.</p>
	{:else}
		<p class="aguardando">Calculando o terço de hoje…</p>
	{/if}
</section>

<section aria-labelledby="titulo-series">
	<h2 id="titulo-series">Escolher os mistérios</h2>
	<ul class="series">
		{#each CABECALHOS as serie (serie.id)}
			<li data-serie={serie.id}>
				<a href={hrefSerie(serie.id)}>{serie.nome.pt}</a>
				<span>{serie.tema.pt}</span>
			</li>
		{/each}
		<li>
			<a href={resolve('terco/rosario/')}>Rosário inteiro</a>
			<span>Os vinte mistérios, uma série depois da outra.</span>
		</li>
	</ul>
</section>

<section aria-labelledby="titulo-esquema">
	<h2 id="titulo-esquema">Mistérios de cada dia</h2>
	<fieldset>
		<legend class="visualmente-oculto">Esquema dos dias da semana</legend>
		{#each OPCOES_ESQUEMA as esquema (esquema.id)}
			<label>
				<input
					type="radio"
					name="esquema"
					value={esquema.id}
					checked={preferencias.esquema === esquema.id}
					onchange={() => escolherEsquema(esquema.id)}
				/>
				{esquema.rotulo}
			</label>
		{/each}
	</fieldset>
</section>

<style>
	.hoje {
		min-height: 5.5rem;
	}

	.comecar {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: var(--espaco-2) var(--espaco-4);
		border-radius: 6px;
		background: var(--cor-serie);
		color: var(--cor-papel);
		font-weight: 600;
		text-decoration: none;
	}

	.comecar:hover {
		color: var(--cor-papel);
		text-decoration: underline;
	}

	.aguardando {
		color: var(--cor-tinta-suave);
	}

	.series {
		display: grid;
		gap: var(--espaco-3);
		padding: 0;
		list-style: none;
	}

	.series li {
		display: grid;
		padding-left: var(--espaco-3);
		border-left: 3px solid var(--cor-serie);
	}

	.series a {
		font-family: var(--fonte-texto);
		font-size: 1.2rem;
		font-weight: 600;
	}

	.series span {
		color: var(--cor-tinta-suave);
	}

	fieldset {
		display: grid;
		gap: var(--espaco-2);
		border: 0;
		padding: 0;
	}

	label {
		display: flex;
		gap: var(--espaco-2);
		align-items: flex-start;
		min-height: 32px;
	}
</style>
