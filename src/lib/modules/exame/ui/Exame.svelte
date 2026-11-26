<script lang="ts">
	import { flushSync, onMount } from 'svelte';
	import { ATOS, ORACAO_INICIAL, ORIENTACOES, ROTEIRO, TEXTOS } from '../conteudo.ts';
	import { estadosPresentes } from '../domain/resumo.ts';
	import type { EstadoDeVida, SecaoExame } from '../domain/tipos.ts';
	import { EstadoExame } from '../state/exame.svelte.ts';
	import CaixaPrivada from './CaixaPrivada.svelte';
	import ItemDoExame from './ItemDoExame.svelte';
	import Privacidade from './Privacidade.svelte';
	import Resumo from './Resumo.svelte';
	import TextoPrivado from './TextoPrivado.svelte';

	let { secoes }: { secoes: SecaoExame[] } = $props();

	// O estado vive só neste componente (ADR-0004). As props não mudam durante a vida da página.
	// svelte-ignore state_referenced_locally
	const estado = new EstadoExame(secoes);
	// svelte-ignore state_referenced_locally
	const estadosDisponiveis = estadosPresentes(secoes);

	const ROTULOS_ESTADO: Record<EstadoDeVida, string> = {
		casados: 'pessoas casadas',
		pais: 'pais e mães',
		trabalho: 'quem trabalha ou emprega'
	};
	const atosDeContricao = ATOS.filter((a) => a.id.startsWith('contricao'));
	const confiteor = ATOS.find((a) => a.id === 'confiteor');
	const atoEscolhido = $derived(atosDeContricao.find((a) => a.id === estado.ato));

	/** Mensagem da região de status (leitores de tela). */
	let aviso = $state('');
	/**
	 * O estado manda no seletor do ato, inclusive sobre uma seleção que o navegador tenha
	 * restaurado antes da hidratação (o `selected` das opções não basta depois que a seleção mudou).
	 */
	let seletorAto: HTMLSelectElement | undefined = $state();
	$effect(() => {
		if (seletorAto) seletorAto.value = estado.ato;
	});

	/** Marca a hidratação (os testes esperam por ela antes de interagir). */
	let hidratado = $state(false);
	onMount(() => {
		hidratado = true;
	});

	function apagarTudo() {
		estado.limpar();
		aviso = 'Tudo foi apagado.';
	}

	/** Zera o estado e já atualiza o DOM, antes de a página ir para o cache de navegação. */
	function zerar() {
		estado.limpar();
		aviso = '';
		flushSync();
	}

	function aoMostrarPagina(e: PageTransitionEvent) {
		// Voltou do cache de navegação (bfcache): começa do zero, mesmo que algo tenha escapado.
		if (e.persisted) zerar();
	}

	function imprimir() {
		aviso = '';
		print();
	}
</script>

<svelte:window onpagehide={zerar} onpageshow={aoMostrarPagina} />

