<script lang="ts">
	// Campo de texto do exame. Os atributos fixos são os de CAMPO_PRIVADO (campos.ts), escritos
	// literalmente: assim já estão no HTML pré-renderizado (antes de qualquer restauração de
	// formulário pelo navegador) e não pesam no JS. A suíte E2E confere todos os campos.
	type Props = { valor: string; aoMudar: (texto: string) => void };
	let { valor, aoMudar }: Props = $props();
</script>

<input
	type="text"
	value={valor}
	oninput={(e) => aoMudar(e.currentTarget.value)}
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
/>

<style>
	input {
		min-height: 44px;
		width: 100%;
		max-width: var(--largura-campo, 28rem);
		padding: var(--espaco-1) var(--espaco-2);
		border: 1px solid var(--cor-tinta-suave);
		border-radius: 4px;
		background: var(--cor-papel);
		color: var(--cor-tinta);
		font: inherit;
	}
</style>
