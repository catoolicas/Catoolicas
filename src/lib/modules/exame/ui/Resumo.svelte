<script lang="ts">
	import { ROTEIRO, TEXTOS } from '#lib/modules/exame/conteudo.ts';
	import type { Resumo } from '#lib/modules/exame/domain/resumo.ts';
	import type { OracaoExame } from '#lib/modules/exame/domain/tipos.ts';

	type Props = {
		resumo: Resumo;
		vazio: boolean;
		ultimaConfissao: string;
		ato: OracaoExame | undefined;
	};
	let { resumo, vazio, ultimaConfissao, ato }: Props = $props();
</script>

<!-- A lista para levar à confissão (a única parte que vai para a impressão), como no terco-diario:
     primeiro o que pode ser matéria grave, depois as outras faltas, o roteiro e o ato de contrição. -->
<div class="resumo">
	{#if vazio}
		<p>{ROTEIRO.nenhumItem}</p>
	{/if}

	{#if resumo.graves.length > 0}
		<h3>{ROTEIRO.tituloGraves}</h3>
		<ul>
			{#each resumo.graves as linha (linha.id)}
				<li>
					{linha.acusacao}{#if linha.vezes}<span class="vezes">{` — ${linha.vezes}`}</span>{/if}
				</li>
			{/each}
		</ul>
	{/if}

	{#if resumo.outras.length > 0}
		<h3>{ROTEIRO.tituloOutras}</h3>
		<ul>
			{#each resumo.outras as linha (linha.id)}
				<li>{linha.acusacao}</li>
			{/each}
		</ul>
	{/if}

	<h3>{ROTEIRO.tituloConfessionario}</h3>
	{#if ultimaConfissao}
		<p><span class="rotulo">Tempo desde a última confissão:</span> {ultimaConfissao}</p>
	{/if}
	{#each ROTEIRO.confessionario as paragrafo (paragrafo)}
		<p>{paragrafo}</p>
	{/each}

	{#if ato}
		<h3>{ROTEIRO.tituloAto}</h3>
		<p>{ato.texto}</p>
	{/if}

	<p class="rubrica">{ROTEIRO.depois}</p>
	<p class="rubrica so-impressao">{TEXTOS.destruirFolha}</p>
</div>

<style>
	.resumo {
		margin-top: var(--espaco-4);
		padding: var(--espaco-3) var(--espaco-4);
		border: 1px solid var(--cor-filete);
		border-radius: 6px;
		background: var(--cor-papel-2);
		font-family: var(--fonte-texto);
		font-size: var(--tam-texto);
	}

	h3 {
		margin: var(--espaco-4) 0 var(--espaco-2);
		color: var(--cor-rubrica);
		font-size: 1rem;
	}

	h3:first-child {
		margin-top: 0;
	}

	ul {
		margin: 0;
		padding-left: var(--espaco-4);
	}

	li + li {
		margin-top: var(--espaco-1);
	}

	.vezes,
	.rotulo {
		color: var(--cor-tinta-suave);
	}

	.so-impressao {
		display: none;
	}

	@media print {
		.resumo {
			margin: 0;
			padding: 0;
			border: 0;
			background: none;
			font-size: 12pt;
		}

		h3 {
			color: inherit;
			border-bottom: 1px solid currentColor;
			text-transform: uppercase;
			letter-spacing: 0.06em;
			font-size: 11pt;
		}

		.vezes,
		.rotulo {
			color: inherit;
		}

		.so-impressao {
			display: block;
		}
	}
</style>