<div class="exame" data-hidratado={hidratado ? '' : undefined}>
	<p class="subtitulo">{TEXTOS.subtitulo}</p>

	<Privacidade />

	<section aria-labelledby="antes-de-comecar">
		<h2 id="antes-de-comecar">{TEXTOS.antesDeComecar}</h2>
		<p class="oracao"><b>{ORACAO_INICIAL.nome}</b> {ORACAO_INICIAL.texto}</p>
		<ul class="principios">
			{#each ORIENTACOES as orientacao (orientacao.destaque)}
				<li><b>{orientacao.destaque}</b> {orientacao.texto}</li>
			{/each}
		</ul>
	</section>

	{#if estadosDisponiveis.length > 0}
		<fieldset class="estados">
			<legend>Mostrar também as perguntas para</legend>
			{#each estadosDisponiveis as estadoDeVida (estadoDeVida)}
				<label>
					<CaixaPrivada
						marcado={estado.estados.includes(estadoDeVida)}
						aoMudar={(sim: boolean) => estado.alternarEstado(estadoDeVida, sim)}
					/>
					{ROTULOS_ESTADO[estadoDeVida]}
				</label>
			{/each}
		</fieldset>
	{/if}

	{#each estado.secoes as secao (secao.id)}
		<section class="secao" aria-labelledby="titulo-{secao.id}">
			<p class="mandamento">{secao.titulo}</p>
			<h2 id="titulo-{secao.id}">{secao.nome}</h2>
			<p class="enunciado">{secao.enunciado}</p>
			{#if secao.status !== 'aprovado'}
				<p class="rascunho">Seção em revisão: só aparece no modo de desenvolvimento.</p>
			{/if}
			<ul class="itens">
				{#each secao.itens as item (item.id)}
					<ItemDoExame
						{item}
						marcado={estado.marcado(item.id)}
						vezes={estado.marcacoes[item.id] ?? ''}
						rotuloVezes={TEXTOS.rotuloVezes}
						aoMarcar={(sim: boolean) => {
							aviso = '';
							estado.marcar(item.id, sim);
						}}
						aoDefinirVezes={(texto: string) => estado.definirVezes(item.id, texto)}
					/>
				{/each}
			</ul>
		</section>
	{/each}

	<!-- A lista pessoal não é traduzida: tradutores automáticos podem enviar o texto para fora. -->
	<section class="lista" aria-labelledby="minha-lista" translate="no">
		<h2 id="minha-lista">{TEXTOS.minhaLista}</h2>
		<p class="rubrica">{TEXTOS.naoGravado}</p>

		<div class="campos">
			<label class="campo">
				<span>Tempo desde a última confissão <span class="opcional">(opcional)</span></span>
				<TextoPrivado
					valor={estado.ultimaConfissao}
					aoMudar={(texto: string) => (estado.ultimaConfissao = texto)}
				/>
			</label>

			<label class="campo">
				<span>{ROTEIRO.tituloAto} na lista</span>
				<!-- Sem `value` no <select> (o Svelte traria código genérico de seleção a todas as
				     páginas): `selected` nas opções vale para o HTML pré-renderizado, e o $effect acima
				     mantém a seleção igual ao estado. Atributos de CAMPO_PRIVADO. -->
				<select
					bind:this={seletorAto}
					onchange={(e) => (estado.ato = e.currentTarget.value)}
					autocomplete="off"
					spellcheck="false"
					autocorrect="off"
					autocapitalize="off"
					writingsuggestions="false"
					translate="no"
					data-1p-ignore=""
					data-lpignore="true"
					data-bwignore=""
					data-form-type="other"
					data-gramm="false"
					data-gramm_editor="false"
					data-enable-grammarly="false"
					data-lt-active="false"
				>
					{#each atosDeContricao as ato (ato.id)}
						<option value={ato.id} selected={estado.ato === ato.id}>{ato.nome}</option>
					{/each}
				</select>
			</label>
		</div>

		{#if confiteor}
			<details class="confiteor">
				<summary>{confiteor.nome}</summary>
				<p>{confiteor.texto}</p>
			</details>
		{/if}

		<div class="acoes">
			<button type="button" class="principal" onclick={imprimir}>Imprimir</button>
			<button type="button" onclick={apagarTudo}>Apagar tudo agora</button>
		</div>
		<p class="aviso" role="status">{aviso}</p>

		<Resumo
			resumo={estado.resumo}
			vazio={estado.vazio}
			ultimaConfissao={estado.ultimaConfissao.trim()}
			ato={atoEscolhido}
		/>
	</section>
</div>

<style>
	.subtitulo {
		margin-top: 0;
		color: var(--cor-tinta-suave);
		font-style: italic;
	}

	.oracao {
		font-family: var(--fonte-texto);
		font-size: var(--tam-texto);
	}

	.principios,
	.itens {
		padding-left: var(--espaco-4);
	}

	.principios li + li {
		margin-top: var(--espaco-2);
	}

	.itens {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.secao {
		margin-top: var(--espaco-5);
	}

	.mandamento {
		margin: 0;
		color: var(--cor-rubrica);
		font-size: 0.875rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.secao h2 {
		margin: var(--espaco-1) 0 0;
	}

	.enunciado {
		margin-top: var(--espaco-1);
		color: var(--cor-tinta-suave);
		font-style: italic;
	}

	.rascunho {
		color: var(--cor-rubrica);
		font-size: 0.875rem;
		font-weight: 600;
	}

	fieldset {
		margin: var(--espaco-4) 0 0;
		padding: var(--espaco-2) var(--espaco-3) var(--espaco-3);
		border: 1px solid var(--cor-filete);
		border-radius: 6px;
	}

	.estados label {
		display: flex;
		gap: var(--espaco-2);
		align-items: center;
		min-height: 44px;
	}

	.lista {
		margin-top: var(--espaco-5);
		padding-top: var(--espaco-4);
		border-top: 2px solid var(--cor-filete);
	}

	.campos {
		display: grid;
		gap: var(--espaco-3);
	}

	.campo {
		display: grid;
		gap: var(--espaco-1);
	}

	.campo select {
		min-height: 44px;
		width: 100%;
		max-width: 28rem;
		padding: var(--espaco-1) var(--espaco-2);
		border: 1px solid var(--cor-tinta-suave);
		border-radius: 4px;
		background: var(--cor-papel);
		color: var(--cor-tinta);
		font: inherit;
	}

	.opcional {
		color: var(--cor-tinta-suave);
	}

	.confiteor {
		margin-top: var(--espaco-3);
	}

	.confiteor summary {
		padding-block: 0.625rem;
		cursor: pointer;
	}

	.confiteor p {
		font-family: var(--fonte-texto);
		font-size: var(--tam-texto);
	}

	.acoes {
		display: flex;
		flex-wrap: wrap;
		gap: var(--espaco-2);
		margin-top: var(--espaco-4);
	}

	button {
		min-height: 44px;
		padding: var(--espaco-2) var(--espaco-3);
		border: 1px solid var(--cor-filete);
		border-radius: 6px;
		background: var(--cor-papel-2);
		color: var(--cor-tinta);
		font: inherit;
		cursor: pointer;
	}

	button:hover {
		border-color: var(--cor-rubrica);
	}

	.principal {
		background: var(--cor-rubrica);
		border-color: var(--cor-rubrica);
		color: var(--cor-papel);
		font-weight: 600;
	}

	.aviso:empty {
		display: none;
	}

	/* Impressão: só o título e a lista (sem iframe nem biblioteca; nada sai da página). */
	@media print {
		:global(body:has(.exame)) {
			background: #fff;
			color: #000;
		}

		:global(body:has(.exame) :is(.pular, .cabecalho, .rodape)) {
			display: none;
		}

		/* :global porque parte dos filhos vem de outros componentes (aviso, lista). */
		.exame > :global(:not(.subtitulo, .lista)),
		.lista > :global(:not(.resumo)) {
			display: none;
		}

		.lista {
			margin: 0;
			padding: 0;
			border: 0;
		}

		.subtitulo {
			color: inherit;
		}
	}
</style>
