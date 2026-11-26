// Confere, string a string, a base do exame em content/exame/ contra a origem.
// Uso: node conferir-exame.mjs <korvo.json> <index.html-sem-base64> <raiz-do-repo>
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [, , entrada, html, raiz] = process.argv;
const d = JSON.parse(readFileSync(entrada, 'utf8'));
const fonte = readFileSync(html, 'utf8');
const imp = (f) => import(pathToFileURL(join(raiz, 'content/exame', f)).href);
const { SECOES } = await imp('secoes.ts');
const { ORIENTACOES, ORACAO_INICIAL, ROTEIRO } = await imp('orientacoes.ts');
const { ATOS } = await imp('atos.ts');

let ok = 0;
const erros = [];
const igual = (a, b, onde) =>
	a === b
		? ok++
		: erros.push(
				`${onde}: esperado ${JSON.stringify(b)?.slice(0, 70)} obtido ${JSON.stringify(a)?.slice(0, 70)}`
			);

igual(SECOES.length, d.EXAME.length, 'secoes.n');
d.EXAME.forEach((s, i) => {
	const c = SECOES[i];
	igual(c.id, s.id, `${s.id}.id`);
	igual(c.numero, s.num, `${s.id}.num`);
	igual(c.nome, s.nome, `${s.id}.nome`);
	igual(c.titulo, s.tit, `${s.id}.tit`);
	igual(c.enunciado, s.mand, `${s.id}.mand`);
	igual(c.itens.length, s.itens.length, `${s.id}.n`);
	s.itens.forEach((it, j) => {
		const ci = c.itens[j];
		igual(ci.pergunta, it.q, `${s.id}.${j}.q`);
		igual(ci.acusacao, it.say, `${s.id}.${j}.say`);
		igual(ci.nota, it.n, `${s.id}.${j}.n`);
		igual(ci.grave, it.g === 1, `${s.id}.${j}.g`);
	});
});
// Cada orientação e cada texto do roteiro aparecem literalmente no HTML da origem.
for (const o of ORIENTACOES) {
	igual(
		fonte.includes(`<li><b>${o.destaque}</b> ${o.texto}</li>`),
		true,
		`orientacao: ${o.destaque}`
	);
}
igual(
	fonte.includes(`<b>${ORACAO_INICIAL.nome}</b> ${ORACAO_INICIAL.texto}</p>`),
	true,
	'oracao inicial'
);
for (const t of [
	ROTEIRO.nenhumItem,
	ROTEIRO.tituloGraves,
	ROTEIRO.tituloOutras,
	ROTEIRO.tituloConfessionario,
	...ROTEIRO.confessionario,
	ROTEIRO.tituloAto,
	ROTEIRO.depois
]) {
	igual(fonte.includes(t), true, `roteiro: ${t.slice(0, 40)}`);
}
const penit = d.SELETA.filter((s) => s.cat === 'penit');
igual(ATOS.length, penit.length, 'atos.n');
penit.forEach((p, i) => {
	igual(ATOS[i].id, p.id, `ato.${p.id}.id`);
	igual(ATOS[i].nome, p.nome, `ato.${p.id}.nome`);
	igual(ATOS[i].texto, p.txt, `ato.${p.id}.txt`);
});
igual(ATOS.find((a) => a.id === 'contricao')?.texto, d.EX_ATO, 'EX_ATO');

console.log(`conferências OK: ${ok}; divergências: ${erros.length}`);
if (erros.length) {
	console.log(erros.join('\n'));
	process.exit(1);
}
