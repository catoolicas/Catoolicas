<script lang="ts">
	import { JACULATORIAS } from '../comum.ts';
	import type { Preferencias } from '../state/preferencias.ts';

	type Props = {
		preferencias: Preferencias;
		aoMudar: (parcial: Partial<Preferencias>) => void;
		aoApagar: () => void;
		aoFechar: () => void;
	};
	let { preferencias, aoMudar, aoApagar, aoFechar }: Props = $props();

	let apagado = $state(false);

	function alternarJaculatoria(id: string, marcada: boolean) {
		const escolhidas = marcada
			? [...preferencias.jaculatorias, id]
			: preferencias.jaculatorias.filter((j) => j !== id);
		// Mantém a ordem canônica da lista.
		aoMudar({ jaculatorias: JACULATORIAS.map((j) => j.id).filter((j) => escolhidas.includes(j)) });
	}
</script>

<div class="painel">
	<h2 id="titulo-preferencias">Preferências</h2>

	<fieldset>
		<legend>Idioma das orações</legend>
		<label>
			<input
				type="radio"
				name="idioma"
				value="pt"
				checked={preferencias.idioma === 'pt'}
				onchange={() => aoMudar({ idioma: 'pt' })}
			/>
			Português
		</label>
		<label>
			<input
				type="radio"
				name="idioma"
				value="la"
				checked={preferencias.idioma === 'la'}
				onchange={() => aoMudar({ idioma: 'la' })}
			/>
			Latim
		</label>
	</fieldset>

	<fieldset>
		<legend>Modo de rezar</legend>
		<label>
			<input
				type="checkbox"
				checked={preferencias.meditacoesMontfort}
				onchange={(e) => aoMudar({ meditacoesMontfort: e.currentTarget.checked })}
			/>
			Meditações de São Luís de Montfort (um ponto em cada Ave-Maria)
		</label>
		<label>
			<input
				type="checkbox"
				checked={preferencias.clausulas}
				onchange={(e) => aoMudar({ clausulas: e.currentTarget.checked })}
			/>
			Rosário das cláusulas (a cláusula do mistério em cada Ave-Maria)
		</label>
		<label>
			<input
				type="checkbox"
				checked={preferencias.textoCompleto}
				onchange={(e) => aoMudar({ textoCompleto: e.currentTarget.checked })}
			/>
			Mostrar o texto completo das orações
		</label>
	</fieldset>

	<fieldset>
		<legend>Jaculatórias ao fim de cada dezena</legend>
		{#each JACULATORIAS as j (j.id)}
			<label>
				<input
					type="checkbox"
					checked={preferencias.jaculatorias.includes(j.id)}
					onchange={(e) => alternarJaculatoria(j.id, e.currentTarget.checked)}
				/>
				{j.devocao.pt}
			</label>
		{/each}
	</fieldset>

	<fieldset>
		<legend>Teclado</legend>
		<label>
			<input
				type="checkbox"
				checked={preferencias.atalhosLetras}
				onchange={(e) => aoMudar({ atalhosLetras: e.currentTarget.checked })}
			/>
			Atalhos de uma tecla (Espaço, letras e Vim). As setas funcionam sempre.
		</label>
	</fieldset>

	<section aria-labelledby="titulo-dados">
		<h3 id="titulo-dados">Dados deste aparelho</h3>
		<p>As preferências e o progresso do dia ficam só neste navegador. Nada é enviado a ninguém.</p>
		<button
			type="button"
			onclick={() => {
				aoApagar();
				apagado = true;
			}}
		>
			Apagar dados deste aparelho
		</button>
		{#if apagado}<p role="status">Dados apagados.</p>{/if}
	</section>

	<button type="button" class="fechar" onclick={aoFechar}>Fechar</button>
</div>

<style>
	.painel {
		display: grid;
		gap: var(--espaco-3);
	}

	h2,
	h3 {
		margin: 0;
	}

	fieldset {
		display: grid;
		gap: var(--espaco-2);
		margin: 0;
		padding: var(--espaco-3);
		border: 1px solid var(--cor-filete);
		border-radius: 6px;
	}

	legend {
		font-weight: 600;
	}

	label {
		display: flex;
		gap: var(--espaco-2);
		align-items: flex-start;
		min-height: 32px;
	}

	input {
		margin-top: 0.3em;
		accent-color: var(--cor-serie);
	}

	button {
		justify-self: start;
		min-height: 44px;
		padding: var(--espaco-2) var(--espaco-3);
		border: 1px solid var(--cor-filete);
		border-radius: 6px;
		background: var(--cor-papel-2);
		color: var(--cor-tinta);
		font: inherit;
		cursor: pointer;
	}

	.fechar {
		justify-self: end;
	}
</style>
