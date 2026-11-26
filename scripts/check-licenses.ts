/**
 * Verifica se as licenças de todas as dependências (inclusive de desenvolvimento) estão na
 * lista permitida, compatível com a distribuição do projeto sob GPL-3.0-or-later.
 *
 * Fonte dos dados: `pnpm licenses list --json`. Expressões SPDX com OR/AND/parênteses são
 * avaliadas (OR: basta uma permitida; AND: todas precisam ser). "X WITH Y" só passa se estiver
 * listado literalmente.
 *
 * Uso: pnpm licenses:check
 * Zero dependências: só módulos nativos do Node (executado com type stripping).
 */
import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Licenças permitidas. Todas são compatíveis com a GPLv3 ou, no caso de fontes (OFL-1.1),
 * distribuídas como arquivos separados. GPL-2.0-only NÃO é compatível com a GPLv3 e não entra.
 * Ampliar esta lista exige justificativa registrada em docs/adr/0001-licenciamento.md.
 */
export const PERMITIDAS: ReadonlySet<string> = new Set([
	'MIT',
	'MIT-0',
	'ISC',
	'0BSD',
	'BSD-2-Clause',
	'BSD-3-Clause',
	'Apache-2.0',
	'MPL-2.0',
	'BlueOak-1.0.0',
	'CC0-1.0',
	'Unlicense',
	'OFL-1.1',
	'LGPL-3.0-only',
	'LGPL-3.0-or-later',
	'GPL-3.0-only',
	'GPL-3.0-or-later'
]);

/**
 * Exceções por pacote, com justificativa obrigatória (nome do pacote → motivo).
 * Vazia por enquanto.
 */
export const EXCECOES: Readonly<Record<string, string>> = {};

type Token = { tipo: 'abre' | 'fecha' | 'e' | 'ou' | 'id'; valor: string };

function tokenizar(expressao: string): Token[] {
	const tokens: Token[] = [];
	const padrao = /\(|\)|[^\s()]+(?:\s+WITH\s+[^\s()]+)?/gi;
	for (const [bruto] of expressao.matchAll(padrao)) {
		const maiusculo = bruto.toUpperCase();
		if (bruto === '(') tokens.push({ tipo: 'abre', valor: bruto });
		else if (bruto === ')') tokens.push({ tipo: 'fecha', valor: bruto });
		else if (maiusculo === 'AND') tokens.push({ tipo: 'e', valor: bruto });
		else if (maiusculo === 'OR') tokens.push({ tipo: 'ou', valor: bruto });
		else tokens.push({ tipo: 'id', valor: bruto.replace(/\s+with\s+/i, ' WITH ') });
	}
	return tokens;
}

/**
 * Avalia uma expressão SPDX contra a lista permitida.
 * Gramática: expr := termo (OR termo)* ; termo := fator (AND fator)* ; fator := '(' expr ')' | id
 * Expressão malformada ou vazia é tratada como não permitida.
 */
export function expressaoPermitida(
	expressao: string,
	permitidas: ReadonlySet<string> = PERMITIDAS
): boolean {
	const tokens = tokenizar(expressao);
	let posicao = 0;

	const expr = (): boolean => {
		let resultado = termo();
		while (tokens[posicao]?.tipo === 'ou') {
			posicao++;
			const direita = termo();
			resultado = resultado || direita;
		}
		return resultado;
	};
	const termo = (): boolean => {
		let resultado = fator();
		while (tokens[posicao]?.tipo === 'e') {
			posicao++;
			const direita = fator();
			resultado = resultado && direita;
		}
		return resultado;
	};
	const fator = (): boolean => {
		const token = tokens[posicao++];
		if (!token) throw new Error('expressão incompleta');
		if (token.tipo === 'abre') {
			const resultado = expr();
			if (tokens[posicao++]?.tipo !== 'fecha') throw new Error('parêntese não fechado');
			return resultado;
		}
		if (token.tipo === 'id') return permitidas.has(token.valor);
		throw new Error(`token inesperado: ${token.valor}`);
	};

	try {
		const resultado = expr();
		return posicao === tokens.length && resultado;
	} catch {
		return false;
	}
}

type Pacote = { name: string; versions: string[]; license: string };
export type Relatorio = Record<string, Pacote[]>;
export type Reprovado = { pacote: string; versoes: string[]; licenca: string };

export function reprovados(
	relatorio: Relatorio,
	permitidas: ReadonlySet<string> = PERMITIDAS,
	excecoes: Readonly<Record<string, string>> = EXCECOES
): Reprovado[] {
	const resultado: Reprovado[] = [];
	for (const [grupo, pacotes] of Object.entries(relatorio)) {
		for (const pacote of pacotes) {
			const licenca = pacote.license || grupo;
			if (pacote.name in excecoes) continue;
			if (!expressaoPermitida(licenca, permitidas)) {
				resultado.push({ pacote: pacote.name, versoes: pacote.versions, licenca });
			}
		}
	}
	return resultado.sort((a, b) => a.pacote.localeCompare(b.pacote));
}

function principal(): void {
	const saida = execFileSync('pnpm', ['licenses', 'list', '--json'], {
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024
	});
	const relatorio = JSON.parse(saida) as Relatorio;
	const total = Object.values(relatorio).reduce((soma, lista) => soma + lista.length, 0);
	const contagem = Object.entries(relatorio)
		.map(([licenca, lista]) => `${licenca}: ${lista.length}`)
		.join(', ');
	console.log(`${total} pacote(s) verificados — ${contagem}`);

	const falhas = reprovados(relatorio);
	if (falhas.length > 0) {
		console.error('\nLicenças fora da lista permitida:');
		for (const f of falhas) console.error(`- ${f.pacote}@${f.versoes.join(', ')}: ${f.licenca}`);
		process.exit(1);
	}
	console.log('Todas as licenças estão na lista permitida.');
}

// Compara caminhos reais: um caminho com link simbólico não pode desativar a verificação.
const executadoDiretamente =
	process.argv[1] !== undefined &&
	realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (executadoDiretamente) principal();
