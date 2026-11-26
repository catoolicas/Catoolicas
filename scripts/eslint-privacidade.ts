/**
 * Regras de lint do Exame de consciência (ADR-0004).
 *
 * Nada do que a pessoa marca ou escreve no exame pode sair da memória da página: nem para a
 * rede, nem para armazenamento do navegador, nem para o histórico, a URL, o título ou o console.
 * Estas regras são uma **barreira contra descuidos**, não uma caixa de areia: código feito para
 * burlá-las ainda é possível. Por isso há também a CSP própria da página e a suíte de
 * privacidade E2E (`tests/e2e/exame.e2e.ts`), que mede o que realmente acontece no navegador.
 */

import type { Linter } from 'eslint';

export const ARQUIVOS_DO_EXAME = ['src/lib/modules/exame/**', 'src/routes/exame/**'];

const MOTIVO = 'Exame de consciência: nada pode sair da memória da página (ADR-0004).';

/** Globais que dão acesso à rede, a armazenamento, ao histórico ou a outras janelas. */
export const GLOBAIS_PROIBIDAS = [
	// Rede
	'fetch',
	'XMLHttpRequest',
	'WebSocket',
	'WebSocketStream',
	'WebTransport',
	'EventSource',
	'Image',
	// Armazenamento
	'localStorage',
	'sessionStorage',
	'indexedDB',
	'caches',
	'cookieStore',
	// Outras janelas, abas e processos
	'BroadcastChannel',
	'Worker',
	'SharedWorker',
	'open',
	'opener',
	'parent',
	'top',
	'frames',
	'postMessage',
	// `window.name` sobrevive à navegação
	'name',
	// Objetos que dão acesso a todos os anteriores (`window.fetch`, `navigator.sendBeacon`...)
	'window',
	'self',
	'globalThis',
	'navigator',
	'history',
	'location'
] as const;

/** Propriedades proibidas em qualquer objeto (`x.fetch`, `x['fetch']`). */
const PROPRIEDADES =
	'fetch|sendBeacon|localStorage|sessionStorage|indexedDB|caches|cookie|cookieStore|' +
	'pushState|replaceState|defaultView|contentWindow|opener|postMessage|serviceWorker|' +
	'clipboard|title|location|history|navigator|open|write|writeln';

export const REGRAS_DE_PRIVACIDADE: Linter.RulesRecord = {
	'no-restricted-globals': [
		'error',
		...GLOBAIS_PROIBIDAS.map((name) => ({ name, message: MOTIVO }))
	],
	'no-restricted-syntax': [
		'error',
		{
			selector: `MemberExpression[computed=false][property.name=/^(${PROPRIEDADES})$/]`,
			message: MOTIVO
		},
		{
			selector: `MemberExpression[computed=true][property.value=/^(${PROPRIEDADES})$/]`,
			message: MOTIVO
		},
		{
			// O único import dinâmico permitido é o dos rascunhos, só no modo de desenvolvimento.
			selector: 'ImportExpression:not([source.value=/^#content\\/exame\\//])',
			message: `${MOTIVO} Import dinâmico só de #content/exame/.`
		},
		{
			// Na hidratação, `bind:value` e `bind:checked` adotam o valor que o navegador tiver
			// restaurado no campo (por exemplo, ao voltar pelo histórico). Use `value={...}` ou
			// `checked={...}` com um evento: o estado sempre manda no campo.
			selector: 'SvelteDirective[kind="Binding"]:not([key.name.name="this"])',
			message: `${MOTIVO} Não use bind: (exceto bind:this) nos campos do exame.`
		},
		{
			// Sem <form>: nada pode ser "enviado", nem por engano (Enter num campo).
			selector: 'SvelteElement[name.name="form"]',
			message: `${MOTIVO} Não use <form> no exame.`
		},
		{
			// Sem atributo name: campos sem nome não entram em envio de formulário nem no
			// preenchimento automático baseado em nome.
			selector:
				'SvelteElement[name.name=/^(input|textarea|select)$/] SvelteAttribute[key.name="name"]',
			message: `${MOTIVO} Campos do exame não têm atributo name.`
		}
	],
	'no-restricted-imports': [
		'error',
		{
			patterns: [
				{
					// Lista do que o exame pode importar. Qualquer outra dependência passa por revisão
					// de privacidade e por uma mudança explícita desta regra.
					regex:
						'^(?!(svelte|svelte/[\\w/-]+|\\$app/(environment|paths|state)|#lib/modules/exame/.+|#content/exame/.+|\\.{1,2}/.+)$)',
					message: `${MOTIVO} Dependência fora da lista permitida.`
				}
			]
		}
	],
	'no-console': 'error',
	'no-eval': 'error',
	'no-implied-eval': 'error',
	'no-new-func': 'error'
};
