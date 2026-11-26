import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CAMINHO_DOC, gerarDoc } from './exame-rascunhos.ts';

describe('documento de revisão dos rascunhos do Exame', () => {
	it('está em dia com content/exame/rascunhos.ts (rode `pnpm exame:rascunhos` se falhar)', () => {
		expect(readFileSync(CAMINHO_DOC, 'utf8')).toBe(gerarDoc());
	});

	it('lista todos os rascunhos', () => {
		const doc = gerarDoc();
		for (const id of ['ex-preceitos-1', 'ex-preceitos-4', 'ex-m3-r1', 'ex-m7-r2'])
			expect(doc).toContain(`\`${id}\``);
	});
});
