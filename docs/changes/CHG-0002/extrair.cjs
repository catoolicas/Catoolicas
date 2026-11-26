// Extração ESTÁTICA dos dados do index.html do terco-diario (não executa o arquivo).
// Uso: node extrair.cjs <index.html> <saida.json>
// Converte declarações `const NOME = <literal>` do script principal em JSON.
// Nós não literais (funções, identificadores, chamadas) viram {"$naoLiteral": "<tipo>: <trecho>"}.
'use strict';
const fs = require('node:fs');
const acorn = require('acorn');

const [, , entrada, saida] = process.argv;
const html = fs.readFileSync(entrada, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (scripts.length !== 1) throw new Error(`esperado 1 <script>, achado ${scripts.length}`);
const codigo = scripts[0];
const ast = acorn.parse(codigo, { ecmaVersion: 'latest', sourceType: 'script' });

function valor(no) {
	switch (no.type) {
		case 'Literal':
			return no.value;
		case 'TemplateLiteral':
			if (no.expressions.length === 0) return no.quasis.map((q) => q.value.cooked).join('');
			break;
		case 'ArrayExpression':
			return no.elements.map((e) => (e ? valor(e) : null));
		case 'ObjectExpression': {
			const obj = {};
			for (const p of no.properties) {
				if (p.type !== 'Property' || p.computed) {
					obj['$naoLiteral' + Object.keys(obj).length] = trecho(p);
					continue;
				}
				const chave = p.key.type === 'Identifier' ? p.key.name : String(p.key.value);
				obj[chave] = valor(p.value);
			}
			return obj;
		}
		case 'UnaryExpression':
			if (no.operator === '-' && no.argument.type === 'Literal') return -no.argument.value;
			break;
	}
	return { $naoLiteral: trecho(no) };
}

function trecho(no) {
	return `${no.type}: ${codigo.slice(no.start, Math.min(no.end, no.start + 120))}`;
}

const dados = {};
for (const decl of ast.body) {
	if (decl.type !== 'VariableDeclaration' || decl.kind !== 'const') continue;
	for (const d of decl.declarations) {
		if (d.id.type === 'Identifier' && d.init) dados[d.id.name] = valor(d.init);
	}
}
fs.writeFileSync(saida, JSON.stringify(dados, null, 1));
console.log(`${Object.keys(dados).length} constantes: ${Object.keys(dados).join(', ')}`);
