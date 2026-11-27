import { resolve } from '$app/paths';

/**
 * Registra o service worker do site (ADR-0005). Chamado só pelas páginas do Terço: a do Exame
 * mantém `worker-src 'none'` na sua política de segurança.
 *
 * Espera a página terminar de carregar, para não competir com ela. Onde o navegador não aceita
 * service worker em módulo, o site continua funcionando online, sem uso offline, e sem erro.
 */
export function registrarServiceWorker(): void {
	if (!('serviceWorker' in navigator)) return;
	const registrar = () => {
		// A raiz do site (com o subcaminho de publicação, se houver), a partir da página atual.
		const raiz = new URL(resolve('/'), location.href);
		navigator.serviceWorker
			.register(new URL('service-worker.js', raiz), { type: 'module' })
			.catch(() => undefined);
	};
	if (document.readyState === 'complete') registrar();
	else addEventListener('load', registrar, { once: true });
}
