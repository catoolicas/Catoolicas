# Ferramentas da importação do Exame (CHG-0005)

Registro de **como** a base de `content/exame/` foi gerada a partir do `terco-diario` (commit `e4cbfd6`). Não fazem parte do app nem do CI.

| Arquivo              | Função                                                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gerar-exame.cjs`    | Gera `secoes.ts`, `orientacoes.ts` e `atos.ts`. Usa o JSON produzido por `docs/changes/CHG-0002/extrair.cjs` e o `index.html` com as imagens base64 removidas (para ler o HTML estático dos templates). |
| `conferir-exame.mjs` | Confere string a string o conteúdo gerado contra a origem                                                                                                                                               |

- Resultado em 26/11/2026: **233 conferências, 0 divergências**.
- Na CHG-0006, `conferir-exame.mjs` passou a conferir também `content/exame/interface.ts` (títulos e avisos da interface do exame, copiados do `index.html`): **240 conferências, 0 divergências**.

Os rascunhos (`content/exame/rascunhos.ts`) **não** são gerados por estas ferramentas: são redação do projeto, em revisão.
