/**
 * Regras de lint do Exame de consciência (ADR-0004).
 *
 * Nada do que a pessoa marca ou escreve no exame pode sair da memória da página: nem para a
 * rede (inclusive a própria origem, por URL de imagem ou de link), nem para armazenamento do
 * navegador, nem para o histórico, a URL, o título ou o console.
 *
 * Estas regras são uma **barreira contra descuidos**, não uma caixa de areia: código feito para
 * burlá-las ainda é possível (por exemplo, `throw new Error(dado)` aparece no console). Por isso há
 * também a CSP própria da página e a suíte de privacidade E2E (`tests/e2e/exame.e2e.ts`), que mede
 * o que realmente acontece no navegador. Lacunas encontradas na revisão independente da CHG-0006
 * estão cobertas em `eslint-privacidade.test.ts`.
 */
import type { Linter } from 'eslint';

/** Código do exame: regras completas. */
export const ARQUIVOS_DO_EXAME = ['src/lib/modules/exame/**', 'src/routes/exame/**'];

/**
 * Código que também roda na página do exame, mas é de todo o site (layout e hooks): sem as regras
 * de marcação e de imports, que o layout precisa (links da navegação, CSS global).
 */
export const ARQUIVOS_COMPARTILHADOS = [
	'src/routes/+layout.svelte',
	'src/routes/+layout.ts',
	'src/hooks.client.ts',
	'src/hooks.ts'
];

const MOTIVO = 'Exame de consciência: nada pode sair da memória da página (ADR-0004).';

/** Globais que dão acesso à rede, a armazenamento, ao histórico, ao console ou a outras janelas. */
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
	// Console e relatório de erros (inclusive por apelido: `const c = console`)
	'console',
	'reportError',
	// Objetos que dão acesso a todos os anteriores (`window.fetch`, `navigator.sendBeacon`...)
	'window',
	'self',
	'globalThis',
	'navigator',
	'history',
	'location'
] as const;

/** Propriedades proibidas em qualquer objeto (`x.fetch`, `x['fetch']`, `const { fetch } = x`). */
const PROPRIEDADES =
	'fetch|sendBeacon|localStorage|sessionStorage|indexedDB|caches|cookie|cookieStore|' +
	'pushState|replaceState|defaultView|contentWindow|opener|postMessage|serviceWorker|' +
	'clipboard|title|location|history|navigator|open|write|writeln|console';

/** Atributos que fazem o navegador buscar ou navegar para uma URL. */
const ATRIBUTOS_DE_URL =
	'src|srcset|href|action|formaction|poster|data|ping|background|imagesrcset|xlink:href';

/** Elementos que buscam algo na rede, navegam ou enviam. O exame não precisa de nenhum. */
const ELEMENTOS_DE_REDE =
	'a|img|picture|source|track|video|audio|iframe|frame|object|embed|link|script|image|use|form|base';

const regrasDeCodigo: Linter.RulesRecord = {
	'no-restricted-globals': [
		'error',
		...GLOBAIS_PROIBIDAS.map((name) => ({ name, message: MOTIVO }))
	],
	'no-console': 'error',
	'no-eval': 'error',
	'no-implied-eval': 'error',
	'no-new-func': 'error'
};

const seletoresDeCodigo = [
	{
		selector: `MemberExpression[computed=false][property.name=/^(${PROPRIEDADES})$/]`,
		message: MOTIVO
	},
	{
		selector: `MemberExpression[computed=true][property.value=/^(${PROPRIEDADES})$/]`,
		message: MOTIVO
	},
	{
		selector: `ObjectPattern > Property[key.name=/^(${PROPRIEDADES})$/]`,
		message: MOTIVO
	}
];

const seletoresDeMarcacao = [
	{
		// O único import dinâmico permitido é o dos rascunhos, só no modo de desenvolvimento.
		selector: 'ImportExpression:not([source.value=/^#content\\/exame\\/[\\w-]+\\.ts$/])',
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
		selector: `SvelteElement[name.name=/^(${ELEMENTOS_DE_REDE})$/]`,
		message: `${MOTIVO} Elemento que busca algo na rede, navega ou envia (inclusive <form>).`
	},
	{
		selector: 'SvelteElement[name.name="svelte:element"]',
		message: `${MOTIVO} Sem <svelte:element>: o tipo do elemento precisa ser conhecido.`
	},
	{
		selector: `SvelteAttribute[key.name=/^(${ATRIBUTOS_DE_URL})$/] SvelteMustacheTag`,
		message: `${MOTIVO} URL montada com dados.`
	},
	{
		selector: `SvelteShorthandAttribute[key.name=/^(${ATRIBUTOS_DE_URL})$/]`,
		message: `${MOTIVO} URL montada com dados.`
	},
	{
		// Espalhar atributos esconderia src, href, name etc. (e pesa no JS de todas as páginas).
		selector: 'SvelteSpreadAttribute',
		message: `${MOTIVO} Sem {...atributos}: escreva-os literalmente.`
	},
	{
		// `style:background-image={...}` ou style="...{x}" podem buscar url() com dados.
		selector: 'SvelteStyleDirective',
		message: `${MOTIVO} Sem style: (url() com dados).`
	},
	{
		selector: 'SvelteAttribute[key.name="style"] SvelteMustacheTag',
		message: `${MOTIVO} Sem estilo inline montado com dados.`
	},
	{
		// Título, metadados e CSP da página são fixos: nada do exame vai para o título ou o <head>.
		selector: 'SvelteElement[name.name="svelte:head"] SvelteMustacheTag',
		message: `${MOTIVO} O <svelte:head> do exame é literal.`
	},
	{
		// Sem atributo name: campos sem nome não entram em envio de formulário nem no
		// preenchimento automático baseado em nome.
		selector:
			'SvelteElement[name.name=/^(input|textarea|select)$/] SvelteAttribute[key.name="name"]',
		message: `${MOTIVO} Campos do exame não têm atributo name.`
	}
];

/** Regras do código do exame. */
export const REGRAS_DE_PRIVACIDADE: Linter.RulesRecord = {
	...regrasDeCodigo,
	'no-restricted-syntax': ['error', ...seletoresDeCodigo, ...seletoresDeMarcacao],
	'no-restricted-imports': [
		'error',
		{
			patterns: [
				{
					// Lista do que o exame pode importar. Qualquer outra dependência passa por revisão
					// de privacidade e por uma mudança explícita desta regra. Sem `..` em nenhum
					// caminho: relativos só dentro da mesma pasta (`./x`); o resto pelo nome do pacote.
					regex:
						'^(?!(svelte|svelte/[\\w/-]+|\\$app/(environment|paths|state)|#lib/modules/exame/[\\w./-]+|#content/exame/[\\w./-]+|\\./[\\w.$/-]+)$)|\\.\\.',
					message: `${MOTIVO} Dependência fora da lista permitida.`
				}
			]
		}
	]
};

/** Regras do código compartilhado que roda na página do exame (layout, hooks). */
export const REGRAS_COMPARTILHADAS: Linter.RulesRecord = {
	...regrasDeCodigo,
	'no-restricted-syntax': ['error', ...seletoresDeCodigo]
};
