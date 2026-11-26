<script lang="ts">
	import Terco from '#lib/modules/terco/ui/Terco.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.serie.nome.pt} — Terço — Catoolicas</title>
	<meta name="description" content={`Terço dos ${data.serie.nome.pt}: ${data.serie.tema.pt}.`} />
</svelte:head>

<h1>{data.serie.nome.pt}</h1>
<p class="tema">{data.serie.tema.pt}</p>

{#key data.serie.id}
	<Terco series={[data.serie]} pagina={data.serie.id} />
{/key}

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
