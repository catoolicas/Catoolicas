# CHG-0001 — Fundação do projeto

- **Status:** implementada localmente; revisada e corrigida na [CHG-0001b](CHG-0001b-revisao-e-decisoes.md); push e CI bloqueados por falta de acesso ao GitHub
- **Marco:** M0
- **Branch:** `claude/quirky-lovelace-1cp3q1`

## Problema

O repositório estava vazio. Antes de qualquer módulo, precisamos de uma base com quatro garantias desde o primeiro dia:

- saída estática pré-renderizada;
- CSP restritiva;
- zero recursos de terceiros;
- pipeline de qualidade verificável em ambiente limpo.

## Escopo

- Esqueleto SvelteKit 3 + Svelte 5 + TypeScript strict + Vite 8 + pnpm 12, gerado com o CLI oficial.
- adapter-static com `strict: true` e `prerender = true` no layout raiz.
- CSP no modo `hash`.
- Layout base com `lang="pt-BR"`, link para pular ao conteúdo, landmarks, tokens claro/escuro e respeito a `prefers-reduced-motion`.
- Páginas `/` (início) e `/sobre` (privacidade, licenças, conteúdo religioso), ambas sem JS.
- Testes:
  - E2E (Playwright + axe);
  - verificação de orçamento e de licenças, com testes unitários;
  - REUSE.
- CI no GitHub Actions.
- Documentação: README, CONTRIBUTING, ADRs 0001–0003, proposta aprovada, pendências editoriais e orçamentos.

## Fora do escopo

- Módulos funcionais.
- Conteúdo religioso.
- Fontes customizadas e imagens.
- PWA e deploy.

## Tarefas

| #   | Tarefa                                                                                                                                                       | Resultado                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| T1  | Gerar com `sv@1.7.1 create --template minimal --types ts --add prettier eslint vitest="usages:unit" playwright="demo:no" sveltekit-adapter="adapter:static"` | Feito. Versões instaladas: @sveltejs/kit 3.4.0, svelte 5.59.1, vite 8.3.8, typescript 6.0.3, vitest 5.1.2.                |
| T2  | TS `strict` + `noUncheckedIndexedAccess` + `noImplicitOverride` + `noFallthroughCasesInSwitch` + `erasableSyntaxOnly`                                        | Feito. `pnpm check`: 0 erros, 0 avisos (com `--fail-on-warnings`).                                                        |
| T3  | adapter-static (`strict: true`) + `prerender = true`                                                                                                         | Feito. `build/` contém só arquivos estáticos (`index.html`, `sobre.html`, `_app/`).                                       |
| T4  | CSP `mode: 'hash'`                                                                                                                                           | Feito. `<meta http-equiv="content-security-policy">` presente, sem `unsafe-inline` nem `unsafe-eval` (verificado no E2E). |
| T5  | Layout base                                                                                                                                                  | Feito.                                                                                                                    |
| T6  | Páginas início e sobre                                                                                                                                       | Feito, com `csr = false` (0 B de JS).                                                                                     |
| T7  | E2E base                                                                                                                                                     | Feito: 13 testes por projeto de navegador.                                                                                |
| T8  | Orçamento (`scripts/check-budget.ts`, `scripts/budgets.json`) + testes                                                                                       | Feito.                                                                                                                    |
| T9  | Licenças (`scripts/check-licenses.ts`) + testes                                                                                                              | Feito.                                                                                                                    |
| T10 | CI (`.github/workflows/ci.yml`)                                                                                                                              | Feito. Ver "Validação".                                                                                                   |
| T11 | Documentos                                                                                                                                                   | Feito.                                                                                                                    |
| T12 | Validação em clone limpo                                                                                                                                     | Ver "Validação".                                                                                                          |

## Critérios de aceitação

| Critério                                                                                             | Situação                                                                                 |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `check`, `lint`, `test:unit`, `build`, `budget`, `licenses:check` e `test:e2e` passam em clone limpo | Ver "Validação"                                                                          |
| Só arquivos estáticos; build falha se alguma rota não for pré-renderizável                           | Atendido (`strict: true`)                                                                |
| CSP em `<meta>` com `default-src 'self'` e sem `unsafe-inline` em `script-src`                       | Atendido (E2E)                                                                           |
| Nenhuma requisição a outra origem; sem cookies; `localStorage`/`sessionStorage` vazios               | Atendido (E2E)                                                                           |
| axe sem violações WCAG 2.2 A/AA nos temas claro e escuro                                             | Atendido (E2E)                                                                           |
| Zero dependências de runtime além de Svelte/SvelteKit                                                | Atendido: todas as dependências são `devDependencies`, e as duas páginas não carregam JS |
| Tamanhos medidos registrados                                                                         | Atendido (`docs/budgets.md`)                                                             |
| Nenhum conteúdo religioso incluído                                                                   | Atendido                                                                                 |

