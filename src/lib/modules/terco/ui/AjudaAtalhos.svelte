<script lang="ts">
	import { AJUDA_ATALHOS } from '../domain/teclado.ts';

	type Props = { letrasLigadas: boolean; aoFechar: () => void };
	let { letrasLigadas, aoFechar }: Props = $props();
</script>

<div class="ajuda">
	<h2 id="titulo-ajuda">Atalhos de teclado</h2>
	<table>
		<thead>
			<tr>
				<th scope="col">Ação</th>
				<th scope="col">Teclas</th>
				<th scope="col">De uma tecla</th>
			</tr>
		</thead>
		<tbody>
			{#each AJUDA_ATALHOS as item (item.comando)}
				<tr>
					<th scope="row">{item.descricao}</th>
					<td>
						{#each item.teclas as tecla (tecla)}<kbd>{tecla}</kbd>
						{/each}
					</td>
					<td>
						{#each item.letras as tecla (tecla)}<kbd>{tecla}</kbd>
						{/each}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<p>
		Os atalhos de uma tecla estão <strong>{letrasLigadas ? 'ligados' : 'desligados'}</strong>. Eles
		podem ser desligados em Preferências, por exemplo para quem usa comando de voz.
	</p>
	<button type="button" onclick={aoFechar}>Fechar</button>
</div>

<style>
	.ajuda {
		display: grid;
		gap: var(--espaco-3);
	}

	h2 {
		margin: 0;
	}

	table {
		border-collapse: collapse;
		width: 100%;
	}

	th,
	td {
		padding: var(--espaco-1) var(--espaco-2);
		border-bottom: 1px solid var(--cor-filete);
		text-align: left;
		vertical-align: top;
	}

	kbd {
		display: inline-block;
		padding: 0 0.35em;
		border: 1px solid var(--cor-filete);
		border-radius: 4px;
		font-family: var(--fonte-ui);
		font-size: 0.85em;
	}

	button {
		justify-self: end;
		min-height: 44px;
		padding: var(--espaco-2) var(--espaco-3);
		border: 1px solid var(--cor-filete);
		border-radius: 6px;
		background: var(--cor-papel-2);
		color: var(--cor-tinta);
		font: inherit;
		cursor: pointer;
	}
</style>
