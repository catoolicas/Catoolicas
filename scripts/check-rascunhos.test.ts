import { describe, expect, it } from 'vitest';
import { ITENS_RASCUNHO, SECOES_RASCUNHO } from '../content/exame/rascunhos.ts';
import type { ItemExame } from '../src/lib/modules/exame/domain/tipos.ts';
import { procurar, textosEmRevisao } from './check-rascunhos.ts';

const [primeiroItem] = ITENS_RASCUNHO;
if (!primeiroItem) throw new Error('sem rascunhos');

describe('procura de rascunhos em revisão no build', () => {
	it('inclui ids e textos de itens e seções em revisão', () => {
		const textos = textosEmRevisao();
		expect(textos).toContain(primeiroItem.id);
		expect(textos).toContain(primeiroItem.pergunta);
		expect(textos).toContain(primeiroItem.acusacao);
		for (const secao of SECOES_RASCUNHO) expect(textos).toContain(secao.enunciado);
	});

	it('não inclui o que já foi aprovado', () => {
		const aprovado: ItemExame = { ...primeiroItem, status: 'aprovado' };
		expect(textosEmRevisao([], [aprovado])).toEqual([]);
	});

	it('acha o texto em qualquer arquivo e aponta qual', () => {
		const arquivos = new Map([
			['exame/index.html', '<p>texto aprovado</p>'],
			['_app/immutable/chunks/x.js', `const a = ${JSON.stringify(primeiroItem.pergunta)};`]
		]);
		expect(procurar(arquivos, textosEmRevisao())).toEqual([
			{ arquivo: '_app/immutable/chunks/x.js', texto: primeiroItem.pergunta }
		]);
		expect(procurar(new Map([['a.html', 'nada']]), textosEmRevisao())).toEqual([]);
	});
});