## Testes

### Unitários (Vitest, 15 testes)

- **Avaliador de expressões SPDX:** OR, AND, precedência, parênteses, `WITH`, expressões malformadas.
- **Lista de reprovados:** exceções e grupos.
- **Extração de recursos do HTML:** ordem de atributos, duplicatas.
- **Avaliação do orçamento:** limites por página, igualdade com o limite, várias violações.

### E2E (Playwright, por página `/` e `/sobre`)

Projetos: `chromium`, `chromium-movel`, `firefox`, `webkit` e `webkit-movel`.

- Só carrega da própria origem, sem erros de console nem violações de CSP, sem cookies nem armazenamento.
- `lang="pt-BR"`, título, um único `h1`, CSP restritiva.
- `aria-current="page"` no link da página atual.
- axe sem violações (claro e escuro).
- Sem rolagem horizontal a 320 px.

E2E global: o link "pular para o conteúdo" é o primeiro foco e leva o foco ao `<main>`.

### Os testes falham quando devem

Teste de mutação feito em 26/11/2026 e revertido em seguida:

- Com contraste insuficiente (`--cor-tinta-suave: #c8c2b8`), os testes do axe no tema claro falharam.
- Com uma `<img>` de outra origem em `/sobre`, o teste de origem falhou.

## Validação

- **Ambiente de desenvolvimento em nuvem** (Node 22.23.5, pnpm 12.23.0):
  - `check`, `lint`, `test:unit` (15/15), `build`, `budget`, `licenses:check` (176 pacotes, todos permitidos) e `reuse lint` passaram. **Correção:** o "31/31" registrado antes vinha de uma execução anterior à criação dos documentos; a contagem real do commit `90dfdd4` é 39/39 (ver CHG-0001b).
  - `test:e2e` passou em `chromium` e `chromium-movel` (26/26), usando o Chromium pré-instalado do ambiente via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
  - **Firefox e WebKit não foram executados localmente:** os navegadores não estão instalados aqui. Eles rodam só no CI.
- **Clone limpo do commit `90dfdd4`** (26/11/2026), com `pnpm install --frozen-lockfile`:
  - mesma sequência e mesmos resultados acima: 15/15 unitários, orçamento e licenças OK, REUSE conforme, E2E 26/26 em Chromium;
  - ressalva: o store do pnpm do contêiner já estava populado, então a instalação não baixou pacotes da rede. A instalação a frio fica para o CI.
- **CI no GitHub Actions: não executado.**
  - O `git push` da branch foi recusado com HTTP 403: o Claude não tem acesso ao repositório pela organização no GitHub.
  - Firefox, WebKit e a instalação a frio continuam **não verificados** até o primeiro CI verde.

## Desvios em relação à proposta

1. O orçamento fica em `scripts/budgets.json`, não na raiz, para manter a raiz enxuta.
2. Créditos ao Korvo: nenhum código ou texto dele foi incorporado. Por isso a referência está no README, e não na página `/sobre`. Quando houver incorporação, os créditos irão também para o site.
3. A documentação está sob `GPL-3.0-or-later`. A `CC-BY-SA-4.0` será aplicada quando surgir o primeiro conteúdo original não técnico (ADR-0001, item 2).
4. O CI instala o pnpm via `npm install -g` com a versão do `packageManager`, em vez de `pnpm/action-setup`. Isso evita uma action de terceiros e a incerteza sobre o suporte ao pnpm 12.
5. Testes de componente (Vitest em modo navegador) não foram configurados. Entram quando surgir lógica de componente que o domínio e o E2E não cubram.
6. Correção da proposta: o Korvo cadastra **9** jaculatórias, não ~40. Corrigido em `docs/proposta-arquitetura.md` e em `docs/editorial/pendencias.md`.

## Riscos e pendências

- **Ecossistema recente:** o SvelteKit 3 tem cerca de oito semanas e o pnpm 12 é uma reescrita nativa. Versões fixadas no lockfile, só add-ons oficiais.
- **Scripts em `.ts`:** rodam com o _type stripping_ nativo do Node (≥ 22.18), garantido por `erasableSyntaxOnly`.
- **Q1 e Q2 (licença, lojas):** ADR-0001 está como "Proposto". O aviso de licença segue a recomendação até a decisão.
- **Hospedagem:** não escolhida (M4). Os cabeçalhos de segurança que não funcionam em `<meta>` (`frame-ancestors`, HSTS, `Permissions-Policy`) ainda não existem.
- **DCO:** a política vale para contribuições a partir da aprovação do ADR-0001. Os commits desta change não têm `Signed-off-by`.
