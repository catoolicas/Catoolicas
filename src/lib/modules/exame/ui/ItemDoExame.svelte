<script lang="ts">
	import type { ItemExame } from '#lib/modules/exame/domain/tipos.ts';
	import CaixaPrivada from './CaixaPrivada.svelte';
	import TextoPrivado from './TextoPrivado.svelte';

	type Props = {
		item: ItemExame;
		marcado: boolean;
		vezes: string;
		rotuloVezes: string;
		aoMarcar: (sim: boolean) => void;
		aoDefinirVezes: (texto: string) => void;
		desativado: boolean;
	};
	let { item, marcado, vezes, rotuloVezes, aoMarcar, aoDefinirVezes, desativado }: Props = $props();
</script>

<!-- Campos com valor de mão única (checked={...}, value={...}): o estado sempre manda no campo,
     inclusive na hidratação (ver as regras de lint do exame). -->
<li class="item" class:marcado>
	<label class="pergunta">
		<CaixaPrivada
			{marcado}
			aoMudar={aoMarcar}
			descricao={item.nota ? `nota-${item.id}` : undefined}
			{desativado}
		/>
		<span id="pergunta-{item.id}">{item.pergunta}</span>
	</label>
	{#if item.nota}
		<p class="nota" id="nota-{item.id}">{item.nota}</p>
	{/if}
	{#if item.status !== 'aprovado'}
		<p class="rascunho">Rascunho em revisão: só aparece no modo de desenvolvimento.</p>
	{/if}
	{#if marcado && item.grave}
		<label class="vezes">
			<span>{rotuloVezes} <span class="opcional">(opcional)</span></span>
			<!-- A pergunta descreve o campo: com vários itens marcados, cada "quantas vezes" é único. -->
			<TextoPrivado
				valor={vezes}
				aoMudar={aoDefinirVezes}
				descricao="pergunta-{item.id}"
				{desativado}
			/>
		</label>
	{/if}
</li>

<style>
	.item {
		padding: var(--espaco-2);
		border-left: 3px solid transparent;
	}

	.item:not(:first-child) {
		border-top: 1px solid var(--cor-filete);
	}

	.marcado {
		border-left-color: var(--cor-rubrica);
		background: var(--cor-papel-2);
	}

	.pergunta {
		display: flex;
		gap: var(--espaco-3);
		align-items: flex-start;
		min-height: 44px;
		cursor: pointer;
		font-family: var(--fonte-texto);
		font-size: var(--tam-texto);
	}

	.pergunta :global(input) {
		flex: none;
		width: 1.4rem;
		height: 1.4rem;
		/* Sem margem lateral: a nota e o campo alinham com o texto da pergunta. */
		margin: 0.2rem 0 0;
	}

	.nota {
		margin: var(--espaco-1) 0 0 calc(1.4rem + var(--espaco-3));
		color: var(--cor-tinta-suave);
		font-size: 0.9375rem;
	}

	.rascunho {
		margin: var(--espaco-1) 0 0 calc(1.4rem + var(--espaco-3));
		color: var(--cor-rubrica);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.vezes {
		--largura-campo: 14rem;
		display: flex;
		flex-wrap: wrap;
		gap: var(--espaco-1) var(--espaco-2);
		align-items: center;
		margin: var(--espaco-2) 0 0 calc(1.4rem + var(--espaco-3));
		font-size: 0.9375rem;
	}

	.opcional {
		color: var(--cor-tinta-suave);
	}
</style>
