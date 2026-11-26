<script lang="ts">
	import { jaculatoria, oracao } from '../comum.ts';
	import { pericopeDoDia } from '../domain/calendario.ts';
	import type { Passo } from '../domain/sequencia.ts';
	import type { Idioma, Serie, SerieDeMisterios, Texto } from '../domain/tipos.ts';
	import { exibir } from './texto.ts';

	type Props = {
		passo: Passo;
		series: readonly SerieDeMisterios[];
		idioma: Idioma;
		textoCompleto: boolean;
		/** Data local usada para escolher a perícope do dia. */
		data: Date;
		ultimo: boolean;
	};
	let { passo, series, idioma, textoCompleto, data, ultimo }: Props = $props();

	const SINGULAR: Record<Serie, string> = {
		gozosos: 'gozoso',
		luminosos: 'luminoso',
		dolorosos: 'doloroso',
		gloriosos: 'glorioso'
	};

	const serieDe = (id: Serie) => series.find((s) => s.id === id);
	const t = (texto: Texto) => exibir(texto, idioma);

	const dezena = $derived('dezena' in passo ? passo.dezena : null);
	const serie = $derived(dezena ? serieDe(dezena.serie) : null);
	const misterio = $derived(dezena && serie ? serie.misterios[dezena.misterio] : null);
	const rotuloMisterio = $derived(
		dezena ? `${dezena.misterio + 1}º mistério ${SINGULAR[dezena.serie]}` : ''
	);
</script>

{#snippet texto(valor: Texto, classe = '')}
	{@const v = t(valor)}
	<p class={classe} lang={v.lang}>
		{v.conteudo}
		{#if v.naoOficial}<span class="rubrica nao-oficial" lang="pt-BR">
				(tradução não oficial)
			</span>{/if}
	</p>
{/snippet}

{#snippet oracaoCompleta(id: string)}
	{@const o = oracao(id)}
	{#if textoCompleto}
		{@render texto(o.texto, 'oracao')}
		{#if o.versiculo}
			{@render texto(o.versiculo.v, 'versiculo')}
			{@render texto(o.versiculo.r, 'versiculo')}
		{/if}
	{/if}
{/snippet}

<article class="passo" aria-labelledby="titulo-passo" data-tipo={passo.tipo}>
	{#if passo.tipo === 'oracao'}
		{@const o = oracao(passo.oracao)}
		{@const titulo = t(o.titulo)}
		<p class="rotulo">
			{passo.parte === 'abertura' ? 'Orações iniciais' : 'Orações finais'}{#if passo.vezes > 1}
				· {passo.vez} de {passo.vezes}{/if}
		</p>
		<h2 id="titulo-passo" lang={titulo.lang}>{titulo.conteudo}</h2>
		{#if passo.nota}{@render texto(passo.nota, 'rubrica')}{/if}
		{#if o.nota}{@render texto(o.nota, 'rubrica')}{/if}
		{@render oracaoCompleta(passo.oracao)}
	{:else if passo.tipo === 'anuncio' && misterio && serie}
		{@const pericope = pericopeDoDia(misterio, data)}
		{@const titulo = t(misterio.titulo)}
		<p class="rotulo">{rotuloMisterio}</p>
		<h2 id="titulo-passo" lang={titulo.lang}>{titulo.conteudo}</h2>
		{@render texto(misterio.fruto, 'rubrica')}
		{#if serie.aviso && passo.dezena.misterio === 0}{@render texto(serie.aviso, 'nota')}{/if}
		<blockquote class="pericope">
			{@render texto(pericope.texto)}
			<footer>{@render texto(pericope.referencia, 'referencia')}</footer>
		</blockquote>
		{@render texto(misterio.oferecimento)}
		{#if misterio.nota}{@render texto(misterio.nota, 'nota')}{/if}
	{:else if passo.tipo === 'pai-nosso' && misterio}
		{@const titulo = t(oracao('pai-nosso').titulo)}
		<p class="rotulo">{rotuloMisterio}</p>
		<h2 id="titulo-passo" lang={titulo.lang}>{titulo.conteudo}</h2>
		{#if misterio.intencaoPaiNosso}{@render texto(misterio.intencaoPaiNosso, 'rubrica')}{/if}
		{@render oracaoCompleta('pai-nosso')}
	{:else if passo.tipo === 'ave-maria'}
		{@const titulo = t(oracao('ave-maria').titulo)}
		<p class="rotulo">{rotuloMisterio} · Ave-Maria {passo.conta} de 10</p>
		<h2 id="titulo-passo" lang={titulo.lang}>{titulo.conteudo}</h2>
		{#if passo.ponto}{@render texto(passo.ponto, 'meditacao')}{/if}
		{#if passo.clausula}{@render texto(passo.clausula, 'clausula')}{/if}
		{@render oracaoCompleta('ave-maria')}
	{:else if passo.tipo === 'gloria'}
		{@const titulo = t(oracao('gloria').titulo)}
		<p class="rotulo">{rotuloMisterio}</p>
		<h2 id="titulo-passo" lang={titulo.lang}>{titulo.conteudo}</h2>
		{@render oracaoCompleta('gloria')}
	{:else if passo.tipo === 'jaculatoria'}
		{@const j = jaculatoria(passo.jaculatoria)}
		{@const devocao = t(j.devocao)}
		<p class="rotulo">{rotuloMisterio} · Jaculatória</p>
		<h2 id="titulo-passo" lang={devocao.lang}>{devocao.conteudo}</h2>
		{@render texto(j.texto, 'oracao')}
	{:else if passo.tipo === 'fecho-dezena' && misterio}
		<p class="rotulo">{rotuloMisterio}</p>
		<h2 id="titulo-passo">Fecho da dezena</h2>
		{@render texto(misterio.fecho)}
	{:else if passo.tipo === 'oracao-final-serie'}
		{@const s = serieDe(passo.serie)}
		{#if s}
			{@const nome = t(s.nome)}
			<p class="rotulo">Oração final</p>
			<h2 id="titulo-passo" lang={nome.lang}>{nome.conteudo}</h2>
			{@render texto(s.oracaoFinal)}
		{/if}
	{/if}

	{#if ultimo}
		<p class="concluido" role="status">Fim do terço.</p>
	{/if}
</article>

<style>
	.passo {
		font-family: var(--fonte-texto);
		font-size: var(--tam-texto);
	}

	.rotulo {
		margin: 0;
		font-family: var(--fonte-ui);
		font-size: 0.875rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--cor-tinta-suave);
	}

	h2 {
		margin: var(--espaco-1) 0 var(--espaco-3);
		font-size: 1.6rem;
		color: var(--cor-serie);
	}

	.pericope {
		margin: var(--espaco-3) 0;
		padding-left: var(--espaco-3);
		border-left: 3px solid var(--cor-serie);
		font-style: italic;
	}

	.pericope :global(.referencia) {
		font-style: normal;
		font-size: 0.9rem;
		color: var(--cor-tinta-suave);
	}

	.passo :global(.meditacao) {
		font-size: 1.2rem;
		font-weight: 600;
	}

	.passo :global(.clausula) {
		color: var(--cor-serie);
		font-weight: 600;
	}

	.passo :global(.nota) {
		font-family: var(--fonte-ui);
		font-size: 0.9rem;
		color: var(--cor-tinta-suave);
	}

	.passo :global(.versiculo) {
		margin: 0;
	}

	.nao-oficial {
		font-family: var(--fonte-ui);
		font-size: 0.8rem;
	}

	.concluido {
		margin-top: var(--espaco-4);
		font-weight: 600;
	}
</style>
