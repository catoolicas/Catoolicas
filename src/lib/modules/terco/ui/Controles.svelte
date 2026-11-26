<script lang="ts">
	import type { Progresso } from '../domain/navegacao.ts';
	import type { Comando } from '../domain/teclado.ts';

	type Props = {
		progresso: Progresso;
		textoCompleto: boolean;
		aoComandar: (comando: Comando) => void;
		aoAbrirPreferencias: () => void;
	};
	let { progresso, textoCompleto, aoComandar, aoAbrirPreferencias }: Props = $props();
</script>

<div class="controles">
	<div class="progresso">
		<label for="progresso-aves">
			Ave-Marias: {progresso.avesRezadas} de {progresso.totalAves}
		</label>
		<progress id="progresso-aves" max={progresso.totalAves} value={progresso.avesRezadas}
		></progress>
	</div>

	<nav class="botoes" aria-label="Navegação do terço">
		<button type="button" onclick={() => aoComandar('dezena-anterior')}>Dezena anterior</button>
		<button type="button" onclick={() => aoComandar('anterior')}>Anterior</button>
		<button type="button" class="principal" onclick={() => aoComandar('proximo')}>Próximo</button>
		<button type="button" onclick={() => aoComandar('proxima-dezena')}>Próxima dezena</button>
	</nav>

	<div class="secundarios">
		<button type="button" aria-pressed={textoCompleto} onclick={() => aoComandar('alternar-texto')}>
			Texto das orações
		</button>
		<button type="button" onclick={aoAbrirPreferencias}>Preferências</button>
		<button type="button" onclick={() => aoComandar('ajuda')}>Atalhos</button>
	</div>
</div>

<style>
	.controles {
		display: grid;
		gap: var(--espaco-3);
	}

	.progresso {
		display: grid;
		gap: var(--espaco-1);
		font-size: 0.875rem;
		color: var(--cor-tinta-suave);
	}

	progress {
		width: 100%;
		accent-color: var(--cor-serie);
	}

	.botoes,
	.secundarios {
		display: flex;
		flex-wrap: wrap;
		gap: var(--espaco-2);
	}

	button {
		min-height: 44px;
		min-width: 44px;
		padding: var(--espaco-2) var(--espaco-3);
		border: 1px solid var(--cor-filete);
		border-radius: 6px;
		background: var(--cor-papel-2);
		color: var(--cor-tinta);
		font: inherit;
		cursor: pointer;
	}

	button:hover {
		border-color: var(--cor-serie);
	}

	.principal {
		flex: 1 1 8rem;
		background: var(--cor-serie);
		border-color: var(--cor-serie);
		color: var(--cor-papel);
		font-weight: 600;
	}

	.secundarios button {
		font-size: 0.875rem;
	}

	button[aria-pressed='true'] {
		border-color: var(--cor-serie);
		box-shadow: inset 0 0 0 1px var(--cor-serie);
	}

	/* Celular: controles principais fixos na zona do polegar. */
	@media (max-width: 959px) {
		.botoes {
			position: sticky;
			bottom: 0;
			z-index: 5;
			padding: var(--espaco-2) 0;
			background: var(--cor-papel);
			border-top: 1px solid var(--cor-filete);
		}
	}
</style>
