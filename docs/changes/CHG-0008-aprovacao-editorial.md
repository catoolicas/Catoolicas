# CHG-0008 — Aprovação editorial do MVP e publicação dos rascunhos do Exame

- **Status:** implementada; publica quando os responsáveis mesclarem o PR.
- **Marco:** M2 (Exame), fechamento editorial do MVP
- **Depende de:** CHG-0005 e CHG-0006, publicadas em 27/11/2026

## Problema

Depois do merge do PR #1, os responsáveis aprovaram em bloco todas as pendências editoriais abertas do MVP ("aprovo tudo"), inclusive as do Terço. Os 11 rascunhos do Exame continuavam fora do site, porque estavam `em-revisao`.

## Escopo

### Conteúdo

- **`content/exame/rascunhos.ts`:**
  - a seção "Os preceitos da Igreja" e os 11 itens passam a `aprovado`, com a gravidade proposta;
  - a origem continua `rascunho-assistido`, para manter a procedência;
  - fica exportado `emRevisao`, para itens futuros, que só passam a `aprovado` depois da aprovação.
- **`pnpm exame:rascunhos`** regenerou a tabela de revisão e `content/exame/rascunhos-aprovados.ts`, que agora traz todos.

### Efeito no site

- **Seção nova:** "Os preceitos da Igreja", com 4 itens, antes de "Omissões".
- **7 itens** no fim das seções existentes.
- **Filtro "Mostrar também as perguntas para"** (pais e mães, pessoas casadas, quem trabalha ou emprega). Aparece porque 4 itens são próprios de um estado de vida; ficam escondidos até a pessoa escolher, e desmarcar o estado tira da lista o que tinha sido marcado.
- **Ajuste visual:** as caixas do filtro passam a ter o tamanho das caixas dos itens.

### Registro editorial

`docs/editorial/pendencias.md`, com o que exatamente foi aprovado em cada linha:

| Pendência | Aprovado em 27/11/2026                                                       |
| --------- | ---------------------------------------------------------------------------- |
| E2        | Rosário inteiro como publicado: 20 mistérios, abertura e fecho uma vez só    |
| E4        | As 9 jaculatórias da base, com Glória e Fátima como padrão                   |
| E6        | "Rosário das cláusulas" e as cláusulas da base como frase-guia nos luminosos |
| E14       | Sem sequências, pontuações nem metas                                         |
| E12a      | Os 11 rascunhos e a seção de preceitos                                       |
| E15       | Lei vigente (CDC de 1983)                                                    |
| E16       | Nenhum item de posição política                                              |
| E17       | As orientações da base para escrupulosos                                     |
| E18       | Discrição nos itens do 6º e 9º mandamentos                                   |
| E19       | Os textos de interface escritos pelo projeto (CHG-0006)                      |
| E20       | Sem campos de descrição e circunstâncias                                     |

- **Continuam abertas:** a E7 (perícopes extras, que dependem dos textos) e as que ficam fora do MVP (E10, E11, E13).
- **Checklist manual de privacidade** (`docs/privacy/exame-checklist.md`): continua por executar, porque pede aparelhos e navegadores reais.

## Testes

Os testes que supunham "rascunhos em revisão" passaram a usar cópias dos rascunhos com o status de que precisam. Assim não dependem do status atual:

- `montagem.test.ts`:
  - a porta editorial com cópias em revisão e aprovadas;
  - o teste novo "cada rascunho aprovado vai para o site, cada um em revisão fica fora".
- `check-rascunhos.test.ts`:
  - a procura com cópias em revisão;
  - com o conteúdo atual, procura exatamente os ids em revisão (hoje, nenhum).
- `content/exame/conteudo.test.ts`: rascunhos aprovados ou em revisão, sempre com a procedência; textos sem HTML.
- **E2E** (`tests/e2e/exame.e2e.ts`):
  - os rascunhos aprovados estão no HTML e no JS, e nenhum em revisão está;
  - a seção dos preceitos fica antes de "Omissões";
  - o filtro: "pessoas casadas" acrescenta os itens de casados; marcar um deles o põe na lista; desmarcar o estado o esconde e o tira da lista.

## Desempenho

| Página    | JS (gzip)      | HTML (gzip) | Limite de JS |
| --------- | -------------- | ----------- | ------------ |
| `/exame/` | 51,1 KB (+0,9) | 8,0 KB      | 60 KB        |

## Validação

Executada em 27/11/2026 com pnpm 12.23.0. Os E2E rodaram em Chromium desktop e móvel; Firefox e WebKit rodam no CI.

| Verificação                                                                       | Node 22.23.5      | Node 26.13.1      |
| --------------------------------------------------------------------------------- | ----------------- | ----------------- |
| `pnpm check`                                                                      | 0 erros, 0 avisos | 0 erros, 0 avisos |
| `pnpm lint`                                                                       | OK                | OK                |
| `pnpm test:unit`                                                                  | 160/160           | 160/160           |
| `pnpm build`, `check:rascunhos` (0 textos em revisão), `budget`, `licenses:check` | OK                | OK                |
| `pnpm test:e2e` (`chromium` + `chromium-movel`)                                   | 132/132           | 132/132           |
| E2E com `BASE_PATH=/Catoolicas` (`chromium`)                                      | 66/66             | —                 |
| `reuse lint`                                                                      | 138/138 arquivos  | —                 |
| Conferências do conteúdo (Terço e Exame)                                          | 785/785 e 240/240 | —                 |

**Verificação visual:** capturas do filtro e da seção dos preceitos no desktop (claro) e no celular (escuro). Levaram ao ajuste do tamanho das caixas do filtro.
