# Orçamentos de desempenho

Este documento separa duas coisas:

- **Metas propostas:** o que queremos atingir. Estão em `scripts/budgets.json`, verificadas por `pnpm budget` no CI.
- **Medições:** o que de fato foi medido, com data e versão.

## Como medir

- `pnpm build && pnpm budget`.
- Para cada página HTML do `build/`, o script soma o tamanho gzip (nível 9) de três coisas:
  - o próprio HTML;
  - o JS carregado de início (`modulepreload` e `<script src>`);
  - o CSS (`<link rel="stylesheet">`).
- Imagens e fontes ainda não entram: não existem nesta fase.

## Metas propostas (não medidas)

| Métrica                                                | Meta                                       | Onde é verificada   |
| ------------------------------------------------------ | ------------------------------------------ | ------------------- |
| HTML por página (gzip)                                 | ≤ 30 KB                                    | `pnpm budget`       |
| JS inicial (gzip), páginas interativas                 | ≤ 50 KB (padrão; recalibrado na CHG-0001b) | `pnpm budget`       |
| JS inicial, páginas sem interatividade (`csr = false`) | **0**                                      | `pnpm budget`       |
| CSS (gzip)                                             | ≤ 15 KB                                    | `pnpm budget`       |
| Fontes                                                 | ≤ 2 woff2, ≤ 120 KB no total               | a partir do M1      |
| Primeira visita ao `/terco`, sem imagens               | ≤ 200 KB transferidos                      | a partir do M1      |
| LCP / CLS / INP (Lighthouse mobile, throttling padrão) | ≤ 2,5 s / ≤ 0,1 / ≤ 200 ms                 | manual a cada marco |

## Medições registradas

### 26/11/2026 — CHG-0001 (fundação)

Ambiente: Node 22.23.5, pnpm 12.23.0, SvelteKit 3.4.0, Svelte 5.59.1, Vite 8.3.8.

| Página       | HTML (gzip) | JS inicial (gzip) | CSS (gzip) |
| ------------ | ----------- | ----------------- | ---------- |
| `index.html` | 1.293 B     | 0 B               | 1.440 B    |
| `sobre.html` | 1.795 B     | 0 B               | 1.301 B    |

- **Antes de `csr = false`**, com as mesmas páginas e o JS de hidratação do SvelteKit e do Svelte:
  - `index.html`: 39.122 B de JS inicial;
  - `sobre.html`: 39.635 B.
  - Ou seja, uma página só de leitura não deve carregar o cliente do SvelteKit.
- **Pasta `build/` inteira:** 115.454 B, em 23 arquivos.
  - Inclui chunks que nenhuma página carrega de início (por exemplo, o da página de erro).
- **Lighthouse:** não executado nesta change. Não há métricas de LCP, CLS ou INP registradas.

### 26/11/2026 — CHG-0001b (correções da revisão)

- `trailingSlash = 'always'`: a página "Sobre" passou a ser `sobre/index.html`.
- O padrão de JS para páginas interativas foi recalibrado de 35 KB para **50 KB**, porque só a hidratação mede ~39 KB.

| Página             | HTML (gzip) | JS inicial (gzip) | CSS (gzip) |
| ------------------ | ----------- | ----------------- | ---------- |
| `index.html`       | 1.266 B     | 0 B               | 1.440 B    |
| `sobre/index.html` | 1.806 B     | 0 B               | 1.301 B    |

### Referência externa (para comparação, não é meta)

| Artefato                                                         | Tamanho     |
| ---------------------------------------------------------------- | ----------- |
| `garamogger/terco-diario` `index.html` (commit `e4cbfd6`), bruto | 1.157.413 B |
| idem, gzip -9                                                    | 604.185 B   |
