// Confere, string a string, o conteúdo importado em content/terco/ contra a extração da origem.
// Uso: node conferir-terco.mjs <korvo.json> <raiz-do-repo>
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [, , entrada, raiz] = process.argv;
const d = JSON.parse(readFileSync(entrada, 'utf8'));
const imp = async (f) => import(pathToFileURL(join(raiz, 'content/terco', f)).href);
const { ORACOES } = await imp('oracoes.ts');
const { SERIES_DE_MISTERIOS } = await imp('misterios.ts');
const { CLAUSULAS } = await imp('clausulas.ts');
const { JACULATORIAS } = await imp('jaculatorias.ts');
const { ESQUEMAS, PADROES } = await imp('esquemas.ts');

const tr = new Map(d.TRAD_DADOS.map((r) => [r[0], r[2]]));
let ok = 0;
const erros = [];
const igual = (a, b, onde) => {
	if (a === b) ok++;
	else
		erros.push(
			`${onde}: esperado ${JSON.stringify(b)?.slice(0, 80)} obtido ${JSON.stringify(a)?.slice(0, 80)}`
		);
};
const confTexto = (t, pt, onde, la = tr.get(pt)) => {
	igual(t?.pt, pt, onde + '.pt');
	igual(t?.la, la, onde + '.la');
};

// Mistérios
for (const s of SERIES_DE_MISTERIOS) {
	const m = d.MISTERIOS[s.id];
	confTexto(s.nome, m.nome, `${s.id}.nome`);
	confTexto(s.tema, m.tema, `${s.id}.tema`);
	confTexto(s.oracaoFinal, m.final, `${s.id}.final`);
	if (m.aviso) confTexto(s.aviso, m.aviso, `${s.id}.aviso`);
	else igual(s.aviso, undefined, `${s.id}.aviso`);
	igual(s.misterios.length, m.dezenas.length, `${s.id}.n`);
	m.dezenas.forEach((z, i) => {
		const mi = s.misterios[i];
		const o = `${s.id}.${i}`;
		confTexto(mi.titulo, z.t, o + '.t');
		confTexto(mi.fruto, z.fruto, o + '.fruto');
		igual(mi.pericopes.length, 1, o + '.pericopes');
		confTexto(mi.pericopes[0].referencia, z.ref, o + '.ref');
		confTexto(mi.pericopes[0].texto, z.txt, o + '.txt');
		confTexto(mi.oferecimento, z.of, o + '.of');
		if (z.pn) confTexto(mi.intencaoPaiNosso, z.pn, o + '.pn');
		else igual(mi.intencaoPaiNosso, undefined, o + '.pn');
		confTexto(mi.fecho, z.fecho, o + '.fecho');
		if (z.p) z.p.forEach((p, j) => confTexto(mi.pontos[j], p, `${o}.p${j}`));
		else igual(mi.pontos, undefined, o + '.p');
		if (z.nota) confTexto(mi.nota, z.nota, o + '.nota');
		if (z.frase) igual(CLAUSULAS[s.id][i].pt, z.frase, o + '.frase');
	});
}
// Cláusulas
for (const [s, lista] of Object.entries(d.ABREV))
	lista.forEach((c, i) => confTexto(CLAUSULAS[s][i], c, `clausula.${s}.${i}`));
// Jaculatórias
igual(JACULATORIAS.length, d.JAC_ITENS.length, 'jac.n');
d.JAC_ITENS.forEach((j, i) => {
	igual(JACULATORIAS[i].id, j.id, `jac.${i}.id`);
	confTexto(JACULATORIAS[i].texto, j.txt.pt, `jac.${j.id}`, j.txt.la);
	confTexto(JACULATORIAS[i].devocao, d.JAC_DEV[j.id], `jac.${j.id}.dev`);
});
// Orações (texto principal)
const P = d.ORACOES.pt;
const L = d.ORACOES.la;
const SEL = new Map(d.SELETA.map((s) => [s.id, s]));
for (const o of ORACOES) {
	const s = SEL.get(o.id);
	const k = s.ling;
	const pt = typeof s.idx === 'number' ? P[k][s.idx] : P[k];
	const la = k in d.OFI_LA ? d.OFI_LA[k] : typeof s.idx === 'number' ? L[k][s.idx] : L[k];
	confTexto(o.texto, pt, `oracao.${o.id}`, la);
	igual(o.texto.laNaoOficial, k in d.OFI_LA ? true : undefined, `oracao.${o.id}.naoOficial`);
	igual(o.procedencia.fonte, s.fonte, `oracao.${o.id}.fonte`);
}
// Esquemas e padrões
igual(JSON.stringify(ESQUEMAS['2002']), JSON.stringify(d.ESQUEMAS.jp2), 'esquema.2002');
igual(JSON.stringify(ESQUEMAS.montfort), JSON.stringify(d.ESQUEMAS.montfort), 'esquema.montfort');
igual(
	JSON.stringify(PADROES.abertura.map((r) => [r.oracao, r.vezes])),
	JSON.stringify(d.PADRAO_ABERTURA.map((x) => [x.id, x.x])),
	'abertura'
);
igual(
	JSON.stringify(PADROES.finais.map((r) => [r.oracao, r.vezes])),
	JSON.stringify(d.PADRAO_FINAIS.map((x) => [x.id, x.x])),
	'finais'
);
igual(JSON.stringify(PADROES.jaculatorias), JSON.stringify(d.PADROES.jac), 'jac.padrao');

console.log(`conferências OK: ${ok}; divergências: ${erros.length}`);
if (erros.length) {
	console.log(erros.slice(0, 30).join('\n'));
	process.exit(1);
}
