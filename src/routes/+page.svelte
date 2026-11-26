<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Catoolicas — ferramentas católicas livres</title>
	<meta
		name="description"
		content="Ferramentas livres para a oração, o exame de consciência e o estudo da fé católica, sem cadastro e sem rastreamento."
	/>
</svelte:head>

<h1>Catoolicas</h1>

<p class="abertura">
	Ferramentas livres para a oração, o exame de consciência e o estudo da fé católica — sem cadastro
	e sem rastreamento.
</p>

<section aria-labelledby="em-preparo">
	<h2 id="em-preparo">Em preparação</h2>
	<p class="rubrica">Este site está em construção. As primeiras ferramentas previstas são:</p>
	<ul>
		<li><strong>Terço do dia</strong> — rezar o terço e o rosário, dezena a dezena.</li>
		<li>
			<strong>Exame de consciência</strong> — preparação para a confissão que funciona apenas no seu aparelho,
			sem enviar nada a ninguém.
		</li>
		<li><strong>Novenário</strong> — novenas organizadas dia a dia.</li>
	</ul>
</section>

<p><a href={resolve('/sobre')}>Sobre o projeto, privacidade e licenças</a></p>

<style>
	.abertura {
		font-family: var(--fonte-texto);
		font-size: var(--tam-texto);
	}

	ul {
		padding-left: var(--espaco-4);
	}

	li + li {
		margin-top: var(--espaco-2);
	}
</style>
