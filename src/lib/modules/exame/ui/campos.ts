/**
 * Atributos de todos os campos do exame (ADR-0004).
 *
 * Pedem ao navegador, ao teclado do celular e a extensões conhecidas que não guardem, não
 * restaurem, não corrijam, não traduzam e não sugiram nada do que for marcado ou digitado.
 * São **pedidos, não garantias**: o aviso de privacidade da página diz o que eles não controlam.
 * Os campos também não têm `name` nem ficam dentro de `<form>` (regras de lint do exame).
 *
 * Esta lista é a referência: os componentes (CaixaPrivada, TextoPrivado e o seletor do ato)
 * escrevem os mesmos atributos literalmente, sem espalhamento (`{...}`), que traria ao JS de
 * todas as páginas o código genérico de atributos do Svelte (~2,5 KB). A suíte de privacidade
 * E2E confere, campo a campo, que cada um tem exatamente estes atributos.
 */
export const CAMPO_PRIVADO = {
	// Sem preenchimento automático nem restauração do valor ao voltar pelo histórico (Firefox).
	autocomplete: 'off',
	// Sem corretor, maiúsculas automáticas, sugestões de escrita nem tradução.
	spellcheck: 'false',
	autocorrect: 'off',
	autocapitalize: 'off',
	writingsuggestions: 'false',
	translate: 'no',
	// Gerenciadores de senha (1Password, LastPass, Bitwarden, Dashlane) e corretores (Grammarly,
	// LanguageTool): marcações que eles documentam para ignorar o campo.
	'data-1p-ignore': '',
	'data-lpignore': 'true',
	'data-bwignore': '',
	'data-form-type': 'other',
	'data-gramm': 'false',
	'data-gramm_editor': 'false',
	'data-enable-grammarly': 'false',
	'data-lt-active': 'false'
} as const;
