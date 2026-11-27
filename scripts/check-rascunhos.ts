/**
 * Procura, em TODO o build, qualquer texto de rascunho do Exame que ainda esteja em revisão.
 * Uso: pnpm check:rascunhos [pasta] (padrão: build). Falha se achar algum.
 *
 * É a garantia final da porta editorial (ADR-0003, ADR-0004): mesmo que o build seja feito num
 * modo errado (por exemplo, com NODE_ENV=development), nada em revisão é publicado. Roda no CI e
 * no workflow de publicação, logo depois do build.
 */
import { readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ITENS_RASCUNHO, SECOES_RASCUNHO } from '../content/exame/rascunhos.ts';
import type { ItemExame, SecaoExame } from '../src/lib/modules/exame/domain/tipos.ts';

/** Frases curtas demais podem coincidir com outros conteúdos; ids e frases longas não. */
const TAMANHO_MINIMO = 12;

/** Todos os textos (e ids) de seções e itens de rascunho que não estão aprovados. */
export function textosEmRevisao(
	secoes: readonly SecaoExame[] = SECOES_RASCUNHO,
	itens: readonly ItemExame[] = ITENS_RASCUNHO
): string[] {
	const doItem = (i: ItemExame) => [i.id, i.pergunta, i.acusacao, i.nota ?? ''];
	const textos = [
		...secoes
			.filter((s) => s.status !== 'aprovado')
			.flatMap((s) => [s.id, s.nome, s.titulo, s.enunciado, ...s.itens.flatMap(doItem)]),
		...secoes
			.filter((s) => s.status === 'aprovado')
			.flatMap((s) => s.itens.filter((i) => i.status !== 'aprovado').flatMap(doItem)),
		...itens.filter((i) => i.status !== 'aprovado').flatMap(doItem)
	];
	const ids = new Set([...secoes, ...secoes.flatMap((s) => s.itens), ...itens].map((x) => x.id));
	// Ids são únicos (entram sempre); frases curtas poderiam coincidir com outro conteúdo.
	return [...new Set(textos)].filter((t) => ids.has(t) || t.length >= TAMANHO_MINIMO);
}

/** Arquivos (caminho → conteúdo) em que aparece algum dos textos, com o primeiro texto achado. */
export function procurar(
	arquivos: ReadonlyMap<string, string>,
	textos: readonly string[]
): { arquivo: string; texto: string }[] {
	const achados: { arquivo: string; texto: string }[] = [];
	for (const [arquivo, conteudo] of arquivos) {
		const texto = textos.find((t) => conteudo.includes(t));
		if (texto) achados.push({ arquivo, texto });
	}
	return achados;
}

function lerPasta(raiz: string): Map<string, string> {
	const arquivos = new Map<string, string>();
	for (const entrada of readdirSync(raiz, { recursive: true, withFileTypes: true })) {
		if (!entrada.isFile()) continue;
		const caminho = join(entrada.parentPath, entrada.name);
		arquivos.set(relative(raiz, caminho), readFileSync(caminho, 'utf8'));
	}
	return arquivos;
}

const executadoDiretamente =
	process.argv[1] !== undefined &&
	realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (executadoDiretamente) {
	const pasta = process.argv[2] ?? 'build';
	const arquivos = lerPasta(pasta);
	const textos = textosEmRevisao();
	const achados = procurar(arquivos, textos);
	if (achados.length > 0) {
		console.error(`Texto em revisão encontrado no build (${pasta}):`);
		for (const { arquivo, texto } of achados)
			console.error(`- ${arquivo}: "${texto.slice(0, 60)}"`);
		process.exit(1);
	}
	console.log(
		`Nenhum dos ${textos.length} textos em revisão está nos ${arquivos.size} arquivos de ${pasta}.`
	);
}
