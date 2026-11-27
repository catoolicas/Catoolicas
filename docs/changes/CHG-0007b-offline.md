# CHG-0007b — Uso sem internet (service worker)

- **Status:** implementada; publica quando os responsáveis mesclarem o PR.
- **Marco:** M4 (publicação), parte que faltava da CHG-0007 do roadmap
- **Decisão de arquitetura:** [ADR-0005](../adr/0005-uso-offline.md)

## Problema

O site precisava de internet para abrir. O roadmap aprovado previa o uso offline do Terço e do Exame.

## Escopo

- **`src/service-worker/index.ts`** (1,2 KB gzip):
  - na instalação, guarda os 49 arquivos listados em `$app/manifest` (~480 KB sem compressão): arquivos imutáveis do build, fontes, `robots.txt` e as 9 páginas;
  - ao ativar, apaga os caches de versões antigas;
  - no `fetch`, usa cache primeiro para os imutáveis, rede primeiro para páginas e estáticos, e ignora o resto.
- **`src/lib/sw/estrategia.ts`:** a decisão para cada pedido, em função pura, com testes.
- **Tipos:** `src/service-worker/tsconfig.json` estende `$app/tsconfig/service-worker`, com bibliotecas de WebWorker. O `tsconfig` raiz exclui a pasta, e `pnpm check` roda também `tsc -p src/service-worker`.
- **Exame:** a CSP da página perde `worker-src 'none'`, que bloquearia o registro feito pelo SvelteKit (ADR-0004 atualizada).
- **"Sobre":** explica a cópia guardada e como apagá-la.
- **Playwright:** `serviceWorkers: 'block'` por padrão; a suíte nova liga o service worker.

## Decisões

1. **Rede primeiro para páginas:** online, a pessoa sempre vê a versão nova; o cache é a reserva sem internet.
2. **Só endereços conhecidos:** o service worker não guarda nada que não esteja no manifesto do build, nem endereços com parâmetros.
3. **Sem manifesto de aplicativo:** depende dos ícones do logo (CHG-0004b, pendente).
4. **Sem `skipWaiting`:** a versão nova assume quando as abas antigas fecham, como no exemplo do SvelteKit.

## Achado durante a implementação

A página inicial (`''` no manifesto), resolvida contra o endereço do próprio service worker, virava o endereço dele, e a raiz do site nunca era guardada. O teste unitário e o E2E de modo avião pegaram o problema. Agora os caminhos são resolvidos contra a pasta do service worker.

## Testes

- **`src/lib/sw/estrategia.test.ts`** (5):
  - caminhos com subcaminho, inclusive a raiz;
  - cache primeiro, rede primeiro e "ignorar";
  - nome do cache por versão.
- **`tests/e2e/offline.e2e.ts`** (2 por navegador):
  - depois da primeira visita, em **modo avião**: Início, Sobre, Terço, uma série (avançando um passo, com o conteúdo carregado sob demanda), rosário e Exame (marcando um item) abrem e funcionam, sem erros;
  - no Exame, com o service worker ativo: marcar e escrever não fazem requisição nem mudam o cache, e nada do que foi escrito aparece no cache.
- **Mutação:** sem o `fetch` do service worker, o teste de modo avião falha.

## Validação

Executada em 27/11/2026 com pnpm 12.23.0. Os E2E rodaram em Chromium desktop e móvel; Firefox e WebKit rodam no CI.

| Verificação                                                 | Node 22.23.5     | Node 26.13.1 |
| ----------------------------------------------------------- | ---------------- | ------------ |
| `pnpm check` (com `tsc` do service worker) e `pnpm lint`    | OK               | OK           |
| `pnpm test:unit`                                            | 167/167          | 167/167      |
| `pnpm build`, `check:rascunhos`, `budget`, `licenses:check` | OK               | OK           |
| `pnpm test:e2e` (`chromium` + `chromium-movel`)             | 136/136          | 136/136      |
| E2E com `BASE_PATH=/Catoolicas` (`chromium`)                | 68/68            | —            |
| `reuse lint`                                                | 149/149 arquivos | —            |

**Revisão independente:** em andamento; achados e correções entram numa change seguinte.
