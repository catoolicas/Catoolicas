/**
 * Verifica o orçamento de desempenho do build estático.
 *
 * Para cada página HTML em `build/`, mede (gzip nível 9) o próprio HTML e os recursos que
 * ela carrega de início: JS (`modulepreload`, `preload as=script`, `<script src>` e `import()`
 * literal em scripts inline) e CSS (`stylesheet` e `preload as=style`).
 * Compara com os limites de `scripts/budgets.json` e termina com código 1 se algum for excedido.
 *
 * Uso: pnpm build && pnpm budget
 * Zero dependências: só módulos nativos do Node (executado com type stripping).
 */
import { readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

export type Limites = { htmlGzip: number; jsGzip: number; cssGzip: number };
export type LimiteFontes = { arquivos: number; bytes: number };
export type Orcamento = {
	padrao: Limites;
	paginas?: Record<string, Partial<Limites>>;
	/** Todas as fontes .woff2 do build (já comprimidas; mede-se o tamanho real). */
	fontes?: LimiteFontes;
};
export type Medicao = { pagina: string; htmlGzip: number; jsGzip: number; cssGzip: number };
export type Violacao = { pagina: string; metrica: keyof Limites; medido: number; limite: number };

const METRICAS = ['htmlGzip', 'jsGzip', 'cssGzip'] as const;

/** Lê atributos com aspas duplas, simples ou sem aspas (HTML minificado). */
function atributos(tag: string): Record<string, string> {
	const resultado: Record<string, string> = {};
	const padrao = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
	for (const [, nome, duplas, simples, semAspas] of tag.matchAll(padrao)) {
		const valor = duplas ?? simples ?? semAspas;
		if (nome !== undefined && valor !== undefined) resultado[nome.toLowerCase()] = valor;
	}
	return resultado;
}

/** Extrai os caminhos de JS e CSS carregados de início por uma página HTML. */
export function extrairRecursos(html: string): { js: string[]; css: string[] } {
	const js = new Set<string>();
	const css = new Set<string>();
	for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
		const { rel, href, as } = atributos(tag);
		if (!href || !rel) continue;
		const rels = rel.toLowerCase().split(/\s+/);
		const preload = rels.includes('preload');
		if (rels.includes('modulepreload') || (preload && as === 'script')) js.add(href);
		else if (rels.includes('stylesheet') || (preload && as === 'style')) css.add(href);
	}
	for (const [, abertura, corpo] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
		const { src } = atributos(`<script${abertura ?? ''}>`);
		if (src) js.add(src);
		for (const [, alvo] of (corpo ?? '').matchAll(/\bimport\(\s*["']([^"']+)["']\s*\)/g)) {
			if (alvo) js.add(alvo);
		}
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
			// Deduplica pelo caminho resolvido: o mesmo arquivo pode aparecer com grafias diferentes.
			const somar = (caminhos: string[]) => {
				const alvos = new Set(
					caminhos.map((href) =>
						href.startsWith('/') ? join(diretorioBuild, href) : resolve(dirname(arquivo), href)
					)
				);
				return [...alvos].reduce((total, alvo) => total + tamanhoGzip(readFileSync(alvo)), 0);
			};
			return {
				pagina: relative(diretorioBuild, arquivo),
				htmlGzip: tamanhoGzip(html),
				jsGzip: somar(js),
				cssGzip: somar(css)
			};
		});
}

/** Fontes .woff2 do build: quantas e quantos bytes. */
export function medirFontes(diretorioBuild: string): LimiteFontes {
	const arquivos = (readdirSync(diretorioBuild, { recursive: true }) as string[]).filter((f) =>
		f.endsWith('.woff2')
	);
	return {
		arquivos: arquivos.length,
		bytes: arquivos.reduce((total, f) => total + statSync(join(diretorioBuild, f)).size, 0)
	};
}

/** Mensagens para cada limite de fontes excedido (vazio se estiver dentro). */
export function avaliarFontes(medido: LimiteFontes, limite: LimiteFontes | undefined): string[] {
	if (!limite) return [];
	const erros: string[] = [];
	if (medido.arquivos > limite.arquivos)
		erros.push(`fontes: ${medido.arquivos} arquivos (limite ${limite.arquivos})`);
	if (medido.bytes > limite.bytes)
		erros.push(`fontes: ${medido.bytes} bytes (limite ${limite.bytes})`);
	return erros;
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

	const fontes = medirFontes(join(raiz, 'build'));
	if (orcamento.fontes)
		console.log(
			`\nFontes: ${fontes.arquivos} arquivo(s), ${kb(fontes.bytes)} / ${orcamento.fontes.arquivos} arquivo(s), ${kb(orcamento.fontes.bytes)}`
		);

	const violacoes = avaliar(medicoes, orcamento);
	const errosDeFontes = avaliarFontes(fontes, orcamento.fontes);
	if (violacoes.length > 0 || errosDeFontes.length > 0) {
		console.error('\nOrçamento excedido:');
		for (const v of violacoes) {
			console.error(`- ${v.pagina}: ${v.metrica} = ${kb(v.medido)} (limite ${kb(v.limite)})`);
		}
		for (const e of errosDeFontes) console.error(`- ${e}`);
		process.exit(1);
	}
	console.log(`\nOrçamento respeitado em ${medicoes.length} página(s).`);
}

// Compara caminhos reais: um caminho com link simbólico não pode desativar a verificação.
const executadoDiretamente =
	process.argv[1] !== undefined &&
	realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (executadoDiretamente) principal();
