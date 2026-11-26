// Gera content/terco/*.ts a partir do JSON extraído estaticamente do terco-diario.
// Uso: node gerar-terco.cjs <korvo.json> <pasta-destino>
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const [, , entrada, destino] = process.argv;
const d = JSON.parse(fs.readFileSync(entrada, 'utf8'));
const ORIGEM = 'terco-diario@e4cbfd6';
const tr = new Map(d.TRAD_DADOS.map((r) => [r[0], r[2]]));
const P = d.ORACOES.pt;
const L = d.ORACOES.la;
const faltas = [];

/** Texto PT com o latim da tabela de tradução da origem (quando houver). */
function texto(pt, onde, laExplicito, naoOficial) {
	if (typeof pt !== 'string' || !pt.trim()) throw new Error(`texto vazio em ${onde}`);
	const la = laExplicito ?? tr.get(pt);
	if (!la) faltas.push(onde);
	const t = { pt };
	if (la) t.la = la;
	if (naoOficial) t.laNaoOficial = true;
	return t;
}

function procedencia(fonte) {
	return fonte ? { origem: ORIGEM, fonte } : { origem: ORIGEM };
}

// ---------- orações ----------
const SEL = new Map(d.SELETA.map((s) => [s.id, s]));
const LA_NAO_OFICIAL = d.OFI_LA; // ofi, ofr, saud: latim marcado "translatio non officialis" na origem

function oracao(id) {
	const s = SEL.get(id);
	if (!s || !s.ling) throw new Error(`oração ${id} sem 'ling'`);
	const k = s.ling;
	const tituloPt = typeof s.idx === 'number' ? s.nome : (P[k + 'T'] ?? s.nome);
	const tituloLa = typeof s.idx === 'number' ? tr.get(s.nome) : (L[k + 'T'] ?? tr.get(s.nome));
	const titulo = texto(tituloPt, `${id}.titulo`, tituloLa);

	let ptTexto = P[k];
	let laTexto = L[k];
	if (typeof s.idx === 'number') {
		ptTexto = P[k][s.idx];
		laTexto = L[k][s.idx];
	}
	const naoOficial = k in LA_NAO_OFICIAL;
	if (naoOficial) laTexto = LA_NAO_OFICIAL[k];
	const o = {
		id,
		titulo,
		texto: texto(ptTexto, `${id}.texto`, laTexto, naoOficial)
	};
	if (P[k + 'V']) {
		const [vPt, rPt] = P[k + 'V'].split('<br>');
		const [vLa, rLa] = L[k + 'V'].split('<br>');
		o.versiculo = {
			v: texto(vPt.trim(), `${id}.v`, vLa.trim()),
			r: texto(rPt.trim(), `${id}.r`, rLa.trim())
		};
	}
	const notaK =
		s.notaLing ??
		(typeof s.idx !== 'number' && P[k + 'Nota'] && k !== 'ofr' && k !== 'ave' ? k + 'Nota' : null);
	if (notaK) o.nota = texto(P[notaK].trim(), `${id}.nota`, L[notaK]?.trim());
	o.procedencia = procedencia(s.fonte);
	o.status = 'aprovado';
	return o;
}

const idsOracoes = [
	...new Set([...d.PADRAO_ABERTURA.map((x) => x.id), ...d.PADRAO_FINAIS.map((x) => x.id)])
];
const oracoes = idsOracoes.map(oracao);

const repeticao = (x) => {
	const r = { oracao: x.id, vezes: x.x };
	if (x.id === 'ave-maria' && x.x === 3)
		r.nota = texto(P.aveNota.trim(), 'abertura.ave.nota', L.aveNota.trim());
	return r;
};

// ---------- mistérios ----------
const SERIES = ['gozosos', 'luminosos', 'dolorosos', 'gloriosos'];
const series = SERIES.map((id) => {
	const m = d.MISTERIOS[id];
	if (m.dezenas.length !== 5) throw new Error(`${id}: ${m.dezenas.length} dezenas`);
	const s = {
		id,
		nome: texto(m.nome, `${id}.nome`),
		tema: texto(m.tema, `${id}.tema`),
		oracaoFinal: texto(m.final, `${id}.final`)
	};
	if (m.aviso) s.aviso = texto(m.aviso, `${id}.aviso`);
	s.misterios = m.dezenas.map((z, i) => {
		const onde = `${id}.${i}`;
		const mi = {
			titulo: texto(z.t, `${onde}.t`),
			fruto: texto(z.fruto, `${onde}.fruto`),
			pericopes: [{ referencia: texto(z.ref, `${onde}.ref`), texto: texto(z.txt, `${onde}.txt`) }],
			oferecimento: texto(z.of, `${onde}.of`)
		};
		if (z.pn) mi.intencaoPaiNosso = texto(z.pn, `${onde}.pn`);
		mi.fecho = texto(z.fecho, `${onde}.fecho`);
		if (z.p) {
			if (z.p.length !== 10) throw new Error(`${onde}: ${z.p.length} pontos`);
			mi.pontos = z.p.map((p, j) => texto(p, `${onde}.p${j}`));
		}
		if (z.frase && z.frase !== d.ABREV[id][i]) throw new Error(`${onde}: frase difere da cláusula`);
		if (z.nota) mi.nota = texto(z.nota, `${onde}.nota`);
		return mi;
	});
	s.procedencia = procedencia(
		'O Santo Rosário Meditado — método de São Luís Maria Grignion de Montfort'
	);
	s.status = 'aprovado';
	return s;
});

