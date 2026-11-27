<script lang="ts">
	import { flushSync, onMount } from 'svelte';
	import {
		ATOS,
		ORACAO_INICIAL,
		ORIENTACOES,
		ROTEIRO,
		TEXTOS
	} from '#lib/modules/exame/conteudo.ts';
	import { estadosPresentes } from '#lib/modules/exame/domain/resumo.ts';
	import type { EstadoDeVida, SecaoExame } from '#lib/modules/exame/domain/tipos.ts';
	import { EstadoExame } from '#lib/modules/exame/state/exame.svelte.ts';
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

	/**
	 * Marca a hidratação. Antes dela (ou sem JavaScript), os campos ficam desativados: sem o código
	 * da página, nada apagaria o que fosse marcado, e o navegador poderia guardá-lo (ADR-0004).
	 */
	let hidratado = $state(false);
	onMount(() => {
		hidratado = true;
	});
	const desativado = $derived(!hidratado);

	/** Qualquer mudança tira a mensagem anterior ("Tudo foi apagado.") da tela. */
	function mudou() {
		aviso = '';
	}

	let temporizadorDoAviso: ReturnType<typeof setTimeout> | undefined;
	function apagarTudo() {
		estado.limpar();
		// Esvazia e escreve de novo: o leitor de tela anuncia mesmo quando a mensagem se repete.
		aviso = '';
		clearTimeout(temporizadorDoAviso);
		temporizadorDoAviso = setTimeout(() => (aviso = 'Tudo foi apagado.'), 100);
	}

	/** Zera o estado e já atualiza o DOM, antes de a página ir para o cache de navegação. */
	function zerar() {
		clearTimeout(temporizadorDoAviso);
		estado.limpar();
		aviso = '';
		flushSync();
	}

	/**
	 * Enquanto o exame está aberto, o roteador do SvelteKit não recebe estes eventos da janela:
	 * - `beforeunload` e `visibilitychange` (aba escondida): ele gravaria no sessionStorage a posição
	 *   de rolagem desta página, que diz em que parte do exame a pessoa estava;
	 * - `focus` e `visibilitychange` (aba visível): ele buscaria `version.json` (a CSP bloqueia).
	 * Ouvintes de captura na própria janela rodam antes dos do roteador. `beforeunload` tem o
	 * documento como alvo (herança antiga dos navegadores), por isso é parado sem condição.
	 */
	function isolarDoRoteador(e: Event) {
		e.stopImmediatePropagation();
	}

	/** O foco de um campo também passa pela captura da janela: só para o foco da própria janela. */
	function isolarFocoDaJanela(e: FocusEvent) {
		if (e.target === e.currentTarget) e.stopImmediatePropagation();
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

<svelte:window
	onpagehide={zerar}
	onpageshow={aoMostrarPagina}
	onfocuscapture={isolarFocoDaJanela}
	onbeforeunloadcapture={isolarDoRoteador}
/>
<svelte:document onvisibilitychange={isolarDoRoteador} />

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
						aoMudar={(sim: boolean) => {
							mudou();
							estado.alternarEstado(estadoDeVida, sim);
						}}
						{desativado}
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
							mudou();
							estado.marcar(item.id, sim);
						}}
						aoDefinirVezes={(texto: string) => {
							mudou();
							estado.definirVezes(item.id, texto);
						}}
						{desativado}
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
					aoMudar={(texto: string) => {
						mudou();
						estado.ultimaConfissao = texto;
					}}
					{desativado}
				/>
			</label>

			<label class="campo">
				<span>{ROTEIRO.tituloAto} na lista</span>
				<!-- Sem `value` no <select> (o Svelte traria código genérico de seleção a todas as
				     páginas): `selected` nas opções vale para o HTML pré-renderizado, e o $effect acima
				     mantém a seleção igual ao estado. Atributos de CAMPO_PRIVADO. -->
				<select
					bind:this={seletorAto}
					onchange={(e) => {
						mudou();
						estado.ato = e.currentTarget.value;
					}}
					disabled={desativado}
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

		{#if !hidratado}
			<!-- Some na hidratação. Fica se o JavaScript estiver desligado ou não tiver carregado (por
			     exemplo, HTML antigo em cache depois de uma publicação). Embaixo, para que sumir não
			     desloque nada na tela. -->
			<p class="sem-js">
				Os campos só funcionam depois que a página termina de carregar, com JavaScript ligado. Até
				lá, ficam desativados: assim, nada do que fosse marcado ficaria guardado no navegador.
			</p>
		{/if}

		<div class="acoes">
			<button type="button" class="principal" onclick={imprimir} disabled={desativado}>
				Imprimir
			</button>
			<button type="button" onclick={apagarTudo} disabled={desativado}>Apagar tudo agora</button>
		</div>
		<!-- Sempre presente (mesmo vazia), para o leitor de tela já conhecer a região de status. -->
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

	/* Mesmo tamanho das caixas dos itens. */
	.estados label :global(input) {
		width: 1.4rem;
		height: 1.4rem;
		margin: 0;
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

	.sem-js {
		padding: var(--espaco-2) var(--espaco-3);
		border-left: 4px solid var(--cor-rubrica);
		background: var(--cor-papel-2);
	}

	.aviso {
		min-height: 1lh;
		margin: var(--espaco-2) 0 0;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
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
