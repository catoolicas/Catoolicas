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

### 26/11/2026 — CHG-0004a (interface do Terço)

**JS declarado no HTML** (`pnpm budget`):

| Página                     | HTML (gzip) | JS inicial (gzip) | CSS (gzip) |
| -------------------------- | ----------- | ----------------- | ---------- |
| `index.html`               | 1.381 B     | 0 B               | 1.601 B    |
| `sobre/index.html`         | 1.973 B     | 0 B               | 1.462 B    |
| `terco/index.html`         | 2.103 B     | 46.396 B          | 1.837 B    |
| `terco/<série>/index.html` | ~3.535 B    | 58.427 B          | 2.842 B    |
| `terco/rosario/index.html` | 3.559 B     | 58.357 B          | 2.842 B    |

**JS realmente baixado:** soma, com gzip -9, de todo `.js` recebido até a rede ficar ociosa. Inclui o conteúdo da série, carregado sob demanda, que o script estático não enxerga. Medido no E2E (`tests/e2e/terco.e2e.ts`, Chromium):

| Página            | Medido  | Limite do teste |
| ----------------- | ------- | --------------- |
| `/terco/`         | 45,6 KB | 50 KB           |
| `/terco/gozosos/` | 63,8 KB | 70 KB           |
| `/terco/rosario/` | 78,5 KB | 90 KB           |

- **Limites novos em `scripts/budgets.json`:** 60 KB de JS declarado para as páginas do Terço, a meta prevista na rev. 1 para a interface completa.
- **Por que há duas medições:** o script estático não vê o conteúdo carregado sob demanda.
- **Otimização possível** [FUT]: separar o latim do português.

### 26/11/2026 — CHG-0006 (interface do Exame)

**JS declarado no HTML** (`pnpm budget`). O Exame não carrega nada sob demanda: a suíte de privacidade confere que não há nenhuma requisição depois de a página abrir.

| Página                     | HTML (gzip) | JS inicial (gzip) | CSS (gzip) |
| -------------------------- | ----------- | ----------------- | ---------- |
| `exame/index.html`         | ~7,3 KB     | 50,2 KB           | 2,7 KB     |
| `terco/index.html`         | 2.147 B     | 45,4 KB           | 1,8 KB     |
| `terco/<série>/index.html` | ~3.589 B    | 57,2 KB           | 2,8 KB     |
| `terco/rosario/index.html` | 3.606 B     | 57,1 KB           | 2,8 KB     |

- **Depois da revisão independente:** ícone embutido no `app.html` (`data:`): +~250 B de HTML por página e uma requisição a menos. O exame passou a 50,2 KB de JS (campos desativados até a hidratação, isolamento do roteador).
- **Limite do Exame:** 60 KB, como as páginas do Terço. O conteúdo vai no JS para a hidratação, e cada rascunho aprovado acrescenta texto (os 11 atuais somam ~2 KB).
- **Efeito no Terço: +0,1 KB.** Uma primeira versão usava `{...atributos}` nos campos e `value` no `<select>`. Isso trouxe ao pedaço de JS **compartilhado por todas as páginas interativas** o código genérico de atributos e de seleção do Svelte: +2,5 KB no Terço, que ficou a 0,4 KB do limite. Com atributos literais e o seletor sincronizado por `$effect`, o custo sumiu (ADR-0004).

### Referência externa (para comparação, não é meta)

| Artefato                                                         | Tamanho     |
| ---------------------------------------------------------------- | ----------- |
| `garamogger/terco-diario` `index.html` (commit `e4cbfd6`), bruto | 1.157.413 B |
| idem, gzip -9                                                    | 604.185 B   |
