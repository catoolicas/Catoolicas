<script lang="ts">
	import { TEXTOS } from '#lib/modules/exame/conteudo.ts';
	import Exame from '#lib/modules/exame/ui/Exame.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<!--
	Política de segurança ADICIONAL desta página (ADR-0004), somada à global (vite.config.ts): o
	navegador exige que as duas permitam cada pedido, então esta só restringe; scripts e estilos
	continuam autorizados pelos hashes da global.
	- connect-src 'none': fetch, XMLHttpRequest, WebSocket, EventSource e sendBeacon bloqueados.
	- img-src data:: nenhuma imagem com requisição (nem <img>, nem background-image via CSSOM).
	- form-action, frame-src, worker-src, media-src, manifest-src, object-src e base-uri: nada.
	Não cobre URLs de scripts, estilos e fontes da própria origem nem navegação: isso fica com as
	regras de lint do exame e com a suíte de privacidade E2E.
	Escrita literalmente: as regras de lint proíbem interpolação no <svelte:head> do exame.
-->
<svelte:head>
	<title>Exame de consciência — Catoolicas</title>
	<meta
		name="description"
		content="Exame de consciência para preparar a confissão. Funciona só no seu aparelho: nada é enviado nem gravado."
	/>
	<meta
		http-equiv="content-security-policy"
		content="connect-src 'none'; img-src data:; form-action 'none'; frame-src 'none'; worker-src 'none'; media-src 'none'; manifest-src 'none'; object-src 'none'; base-uri 'none'"
	/>
</svelte:head>

<h1>{TEXTOS.titulo}</h1>

<noscript>
	<p class="sem-js">
		Os campos do exame só funcionam com JavaScript, que é o que apaga tudo ao sair da página. Sem
		ele, ficam desativados: dá para ler o exame, mas não para preenchê-lo.
	</p>
</noscript>

<Exame secoes={data.secoes} />

<style>
	.sem-js {
		padding: var(--espaco-2) var(--espaco-3);
		border-left: 4px solid var(--cor-rubrica);
		background: var(--cor-papel-2);
	}
</style>
