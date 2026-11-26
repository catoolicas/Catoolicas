/**
 * Verifica o orçamento de desempenho do build estático.
 *
 * Para cada página HTML em `build/`, mede (gzip nível 9) o próprio HTML e os recursos que
 * ela carrega de início: JS (modulepreload e <script src>) e CSS (<link rel="stylesheet">).
 * Compara com os limites de `scripts/budgets.json` e termina com código 1 se algum for excedido.
 *
 * Uso: pnpm build && pnpm budget
 * Zero dependências: só módulos nativos do Node (executado com type stripping).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

export type Limites = { htmlGzip: number; jsGzip: number; cssGzip: number };
export type Orcamento = { padrao: Limites; paginas?: Record<string, Partial<Limites>> };
export type Medicao = { pagina: string; htmlGzip: number; jsGzip: number; cssGzip: number };
export type Violacao = { pagina: string; metrica: keyof Limites; medido: number; limite: number };

const METRICAS = ['htmlGzip', 'jsGzip', 'cssGzip'] as const;

function atributos(tag: string): Record<string, string> {
	const resultado: Record<string, string> = {};
	for (const [, nome, valor] of tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) {
		if (nome !== undefined && valor !== undefined) resultado[nome.toLowerCase()] = valor;
	}
	return resultado;
}

/** Extrai os caminhos de JS e CSS carregados de início por uma página HTML. */
export function extrairRecursos(html: string): { js: string[]; css: string[] } {
	const js = new Set<string>();
	const css = new Set<string>();
	for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
		const { rel, href } = atributos(tag);
		if (!href || !rel) continue;
		const rels = rel.toLowerCase().split(/\s+/);
		if (rels.includes('modulepreload')) js.add(href);
		else if (rels.includes('stylesheet')) css.add(href);
	}
	for (const [tag] of html.matchAll(/<script\b[^>]*>/gi)) {
		const { src } = atributos(tag);
		if (src) js.add(src);
	}
	return { js: [...js], css: [...css] };
}

export function limitesPara(pagina: string, orcamento: Orcamento): Limites {
	return { ...orcamento.padrao, ...orcamento.paginas?.[pagina] };
}

export function avaliar(medicoes: Medicao[], orcamento: Orcamento): Violacao[] {
	const violacoes: Violacao[] = [];
	for (const medicao of medicoes) {
		const limites = limitesPara(medicao.pagina, orcamento);
		for (const metrica of METRICAS) {
			if (medicao[metrica] > limites[metrica]) {
				violacoes.push({
					pagina: medicao.pagina,
					metrica,
					medido: medicao[metrica],
					limite: limites[metrica]
				});
			}
		}
	}
	return violacoes;
}

export function tamanhoGzip(conteudo: Buffer | string): number {
	return gzipSync(conteudo, { level: 9 }).length;
}

function listarHtml(diretorio: string): string[] {
	return readdirSync(diretorio).flatMap((nome) => {
		const caminho = join(diretorio, nome);
		if (statSync(caminho).isDirectory()) return listarHtml(caminho);
		return caminho.endsWith('.html') ? [caminho] : [];
	});
}

export function medirBuild(diretorioBuild: string): Medicao[] {
	return listarHtml(diretorioBuild)
		.sort()
		.map((arquivo) => {
			const html = readFileSync(arquivo, 'utf8');
			const { js, css } = extrairRecursos(html);
			const somar = (caminhos: string[]) =>
				caminhos.reduce((total, href) => {
					const alvo = href.startsWith('/')
						? join(diretorioBuild, href)
						: resolve(dirname(arquivo), href);
					return total + tamanhoGzip(readFileSync(alvo));
				}, 0);
			return {
				pagina: relative(diretorioBuild, arquivo),
				htmlGzip: tamanhoGzip(html),
				jsGzip: somar(js),
				cssGzip: somar(css)
			};
		});
}

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

function principal(): void {
	const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
	const orcamento = JSON.parse(
		readFileSync(join(raiz, 'scripts/budgets.json'), 'utf8')
	) as Orcamento;
	const medicoes = medirBuild(join(raiz, 'build'));
	if (medicoes.length === 0) {
		console.error('Nenhuma página em build/. Rode `pnpm build` antes.');
		process.exit(1);
	}

	console.log('| Página | HTML (gzip) | JS inicial (gzip) | CSS (gzip) |');
	console.log('|---|---|---|---|');
	for (const m of medicoes) {
		const l = limitesPara(m.pagina, orcamento);
		console.log(
			`| ${m.pagina} | ${kb(m.htmlGzip)} / ${kb(l.htmlGzip)} | ${kb(m.jsGzip)} / ${kb(l.jsGzip)} | ${kb(m.cssGzip)} / ${kb(l.cssGzip)} |`
		);
	}

	const violacoes = avaliar(medicoes, orcamento);
	if (violacoes.length > 0) {
		console.error('\nOrçamento excedido:');
		for (const v of violacoes) {
			console.error(`- ${v.pagina}: ${v.metrica} = ${kb(v.medido)} (limite ${kb(v.limite)})`);
		}
		process.exit(1);
	}
	console.log(`\nOrçamento respeitado em ${medicoes.length} página(s).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) principal();
