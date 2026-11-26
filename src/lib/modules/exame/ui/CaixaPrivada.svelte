<script lang="ts">
	// Caixa de seleção do exame. Os atributos fixos são os de CAMPO_PRIVADO (campos.ts), escritos
	// literalmente: assim já estão no HTML pré-renderizado (antes de qualquer restauração de
	// formulário pelo navegador) e não pesam no JS. A suíte E2E confere todos os campos.
	type Props = {
		marcado: boolean;
		aoMudar: (sim: boolean) => void;
		descricao?: string;
		/** Desativada até a hidratação (ADR-0004). */
		desativado: boolean;
	};
	let { marcado, aoMudar, descricao, desativado }: Props = $props();
</script>

<input
	type="checkbox"
	checked={marcado}
	onchange={(e) => aoMudar(e.currentTarget.checked)}
	aria-describedby={descricao}
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
/>
