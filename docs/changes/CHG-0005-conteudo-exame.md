# CHG-0005 — Conteúdo do Exame de consciência

- **Status:** implementada; rascunhos aguardando revisão dos responsáveis
- **Marco:** M2 (Exame)
- **Próxima:** CHG-0006 (interface e privacidade). Esta change **não altera nenhuma página publicada**.

## Problema

O Exame precisa de conteúdo com procedência. Os PDFs de referência não podem ser copiados. A decisão dos responsáveis foi partir da base do Korvo, que está autorizada, e completar as lacunas com **rascunhos assistidos**, aprovados item a item.

## Escopo

### Base aprovada

Vem do `terco-diario@e4cbfd6`, por extração estática, sem alteração de texto:

| Arquivo                        | Conteúdo                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `content/exame/secoes.ts`      | 9 seções e 37 itens                                                               |
| `content/exame/orientacoes.ts` | Oração "Peça luz", 7 orientações, textos do resumo e do roteiro do confessionário |
| `content/exame/atos.ts`        | Confiteor e 3 atos de contrição                                                   |

**Conferência string a string:** 233/233. Teste de mutação: trocar uma letra foi detectado.

### Matriz e rascunhos

- **`docs/editorial/exame-matriz.md`:** compara os **tópicos** dos 3 PDFs com a base, sem nenhuma frase deles.
  - A base já cobre a maioria dos tópicos. O plano estimava ~25 rascunhos; foram feitos **11**, só para as lacunas reais. Não há preenchimento artificial.
- **`content/exame/rascunhos.ts`:**
  - 7 itens em seções existentes: penitência não cumprida; pais; cônjuge; gula; recusa da vida conjugal (E18); desonestidade no trabalho; avareza;
  - 1 seção nova, `ex-preceitos`, com 4 itens: confissão anual, comunhão pascal, jejum e abstinência, ajuda à Igreja;
  - todos com `status: 'em-revisao'` e `origem: 'rascunho-assistido'`;
  - gravidade só como proposta.
  - **Os cânones citados foram conferidos em vatican.va** (97 §1, 222 §1, 920, 989, 1252, 1253), com links em `content/exame/SOURCES.md`.
  - **Não rascunhado:** itens de posição política (E16, decisão editorial); orações, atos e citações.
- **`docs/editorial/exame-rascunhos.md`:** tabela de revisão gerada por `pnpm exame:rascunhos`.
  - Um teste falha se o documento ficar fora de dia com os dados.
  - O Prettier ignora o arquivo, por ser gerado.

### Porta editorial

- **`src/lib/modules/exame/domain/montagem.ts` (`montarExame`):**
  - junta a base e os rascunhos (itens no fim da seção; seções novas antes de "Omissões");
  - sem a opção de rascunhos, mostra **só o que foi aprovado**.
  - A interface (CHG-0006) usará a opção de rascunhos só no modo de desenvolvimento.
- **Tipos:** `src/lib/modules/exame/domain/tipos.ts`.

### Outras mudanças

- **REUSE:** a base credita Korvo e os contribuidores; `rascunhos.ts` credita só os contribuidores do projeto (verificado com `reuse spdx`).
- **ESLint:** `ignoreRestSiblings`, que permite omitir campos com desestruturação.

## Testes

- `content/exame/conteudo.test.ts` (6 testes):
  - base com 9 seções, 37 itens, todos aprovados e de origem `base`;
  - textos não vazios e sem HTML;
  - 7 orientações, roteiro e 4 atos;
  - rascunhos todos em revisão, com ids únicos, apontando para seções existentes e com estados de vida válidos.
- `src/lib/modules/exame/domain/montagem.test.ts` (4 testes):
  - em produção, só a base;
  - em revisão, a ordem e a posição dos rascunhos;
  - um rascunho aprovado aparece;
  - seção inexistente é recusada.
- `scripts/exame-rascunhos.test.ts` (2 testes): o documento de revisão está em dia.

## Como os responsáveis revisam

1. Ler `docs/editorial/exame-rascunhos.md`.
2. No PR, para cada item: aprovar (trocar `status` para `aprovado` em `content/exame/rascunhos.ts`), pedir ajuste de texto, gravidade ou nota, ou remover.
3. Rodar `pnpm exame:rascunhos` para atualizar a tabela. O teste avisa se alguém esquecer.

## Validação

Executada em 26/11/2026 com pnpm 12.23.0. Os E2E rodaram em Chromium desktop e móvel; Firefox e WebKit rodam no CI.

| Verificação                                          | Node 22.23.5                     | Node 26.13.1      |
| ---------------------------------------------------- | -------------------------------- | ----------------- |
| `pnpm check`                                         | 0 erros, 0 avisos                | 0 erros, 0 avisos |
| `pnpm lint`                                          | OK                               | OK                |
| `pnpm test:unit`                                     | 93/93 (12 novos)                 | 93/93             |
| `pnpm build`, `budget` (8 páginas), `licenses:check` | OK                               | OK                |
| `pnpm test:e2e` (`chromium` + `chromium-movel`)      | 76/76                            | 76/76             |
| E2E com `BASE_PATH=/Catoolicas` (`chromium`)         | 38/38                            | —                 |
| `reuse lint`                                         | 115/115 arquivos                 | —                 |
| Conferência do Exame contra a origem                 | 233/233, 0 divergências          | —                 |
| Conferência do Terço contra a origem (regressão)     | 785/785, 0 divergências          | —                 |
| Conteúdo do Exame no `build/`                        | ausente (nenhuma rota o importa) | —                 |

- **Orçamento:** os números de todas as páginas são os mesmos da CHG-0004a.
- **Rodado a partir das cópias versionadas** em `docs/changes/CHG-0002/` e `docs/changes/CHG-0005/`. Elas diferem das cópias de trabalho só na formatação do Prettier.

## Riscos e pendências

- **Rascunhos:** nenhum entra no site sem aprovação item a item (E12a). A gravidade marcada é só proposta.
- **E15 a E18:** continuam pendentes. Os rascunhos dos preceitos seguem a recomendação da E15 (lei vigente), e o item `ex-m6-r1` depende da E18.
- **Publicação do Exame:** depende da CHG-0006 (interface e privacidade), da aprovação editorial e da autorização para `main`.
