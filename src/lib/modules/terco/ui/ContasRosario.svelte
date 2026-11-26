<script lang="ts">
	import type { Passo } from '../domain/sequencia.ts';

	type Props = { passos: readonly Passo[]; indice: number };
	let { passos, indice }: Props = $props();

	type Conta = { linha: number; posicao: number; passo: number };

	/** Dezena da série em exibição: a do passo atual (ou a primeira/última, fora das dezenas). */
	const dezenaAtual = $derived.by(() => {
		for (let i = indice; i >= 0; i--) {
			const p = passos[i];
			if (p && 'dezena' in p) return p.dezena.indice;
		}
		return 0;
	});

	/** Mostra as cinco dezenas da série atual (no rosário inteiro, uma série por vez). */
	const contas = $derived.by(() => {
		const primeira = Math.floor(dezenaAtual / 5) * 5;
		const lista: Conta[] = [];
		passos.forEach((p, i) => {
			if (p.tipo !== 'pai-nosso' && p.tipo !== 'ave-maria') return;
			const linha = p.dezena.indice - primeira;
			if (linha < 0 || linha > 4) return;
			lista.push({ linha, posicao: p.tipo === 'pai-nosso' ? 0 : p.conta, passo: i });
		});
		return lista;
	});

	const x = (posicao: number) => (posicao === 0 ? 10 : 18 + posicao * 16);
	const y = (linha: number) => 12 + linha * 24;
</script>

<svg
	class="contas"
	viewBox="0 0 190 118"
	aria-hidden="true"
	focusable="false"
	data-dezena-atual={dezenaAtual}
>
	{#each contas as conta (conta.passo)}
		<circle
			cx={x(conta.posicao)}
			cy={y(conta.linha)}
			r={conta.posicao === 0 ? 7 : 5}
			class:feita={conta.passo < indice}
			class:atual={conta.passo === indice}
		/>
	{/each}
</svg>

<style>
	.contas {
		display: block;
		width: 100%;
		max-width: 16rem;
		height: auto;
		color: var(--cor-serie);
	}

	circle {
		fill: transparent;
		stroke: currentColor;
		stroke-width: 1.5;
		transition:
			fill var(--duracao-curta) ease,
			transform var(--duracao-curta) ease;
		transform-box: fill-box;
		transform-origin: center;
	}

	.feita {
		fill: currentColor;
		opacity: 0.45;
	}

	.atual {
		fill: currentColor;
		transform: scale(1.25);
	}
</style>
