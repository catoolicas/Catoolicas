<script lang="ts">
	import Terco from '#lib/modules/terco/ui/Terco.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Rosário inteiro — Catoolicas</title>
	<meta
		name="description"
		content="O rosário inteiro: mistérios gozosos, luminosos, dolorosos e gloriosos."
	/>
</svelte:head>

<h1>Rosário inteiro</h1>
<p class="tema">Os vinte mistérios, uma série depois da outra.</p>

<Terco series={data.series} pagina="rosario" />

<style>
	h1 {
		margin-bottom: 0;
	}

	.tema {
		margin-top: var(--espaco-1);
		font-family: var(--fonte-texto);
		font-style: italic;
		color: var(--cor-tinta-suave);
	}
</style>
