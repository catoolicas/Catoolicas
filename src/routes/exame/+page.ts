import { exameAprovado, exameEmRevisao } from '#lib/modules/exame/conteudo.ts';
import type { PageLoad } from './$types';

// Em produção, só o conteúdo aprovado. Os rascunhos em revisão aparecem só no servidor de
// desenvolvimento (`vite dev`): as duas condições abaixo viram constantes no build, e o import
// dinâmico some. Exigir também MODE === 'development' impede que um build com NODE_ENV=development
// (que liga DEV) publique rascunhos; e `pnpm check:rascunhos` confere o build inteiro no CI.
const revisao = import.meta.env.DEV && import.meta.env.MODE === 'development';

export const load: PageLoad = async () => ({
	secoes: revisao ? await exameEmRevisao() : exameAprovado()
});
