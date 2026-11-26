/**
 * Servidor estático mínimo para os testes E2E, servindo `build/` exatamente como está.
 *
 * Semântica deliberadamente estrita, como os servidores estáticos mais simples:
 * - `/caminho/` serve `caminho/index.html`;
 * - `/arquivo.ext` serve o arquivo;
 * - nada é adivinhado: sem mapear `/sobre` para `sobre.html` e sem redirecionar diretórios.
 *   Assim, um link interno sem a barra final falha no teste em vez de passar despercebido.
 *
 * Diferente do `vite preview`, que serve `.svelte-kit/output` e resolve URLs sem extensão.
 * Uso: node scripts/serve-build.ts [porta] [subcaminho]
 * Com subcaminho (por exemplo, `/Catoolicas`, como no GitHub Pages), só URLs dentro dele são
 * servidas, como acontecerá em produção.
 */
import { createReadStream, realpathSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const TIPOS: Readonly<Record<string, string>> = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.txt': 'text/plain; charset=utf-8',
	'.png': 'image/png',
	'.avif': 'image/avif',
	'.webp': 'image/webp',
	'.woff2': 'font/woff2',
	'.ico': 'image/x-icon'
};

/**
 * Converte o caminho da URL no arquivo a servir, ou `null` se não houver arquivo
 * correspondente (ou se o caminho tentar sair da raiz).
 */
export function resolverArquivo(raiz: string, caminhoUrl: string, base = ''): string | null {
	let decodificado: string;
	try {
		decodificado = decodeURIComponent(caminhoUrl.split('?')[0]?.split('#')[0] ?? '/');
	} catch {
		return null;
	}
	if (base) {
		if (!decodificado.startsWith(`${base}/`)) return null;
		decodificado = decodificado.slice(base.length);
	}
	if (decodificado.includes('\0')) return null;

	const raizAbsoluta = resolve(raiz);
	const relativo = decodificado.endsWith('/') ? `${decodificado}index.html` : decodificado;
	const alvo = resolve(raizAbsoluta, `.${normalize(`/${relativo}`)}`);
	if (alvo !== raizAbsoluta && !alvo.startsWith(raizAbsoluta + sep)) return null;

	try {
		return statSync(alvo).isFile() ? alvo : null;
	} catch {
		return null;
	}
}

function principal(): void {
	const raiz = resolve(fileURLToPath(new URL('..', import.meta.url)), 'build');
	const porta = Number(process.argv[2] ?? 4173);
	const base = process.argv[3] ?? '';

	createServer((req, res) => {
		const arquivo = resolverArquivo(raiz, req.url ?? '/', base);
		if (!arquivo || (req.method !== 'GET' && req.method !== 'HEAD')) {
			res.writeHead(arquivo ? 405 : 404, { 'content-type': 'text/plain; charset=utf-8' });
			res.end(arquivo ? 'Método não permitido' : 'Não encontrado');
			return;
		}
		res.writeHead(200, {
			'content-type': TIPOS[extname(arquivo)] ?? 'application/octet-stream',
			'x-content-type-options': 'nosniff'
		});
		if (req.method === 'HEAD') res.end();
		else createReadStream(arquivo).pipe(res);
	}).listen(porta, 'localhost', () => {
		console.log(`Servindo ${raiz} em http://localhost:${porta}${base}/`);
	});
}

const executadoDiretamente =
	process.argv[1] !== undefined &&
	realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (executadoDiretamente) principal();
