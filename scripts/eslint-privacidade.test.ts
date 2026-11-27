import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { REGRAS_DE_PRIVACIDADE } from './eslint-privacidade.ts';

const REGRAS = new Set(Object.keys(REGRAS_DE_PRIVACIDADE));

// Usa o eslint.config.js de verdade (os globs e as regras do projeto), só sem informação de
// tipos (os arquivos testados não existem em disco) e rodando apenas as regras de privacidade.
const eslint = new ESLint({
	cwd: process.cwd(),
	overrideConfig: { languageOptions: { parserOptions: { projectService: false, project: null } } },
	ruleFilter: ({ ruleId }) => REGRAS.has(ruleId)
});

async function erros(codigo: string, arquivo: string): Promise<string[]> {
	const [resultado] = await eslint.lintText(codigo, { filePath: arquivo });
	return (resultado?.messages ?? []).map((m) => `${m.ruleId ?? 'parse'}: ${m.message}`);
}

/** Bloqueado por uma regra de privacidade (um erro de sintaxe não conta). */
async function bloqueado(codigo: string, arquivo: string): Promise<boolean> {
	const lista = await erros(codigo, arquivo);
	return lista.length > 0 && lista.every((e) => REGRAS.has(e.split(':')[0] ?? ''));
}

const TS = 'src/lib/modules/exame/ui/__teste__.ts';
const SVELTE = 'src/routes/exame/__teste__.svelte';
const svelte = (script: string, marcacao = '') =>
	`<script lang="ts">\n${script}\n</script>\n${marcacao}\n`;

describe('regras de privacidade do Exame', () => {
	it.each([
		['fetch', "fetch('/x');"],
		['XMLHttpRequest', 'new XMLHttpRequest();'],
		['WebSocket', "new WebSocket('wss://x');"],
		['EventSource', "new EventSource('/x');"],
		['Image (beacon por imagem)', "new Image().src = '/x';"],
		['localStorage', "localStorage.setItem('a', 'b');"],
		['sessionStorage', 'sessionStorage.clear();'],
		['indexedDB', "indexedDB.open('x');"],
		['caches', "caches.open('x');"],
		['BroadcastChannel', "new BroadcastChannel('x');"],
		['window.fetch', "window.fetch('/x');"],
		['globalThis', "globalThis['fetch']('/x');"],
		['navigator.sendBeacon', "navigator.sendBeacon('/x', 'dados');"],
		['document.cookie', "document.cookie = 'a=b';"],
		['document.title', "document.title = 'x';"],
		['propriedade computada', "const d = document; d['cookie'] = 'a=b';"],
		['defaultView', "document.defaultView?.alert('x');"],
		['history', "history.pushState({}, '', '?x');"],
		['location', "location.hash = 'x';"],
		['window.name', "name = 'x';"],
		['console', "console.log('x');"],
		['eval', "eval('1');"],
		['import dinâmico', "await import('https://exemplo.com/x.js');"],
		['dependência fora da lista', "import { goto } from '$app/navigation';"],
		[
			'armazenamento do Terço',
			"import { gravarPreferencias } from '#lib/modules/terco/state/preferencias.ts';"
		],
		// Lacunas apontadas pela revisão independente da CHG-0006:
		[
			'import relativo para fora do exame',
			"import { gravarPreferencias } from '../../terco/state/preferencias.ts';"
		],
		[
			'`..` dentro do caminho do exame',
			"import { gravarPreferencias } from '#lib/modules/exame/../terco/state/preferencias.ts';"
		],
		['apelido do console', "const c = console; c.log('x');"],
		['desestruturação do console', "const { log } = console; log('x');"],
		['reportError', "reportError(new Error('x'));"],
		[
			'desestruturação de propriedade proibida',
			'const { defaultView } = document; void defaultView;'
		]
	])('bloqueia %s em .ts', async (_nome, codigo) => {
		expect(await bloqueado(codigo, TS)).toBe(true);
	});

	it.each([
		['fetch no template', svelte('', "<button onclick={() => fetch('/x')}>x</button>")],
		['bind:value', svelte("let v = $state('');", '<input bind:value={v} />')],
		[
			'bind:checked',
			svelte('let v = $state(false);', '<input type="checkbox" bind:checked={v} />')
		],
		['<form>', svelte('', '<form><input /></form>')],
		['atributo name', svelte('', '<input name="vezes" />')],
		['localStorage no script', svelte("localStorage.setItem('a', 'b');")],
		// Lacunas apontadas pela revisão independente da CHG-0006:
		['<img> com dados na URL', svelte("let x = $state('');", '<img src="?q={x}" alt="" />')],
		['<a> com dados na URL', svelte("let x = $state('');", '<a href="?q={x}">x</a>')],
		['atributo de URL abreviado', svelte("let src = $state('');", '<img {src} alt="" />')],
		[
			'style: com url()',
			svelte("let x = $state('');", '<div style:background-image={`url(?q=${x})`}></div>')
		],
		['style inline com dados', svelte("let x = $state('');", '<div style="color: {x}"></div>')],
		[
			'título com dados',
			svelte("let x = $state('');", '<svelte:head><title>{x}</title></svelte:head>')
		],
		['<svelte:element>', svelte('', '<svelte:element this="form"></svelte:element>')],
		['{...atributos}', svelte('const a = {};', '<input {...a} />')],
		['<link>', svelte('', '<link rel="prefetch" href="./x" />')]
	])('bloqueia %s em .svelte', async (_nome, codigo) => {
		expect(await bloqueado(codigo, SVELTE)).toBe(true);
	});

	it('permite o código normal do exame', async () => {
		const script = [
			"import { flushSync } from 'svelte';",
			"import { resolve } from '$app/paths';",
			"import { montarExame } from '#lib/modules/exame/domain/montagem.ts';",
			"import { dev } from '$app/environment';",
			"import type { ItemExame } from '#lib/modules/exame/domain/tipos.ts';",
			"import { SECOES } from '#content/exame/secoes.ts';",
			"import Outro from './Outro.svelte';",
			'let { item }: { item: ItemExame } = $props();',
			'let marcado = $state(false);',
			'let el: HTMLElement | undefined = $state();',
			"const rascunhos = dev ? import('#content/exame/rascunhos.ts') : null;",
			'function imprimir() { print(); }',
			'function focar() { document.getElementById(item.id)?.focus(); flushSync(); }',
			'void [resolve, montarExame, SECOES, Outro, rascunhos, imprimir, focar];'
		].join('\n');
		const marcacao =
			'<input type="checkbox" checked={marcado} onchange={(e) => (marcado = e.currentTarget.checked)} />' +
			'<section bind:this={el}></section>';
		expect(await erros(svelte(script, marcacao), SVELTE)).toEqual([]);
	});

	it('só vale para o exame: o Terço pode gravar preferências', async () => {
		const arquivo = 'src/lib/modules/terco/state/__teste__.ts';
		expect(await erros("localStorage.setItem('a', 'b');", arquivo)).toEqual([]);
	});

	it('o layout, que também roda no exame, não pode usar armazenamento nem rede', async () => {
		const layout = 'src/routes/+layout.svelte';
		expect(await bloqueado(svelte("localStorage.setItem('a', 'b');"), layout)).toBe(true);
		expect(await bloqueado(svelte("fetch('/x');"), layout)).toBe(true);
		// ...mas continua podendo ter links e importar o CSS global.
		const comLinks = svelte(
			"import '../app.css';\nconst href = '/';",
			'<a {href} data-sveltekit-reload>Início</a>'
		);
		expect(await erros(comLinks, layout)).toEqual([]);
	});
});
