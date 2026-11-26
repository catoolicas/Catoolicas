import { exameAprovado, exameEmRevisao } from '#lib/modules/exame/conteudo.ts';
import type { PageLoad } from './$types';

// Em produção, só o conteúdo aprovado; os rascunhos em revisão aparecem só no modo de
// desenvolvimento, e o build de produção nem inclui o arquivo deles (import.meta.env.DEV é
// substituído por `false`, e o import dinâmico some).
export const load: PageLoad = async () => ({
	secoes: import.meta.env.DEV ? await exameEmRevisao() : exameAprovado()
});
