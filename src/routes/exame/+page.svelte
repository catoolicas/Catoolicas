<script lang="ts">
	import { TEXTOS } from '#lib/modules/exame/conteudo.ts';
	import { CSP_DO_EXAME } from '#lib/modules/exame/csp.ts';
	import Exame from '#lib/modules/exame/ui/Exame.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{TEXTOS.titulo} — Catoolicas</title>
	<meta
		name="description"
		content="Exame de consciência para preparar a confissão. Funciona só no seu aparelho: nada é enviado nem gravado."
	/>
	<!-- Política adicional, somada à global: esta página não fala com a rede (ADR-0004). -->
	<meta http-equiv="content-security-policy" content={CSP_DO_EXAME} />
</svelte:head>

<h1>{TEXTOS.titulo}</h1>

<Exame secoes={data.secoes} />
