# CHG-0007 — Publicação no GitHub Pages (parte 1: workflow)

- **Status:** implementada; aguardando a ativação do Pages e a primeira publicação
- **Marco:** M3 (publicação web)
- **Pedido:** responsáveis, 26/11/2026 ("criar o workflow para postagem no GitHub Pages")

## Problema

O site precisa ser publicado sem perder as garantias já verificadas no CI:

- saída estática;
- CSP;
- zero recursos de terceiros;
- acessibilidade;
- orçamento de desempenho.

No GitHub Pages sem domínio próprio, o site fica num **subcaminho** (`https://catoolicas.github.io/Catoolicas/`). Isso precisa ser configurado e testado.

## Escopo

| Arquivo                                         | Mudança                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/pages.yml`                   | **Novo.** Fluxo `verificar` (CI reutilizado) → `construir` (build com `BASE_PATH` vindo de `actions/configure-pages`, orçamento, E2E no Chromium desktop e móvel contra o artefato sob o subcaminho, envio do artefato) → `publicar` (`actions/deploy-pages`, ambiente `github-pages`). Disparado por push em `main` ou manualmente. Actions fixadas por SHA. |
| `.github/workflows/ci.yml`                      | Passa a ser reutilizável (`workflow_call`); não roda sozinho em push em `main` (o `pages.yml` já o executa); grupo de concorrência inclui o nome do workflow, para o CI chamado não cancelar nem ser cancelado.                                                                                                                                               |
| `vite.config.ts`                                | `paths.base` vem de `BASE_PATH` (vazio no desenvolvimento e no CI)                                                                                                                                                                                                                                                                                            |
| `scripts/serve-build.ts`                        | Subcaminho opcional: com ele, só URLs dentro do subcaminho são servidas, como em produção. Mais um teste unitário.                                                                                                                                                                                                                                            |
| `playwright.config.ts`, `tests/e2e/base.e2e.ts` | `baseURL` inclui o subcaminho; os testes usam caminhos relativos (`./`, `./sobre/`)                                                                                                                                                                                                                                                                           |
| `src/routes/+layout.svelte`                     | A página atual (`aria-current`) passa a ser identificada por `page.route.id`. A URL inclui o subcaminho e não serve para isso.                                                                                                                                                                                                                                |
| `src/routes/sobre/+page.svelte`                 | Aviso de privacidade da hospedagem: o GitHub registra o IP de quem visita, por segurança, com link para a documentação oficial                                                                                                                                                                                                                                |
| `docs/adr/0002-estatico-primeiro.md`            | Decisão de hospedagem e limitações aceitas                                                                                                                                                                                                                                                                                                                    |

## Fora do escopo

- Domínio próprio.
- PWA e uso offline.
- Página 404 própria.

Ficam para a parte 2 desta change, depois do MVP do Terço.

## Pré-requisitos e como publicar

1. **Uma vez, um administrador:** _Settings → Pages → Build and deployment → Source: GitHub Actions_.
   - Sem isso, o passo "Configurar o GitHub Pages" falha.
   - Pages em repositório **privado** exige plano pago da organização. Em repositório público, é gratuito.
2. **Publicar:** fazer push ou merge em `main`, ou rodar o workflow manualmente (_Actions → Publicar no GitHub Pages → Run workflow_).
   - O ambiente `github-pages` aceita, por padrão, só o branch padrão do repositório. Hoje o branch padrão é `claude/quirky-lovelace-1cp3q1`, porque `main` ainda não existe.

## Validação

Executada em 26/11/2026, no ambiente de desenvolvimento, com Node 22.23.5 e Chromium:

| Verificação                                                 | Resultado                                                                               |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `pnpm check` / `pnpm lint`                                  | 0 erros / OK                                                                            |
| `pnpm test:unit`                                            | 63/63 (um teste novo do subcaminho)                                                     |
| E2E **sem subcaminho** (como no CI)                         | 30/30                                                                                   |
| Build e E2E com **`BASE_PATH=/Catoolicas`** (como no Pages) | 30/30. Links internos, CSP, acessibilidade e `aria-current` funcionam sob o subcaminho. |
| Orçamento                                                   | Respeitado nos dois modos                                                               |

O workflow `pages.yml` em si **ainda não foi executado**. A primeira execução depende do pré-requisito 1, e só ela comprova a publicação de verdade.

## Riscos e pendências

- **Primeira execução:** pode revelar ajustes de permissão ou de ambiente.
- **Cabeçalhos de segurança:** o GitHub Pages não os permite. Ver ADR-0002.
- **Cache do Pages:** o GitHub serve com cache curto. Uma publicação pode levar alguns minutos para aparecer.
