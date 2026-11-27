// Gera content/exame/*.ts (base do terco-diario) a partir da extração estática.
// Uso: node gerar-exame.cjs <korvo.json> <index.html-sem-base64> <pasta-destino>
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const [, , entrada, html, destino] = process.argv;
const d = JSON.parse(fs.readFileSync(entrada, 'utf8'));
const fonteHtml = fs.readFileSync(html, 'utf8');
const ORIGEM = 'terco-diario@e4cbfd6';
const proc = (fonte) => (fonte ? { origem: ORIGEM, fonte } : { origem: ORIGEM });

// ---------- seções e itens ----------
const secoes = d.EXAME.map((s) => ({
	id: s.id,
	numero: s.num,
	nome: s.nome,
	titulo: s.tit,
	enunciado: s.mand,
	itens: s.itens.map((it, i) => {
		const item = { id: `${s.id}-${i + 1}`, pergunta: it.q, acusacao: it.say };
		if (it.n) item.nota = it.n;
		Object.assign(item, {
			grave: it.g === 1,
			origem: 'base',
			procedencia: proc(),
			status: 'aprovado'
		});
		return item;
	}),
	origem: 'base',
	procedencia: proc(),
	status: 'aprovado'
}));

// ---------- orientações (HTML estático dentro do template do exame) ----------
const lista = fonteHtml.match(/<ul class="ex-principios">([\s\S]*?)<\/ul>/);
if (!lista) throw new Error('lista de princípios não encontrada');
const orientacoes = [...lista[1].matchAll(/<li><b>([^<]+)<\/b>\s*([\s\S]*?)<\/li>/g)].map((m) => ({
	destaque: m[1].trim(),
	texto: m[2].trim()
}));
if (orientacoes.length !== 7)
	throw new Error(`esperadas 7 orientações, achadas ${orientacoes.length}`);
for (const o of orientacoes)
	if (/[<>$]/.test(o.destaque + o.texto)) throw new Error('marcação no texto: ' + o.texto);

const pecaLuz = fonteHtml.match(/<p class="oferece"><b>(Peça luz\.)<\/b>\s*([^<]+)<\/p>/);
if (!pecaLuz) throw new Error('oração inicial não encontrada');
const oracaoInicial = {
	id: 'peca-luz',
	nome: pecaLuz[1],
	texto: pecaLuz[2].trim(),
	procedencia: proc(),
	status: 'aprovado'
};

// ---------- roteiro do resumo (template de resumoHTML) ----------
const resumo = fonteHtml.match(/function resumoHTML\(\)\{([\s\S]*?)\n\}/);
if (!resumo) throw new Error('resumoHTML não encontrado');
const r = resumo[1];
const pega = (re, nome) => {
	const m = r.match(re);
	if (!m) throw new Error('roteiro: ' + nome);
	return m[1].trim();
};
const roteiro = {
	nenhumItem: pega(/<p>(Nenhum item marcado\.[^<]+)<\/p>/, 'nenhumItem'),
	tituloGraves: pega(/<h3>(Primeiro:[^<]+)<\/h3>/, 'tituloGraves'),
	tituloOutras: pega(/<h3>(Depois:[^<]+)<\/h3>/, 'tituloOutras'),
	tituloConfessionario: pega(/<h3>(No confessionário)<\/h3>/, 'tituloConfessionario'),
	confessionario: [
		pega(/<p>(“Abençoe-me, padre[^<]+)<\/p>/, 'confessionario1'),
		pega(/<p>(Ao terminar:[^<]+)<\/p>/, 'confessionario2')
	],
	tituloAto: pega(/<h3>(Ato de contrição)<\/h3>/, 'tituloAto'),
	depois: pega(/<p class="rubrica">(Depois da confissão[^<]+)<\/p>/, 'depois'),
	procedencia: proc(),
	status: 'aprovado'
};

// ---------- atos (Seleta, categoria "Penitência e confissão") ----------
const atos = d.SELETA.filter((s) => s.cat === 'penit').map((s) => ({
	id: s.id,
	nome: s.nome,
	texto: s.txt,
	procedencia: proc(s.fonte),
	status: 'aprovado'
}));
if (d.EX_ATO !== atos.find((a) => a.id === 'contricao')?.texto)
	throw new Error('EX_ATO difere do ato da Seleta');

// ---------- escrita ----------
const CAB =
	`// Conteúdo importado de garamogger/terco-diario (commit e4cbfd6) — ver SOURCES.md.\n` +
	`// Gerado por extração estática; edite à mão daqui em diante (esta pasta é a fonte única).\n`;
const js = (v) => JSON.stringify(v, null, '\t');
fs.mkdirSync(destino, { recursive: true });
const w = (n, c) => fs.writeFileSync(path.join(destino, n), c);
w(
	'secoes.ts',
	CAB +
		`import type { SecaoExame } from '#lib/modules/exame/domain/tipos.ts';\n\n` +
		`export const SECOES = ${js(secoes)} as const satisfies readonly SecaoExame[];\n`
);
w(
	'orientacoes.ts',
	CAB +
		`import type { OracaoExame, Orientacao, Roteiro } from '#lib/modules/exame/domain/tipos.ts';\n\n` +
		`/** Oração antes do exame. */\nexport const ORACAO_INICIAL = ${js(oracaoInicial)} as const satisfies OracaoExame;\n\n` +
		`/** Princípios exibidos antes do exame ("Antes de começar"). */\nexport const ORIENTACOES = ${js(orientacoes)} as const satisfies readonly Orientacao[];\n\n` +
		`/** Textos do resumo e do roteiro do confessionário. */\nexport const ROTEIRO = ${js(roteiro)} as const satisfies Roteiro;\n`
);
w(
	'atos.ts',
	CAB +
		`import type { OracaoExame } from '#lib/modules/exame/domain/tipos.ts';\n\n` +
		`/** Confiteor e atos de contrição (Seleta do terco-diario, "Penitência e confissão"). */\n` +
		`export const ATOS = ${js(atos)} as const satisfies readonly OracaoExame[];\n`
);
console.log(
	`seções ${secoes.length}, itens ${secoes.reduce((n, s) => n + s.itens.length, 0)}, orientações ${orientacoes.length}, atos ${atos.length}`
);