const clausulas = Object.fromEntries(
	SERIES.map((id) => [id, d.ABREV[id].map((c, i) => texto(c, `clausula.${id}.${i}`))])
);

// ---------- jaculatórias ----------
const jaculatorias = d.JAC_ITENS.map((j) => ({
	id: j.id,
	devocao: texto(d.JAC_DEV[j.id], `jac.${j.id}.devocao`),
	texto: texto(j.txt.pt, `jac.${j.id}`, j.txt.la),
	procedencia: procedencia(),
	status: 'aprovado'
}));

// ---------- esquemas e padrões ----------
const esquemas = { 2002: d.ESQUEMAS.jp2, montfort: d.ESQUEMAS.montfort };
const padroes = {
	esquema: '2002',
	abertura: d.PADRAO_ABERTURA.map(repeticao),
	finais: d.PADRAO_FINAIS.map(repeticao),
	jaculatorias: d.PADROES.jac
};

// ---------- escrita ----------
const CAB = (extra) =>
	`// Conteúdo importado de garamogger/terco-diario (commit e4cbfd6) — ver SOURCES.md.\n` +
	`// Gerado por extração estática; edite à mão daqui em diante (esta pasta é a fonte única).\n${extra}`;
const js = (v) => JSON.stringify(v, null, '\t');
fs.mkdirSync(destino, { recursive: true });
const escrever = (nome, corpo) => fs.writeFileSync(path.join(destino, nome), corpo);

escrever(
	'oracoes.ts',
	CAB(`import type { Oracao } from '#lib/modules/terco/domain/tipos.ts';\n\n`) +
		`export const ORACOES = ${js(oracoes)} as const satisfies readonly Oracao[];\n`
);
escrever(
	'misterios.ts',
	CAB(`import type { SerieDeMisterios } from '#lib/modules/terco/domain/tipos.ts';\n\n`) +
		`export const SERIES_DE_MISTERIOS = ${js(series)} as const satisfies readonly SerieDeMisterios[];\n`
);
escrever(
	'clausulas.ts',
	CAB(`import type { Clausulas } from '#lib/modules/terco/domain/tipos.ts';\n\n`) +
		`/** Uma cláusula por mistério, acrescentada ao nome de Jesus em cada Ave-Maria. */\n` +
		`export const CLAUSULAS = ${js(clausulas)} as const satisfies Clausulas;\n`
);
escrever(
	'jaculatorias.ts',
	CAB(`import type { Jaculatoria } from '#lib/modules/terco/domain/tipos.ts';\n\n`) +
		`export const JACULATORIAS = ${js(jaculatorias)} as const satisfies readonly Jaculatoria[];\n`
);
escrever(
	'esquemas.ts',
	CAB(`import type { EsquemaDias, Repeticao } from '#lib/modules/terco/domain/tipos.ts';\n\n`) +
		`/** Série de mistérios por dia da semana (0 = domingo). */\n` +
		`export const ESQUEMAS = ${js(esquemas)} as const satisfies Record<string, EsquemaDias>;\n\n` +
		`/** Padrões do terço na origem: esquema de dias, orações iniciais e finais, jaculatórias. */\n` +
		`export const PADROES = ${js(padroes)} as const satisfies {\n` +
		`\treadonly esquema: keyof typeof ESQUEMAS;\n` +
		`\treadonly abertura: readonly Repeticao[];\n` +
		`\treadonly finais: readonly Repeticao[];\n` +
		`\treadonly jaculatorias: readonly string[];\n};\n`
);
console.log(
	`orações ${oracoes.length}, séries ${series.length}, jaculatórias ${jaculatorias.length}; textos sem LA: ${faltas.length}`
);
if (faltas.length) console.log('sem LA:', faltas.join(', '));
