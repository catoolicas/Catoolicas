<script lang="ts">
	import '../app.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	// Faces usadas logo ao abrir qualquer página (texto e títulos): pré-carregadas, para o texto não
	// trocar de fonte depois e para nenhuma página buscar fonte só depois de uma interação.
	import fonteNormal from '#lib/fontes/cormorant-garamond-latin-400-normal.woff2?url';
	import fonteSemiNegrito from '#lib/fontes/cormorant-garamond-latin-600-normal.woff2?url';

	let { children }: LayoutProps = $props();

	// A página atual é identificada pela rota (page.route.id), que não muda com o subcaminho
	// de publicação nem com a barra final; `href` é relativo (paths.relative).
	// `recarregar`: o Exame abre sempre com carga completa da página (ADR-0004), para começar do
	// zero e já com a política de segurança própria dele.
	const links = [
		{ rota: '/', href: resolve('/'), rotulo: 'Início', recarregar: false },
		{ rota: '/terco', href: resolve('terco/'), rotulo: 'Terço', recarregar: false },
		{ rota: '/exame', href: resolve('exame/'), rotulo: 'Exame', recarregar: true },
		{ rota: '/sobre', href: resolve('sobre/'), rotulo: 'Sobre', recarregar: false }
	];

	// Saindo do Exame, todo link também recarrega a página: a memória dele é descartada inteira.
	const recarregarTudo = $derived(page.route.id === '/exame' ? '' : undefined);

	/** "page" na própria página; "true" nas páginas internas da seção (por exemplo, uma série). */
	function atual(rota: string): 'page' | 'true' | undefined {
		const id = page.route.id;
		if (id === rota) return 'page';
		if (rota !== '/' && id?.startsWith(`${rota}/`)) return 'true';
		return undefined;
	}
</script>

<svelte:head>
	<link rel="preload" href={fonteNormal} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={fonteSemiNegrito} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<a class="pular" href="#conteudo">Pular para o conteúdo</a>

<header class="cabecalho" data-sveltekit-reload={recarregarTudo}>
	<div class="cabecalho-interno">
		<a class="marca" href={resolve('/')}>Catoolicas</a>
		<nav aria-label="Principal">
			<ul>
				{#each links as link (link.rota)}
					<li>
						<a
							href={link.href}
							aria-current={atual(link.rota)}
							data-sveltekit-reload={link.recarregar ? '' : undefined}
						>
							{link.rotulo}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</header>

<main id="conteudo" tabindex="-1" data-sveltekit-reload={recarregarTudo}>
	{@render children()}
</main>

<footer class="rodape" data-sveltekit-reload={recarregarTudo}>
	<p>
		Software livre sob a licença
		<a href="https://www.gnu.org/licenses/gpl-3.0.html" rel="external noopener noreferrer">
			GNU GPL, versão 3 ou posterior
		</a>.
		<a href="https://github.com/catoolicas/Catoolicas" rel="external noopener noreferrer">
			Código-fonte
		</a>.
	</p>
</footer>

<style>
	.pular {
		position: absolute;
		left: var(--margem-lateral);
		top: -100%;
		z-index: 10;
		padding: var(--espaco-2) var(--espaco-3);
		background: var(--cor-tinta);
		color: var(--cor-papel);
	}

	.pular:focus {
		top: var(--espaco-2);
	}

	.cabecalho {
		border-bottom: 1px solid var(--cor-filete);
	}

	.cabecalho-interno,
	main,
	.rodape {
		max-width: var(--largura-pagina, var(--largura-texto));
		margin-inline: auto;
		padding-inline: var(--margem-lateral);
	}

	.cabecalho-interno {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--espaco-2) var(--espaco-4);
		padding-block: var(--espaco-3);
	}

	.marca {
		font-family: var(--fonte-texto);
		font-size: 1.25rem;
		font-weight: 600;
		text-decoration: none;
	}

	nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--espaco-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* Alvos de toque confortáveis (≥ 44 px de altura). */
	nav a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding-inline: var(--espaco-2);
	}

	nav a[aria-current] {
		text-decoration-thickness: 0.15em;
	}

	main {
		padding-block: var(--espaco-4) var(--espaco-5);
	}

	main:focus {
		outline: none;
	}

	.rodape {
		padding-block: var(--espaco-4);
		border-top: 1px solid var(--cor-filete);
		color: var(--cor-tinta-suave);
		font-size: 0.875rem;
	}
</style>
