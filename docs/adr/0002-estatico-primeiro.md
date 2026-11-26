# ADR-0002 — Estático primeiro: SvelteKit 3 com saída pré-renderizada

- **Status:** Aceito (proposta aprovada em 26/11/2026)
- **Data:** 26/11/2026

## Contexto

- Os módulos do MVP não precisam de servidor:
  - Terço, Exame e Novenário usam conteúdo público e estado local;
  - Pedidos de oração redirecionam para o Telegram.
- O Tauri 2 só suporta saída estática (SSG ou SPA), segundo o [guia oficial](https://v2.tauri.app/start/frontend/sveltekit/).
- Há requisitos de leveza, SEO e privacidade, e o projeto prefere evitar serviços pagos.
- O SvelteKit 3.0 (01/10/2026) move a configuração para o plugin `sveltekit()` do `vite.config.ts`.

## Decisão

1. **Adapter e pré-renderização:**
   - Usar `@sveltejs/adapter-static` com `strict: true`: o build falha se alguma rota não puder ser pré-renderizada.
   - `export const prerender = true` no layout raiz.
2. **Sem código de servidor nas rotas do núcleo:**
   - Só `load` universais (`+page.ts`/`+layout.ts`).
   - Proibido `+page.server.ts`/`+layout.server.ts`.
   - Remote functions e async Svelte ficam fora: continuam experimentais.
3. **`csr = false` em páginas sem interatividade.**
   - Medido nesta change: as páginas `/` e `/sobre` deixam de carregar ~39 KB de JS (gzip -9) e passam a carregar 0 KB.
   - O orçamento fixa JS = 0 para elas.
4. **CSP no modo `hash`**, emitida como `<meta http-equiv>` nas páginas pré-renderizadas.
   - Diretivas: `default-src 'self'`, `script-src 'self'` (mais os hashes do SvelteKit), `style-src 'self'`, `img-src 'self'`, `font-src 'self'`, `connect-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`.
   - Sem `unsafe-inline` e sem `unsafe-eval`.
   - Em `<meta>`, `frame-ancestors`, `report-uri` e `sandbox` são ignorados. Por isso vão como **cabeçalhos do host** quando ele for escolhido (M4), junto com `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options` e HSTS.
5. **`<meta name="referrer" content="no-referrer">`** no `app.html`. Vale mesmo em hosts que não permitem cabeçalhos.
6. **Zero recursos de terceiros:** fontes, scripts e imagens vêm do próprio site, e não há analytics. Os testes E2E verificam isso.
7. **Data do visitante resolvida no cliente:** o HTML pré-renderizado não conhece a data. O "mistério do dia" e a "perícope do dia" são calculados no navegador. As páginas estáticas por série servem para SEO e primeira pintura.
8. **Compatibilidade com Tauri, sem implementar nada agora:**
   - APIs de navegador só em `onMount`/`$effect` ou atrás de `browser`.
   - Caminhos relativos (`paths.relative`, que é o padrão).
   - URL de API configurável quando houver API.
   - Testes E2E também em WebKit.

## Alternativas consideradas

| Alternativa                           | Por que não                                                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `adapter-node` com SSR                | Exige servidor; o Tauri não suporta; custo operacional sem necessidade no MVP                                                         |
| SPA pura (`fallback` + `ssr = false`) | Pior SEO e pior primeira pintura em conexões lentas. Fica como possível perfil de build do Tauri, a decidir por spike na fase mobile. |

## Consequências

- O MVP pode ser hospedado em qualquer serviço estático. A escolha do host fica adiada para o M4 e é reversível.
- Funcionalidades com dados (pedidos com moderação, encomendas) exigirão uma API separada e um ADR próprio.
- Páginas interativas (Terço, Exame) terão orçamento de JS próprio. O padrão é 35 KB gzip, uma meta proposta a recalibrar.
