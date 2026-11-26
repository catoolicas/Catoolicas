# CHG-0001b — Correções da revisão independente e decisões dos responsáveis

- **Status:** implementada localmente; push e CI bloqueados por falta de acesso ao GitHub
- **Marco:** M0
- **Base:** CHG-0001 (commits `90dfdd4` e `92bfb67`)

## Problema

1. Uma revisão independente da CHG-0001 apontou defeitos reais. O principal é que o link "Sobre" quebrava em servidores estáticos simples, e os testes não percebiam.
2. Os responsáveis decidiram as fases, a licença e a distribuição, e o modo de redigir o Exame. Isso precisava ser registrado nos documentos.

## Achados da revisão e tratamento

| #   | Achado                                                                                                                                       | Verificação                                                                               | Tratamento                                                                                                                                                                                                                                                                                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Os E2E usavam `vite preview`, que resolve `/sobre` → `sobre.html`. Em servidores estáticos simples, o link "Sobre" (`./sobre`) dava **404**. | **Confirmado:** com `python3 -m http.server`, `/sobre` dava 404 e `/sobre.html` dava 200. | `trailingSlash = 'always'` (gera `sobre/index.html`); links com barra final (`resolve('sobre/')`); servidor estático **estrito** para os E2E (`scripts/serve-build.ts`, que não adivinha extensões nem redireciona); novo E2E que verifica que **todos os links internos respondem 200**. Teste de mutação: voltando o link a `./sobre`, o teste falhou. |
| 2   | O CI usa Node 26, nunca testado                                                                                                              | Confirmado                                                                                | A sequência completa rodou também no **Node 26.13.1**: tudo verde.                                                                                                                                                                                                                                                                                       |
| 3   | O orçamento padrão de JS (35 KB) estava abaixo do custo do próprio framework (39 KB medidos)                                                 | Confirmado pelos números de `docs/budgets.md`                                             | Padrão recalibrado para **50 KB**. Páginas sem interatividade continuam com limite 0.                                                                                                                                                                                                                                                                    |
| 4   | A verificação de "execução direta" dos scripts falhava em caminho com link simbólico, que saía com código 0 sem verificar nada               | Confirmado pelo revisor                                                                   | Comparação por `realpathSync` nos três scripts.                                                                                                                                                                                                                                                                                                          |
| 5   | O parser do orçamento ignorava `preload as=script`, atributos sem aspas e `import()` em script inline                                        | Plausível                                                                                 | O parser passa a reconhecer esses casos, com novos testes. Deduplica pelo caminho resolvido.                                                                                                                                                                                                                                                             |
| 6   | `REUSE.toml` com `precedence = "aggregate"` rotularia arquivos de terceiros também como GPL                                                  | Pela especificação REUSE                                                                  | `precedence = "closest"`.                                                                                                                                                                                                                                                                                                                                |
| 7   | O CONTRIBUTING dizia que o CI repete o `pnpm verify`, mas o CI também roda `reuse lint`                                                      | Confirmado                                                                                | CONTRIBUTING atualizado.                                                                                                                                                                                                                                                                                                                                 |
| —   | A contagem "REUSE 31/31" da CHG-0001 estava desatualizada                                                                                    | Recontado: 39/39 no commit `90dfdd4`                                                      | Corrigido na CHG-0001.                                                                                                                                                                                                                                                                                                                                   |

## Decisões registradas

Proposta rev. 2: [`docs/proposta-revisao-2.md`](../proposta-revisao-2.md).

- **ADR-0001 aceito:**
  - tudo sob `GPL-3.0-or-later`, inclusive o conteúdo original;
  - DCO;
  - distribuição: web, depois GitHub Releases (Obtainium), F-Droid e demais lojas;
  - código só dos responsáveis até existir a permissão para a App Store.
- **ADR-0003 emendado:**
  - o conteúdo do `terco-diario` é a base aprovada;
  - rascunho assistido só para itens do Exame, com aprovação item a item;
  - continua proibido gerar orações, meditações, passagens e atribuições.
- **ADR-0002:** `trailingSlash = 'always'`, servidor estrito nos E2E, orçamento de 50 KB.
- **Pendências editoriais:**
  - responsáveis nomeados;
  - E1, E3, E5, E8, E9 e a base do E12 aprovados pela base do Korvo;
  - novas pendências E15–E18 do Exame.
- **Página inicial:** o Novenário saiu da lista, porque está na Fase 4.

## Validação

Executada em 26/11/2026 no ambiente de desenvolvimento em nuvem, com pnpm 12.23.0. Os testes E2E rodaram só em Chromium (desktop e móvel), o único navegador instalado aqui.

| Verificação                                    | Node 22.23.5                       | Node 26.13.1      |
| ---------------------------------------------- | ---------------------------------- | ----------------- |
| `pnpm check`                                   | 0 erros, 0 avisos                  | 0 erros, 0 avisos |
| `pnpm lint` (Prettier + ESLint)                | OK                                 | OK                |
| `pnpm test:unit`                               | 22/22                              | 22/22             |
| `pnpm build`                                   | OK                                 | OK                |
| `pnpm budget`                                  | OK (2 páginas)                     | OK (2 páginas)    |
| `pnpm licenses:check`                          | 176 pacotes, todos permitidos      | idem              |
| `pnpm test:e2e` (`chromium`, `chromium-movel`) | 30/30                              | 30/30             |
| `reuse lint`                                   | 43/43 arquivos, conforme REUSE 3.3 | —                 |

Na primeira execução, o `pnpm lint` falhou pela formatação deste mesmo documento, escrito depois da última formatação. Foi corrigido e o lint repetido nas duas versões.

## Riscos e pendências

- **Push e CI continuam bloqueados (HTTP 403).** Firefox e WebKit seguem **não verificados**.
- **Servidor de produção:** o servidor estrito serve só aos testes. O comportamento do servidor real depende do host (M3/CHG-0007).
