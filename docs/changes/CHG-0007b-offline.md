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
  - no `fetch`, usa cache primeiro para os imutáveis; rede primeiro, com prazo de 3 s, para páginas e estáticos; e ignora o resto. Nada é guardado durante o uso (ver a revisão independente).
- **`src/lib/sw/estrategia.ts`:** a decisão para cada pedido, em função pura, com testes.
- **Tipos:** `src/service-worker/tsconfig.json` estende `$app/tsconfig/service-worker`, com bibliotecas de WebWorker. O `tsconfig` raiz exclui a pasta, e `pnpm check` roda também `tsc -p src/service-worker`.
- **Registro à mão, só pelo Terço** (`src/routes/terco/+layout.svelte` e `src/lib/sw/registrar.ts`); o automático do SvelteKit fica desligado. O Exame mantém `worker-src 'none'` e é servido sem internet pelo service worker já instalado (ADR-0004 atualizada).
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

- **`src/lib/sw/estrategia.test.ts`** (7):
  - caminhos com subcaminho, inclusive a raiz;
  - cache primeiro, rede primeiro e "ignorar";
  - nome do cache por versão.
- **`tests/e2e/offline.e2e.ts`** (4 por navegador; ver também a revisão abaixo):
  - depois da primeira visita, em **modo avião**: Início, Sobre, Terço, uma série (avançando um passo, com o conteúdo carregado sob demanda), rosário e Exame (marcando um item) abrem e funcionam, sem erros;
  - no Exame, com o service worker ativo: marcar e escrever não fazem requisição nem mudam o cache, e nada do que foi escrito aparece no cache.
- **Mutação:** sem o `fetch` do service worker, o teste de modo avião falha.

## Revisão independente

Feita por um agente separado, com o código e o objetivo, sem as conclusões desta change. Achados e correções:

| #   | Achado                                                                                                                                                     | Correção                                                                                                          | Teste                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | Ao ativar, o service worker apagava **todos** os caches da origem, inclusive os de outros sites em `<conta>.github.io`                                     | apaga só `catoolicas-*` antigos (`cacheAntigo`)                                                                   | unitário                                                                      |
| 2   | A rede primeiro gravava HTML novo no cache antigo, e sem internet a página ficava sem os seus arquivos; a instalação podia pegar HTML antigo do cache HTTP | fotografia fixa: sem `cache.put` durante o uso; instalação com `cache: 'reload'`                                  | —                                                                             |
| 3   | O teste de privacidade do Exame não podia falhar: conferia o cache antes de digitar, só pelos endereços, e não via os pedidos do próprio service worker    | retrato depois de digitar, com resumo SHA-256 de cada resposta; pedidos ouvidos no contexto                       | —                                                                             |
| 4   | O teste de modo avião podia passar sem usar a cópia                                                                                                        | rede cortada também para o service worker (`context.route` com `abort`); cada página tem de vir do service worker | mutação: sem o `fetch`, falha                                                 |
| 5   | Sem `worker-src 'none'`, código comprometido na página do Exame poderia criar um worker que usa a rede                                                     | `worker-src 'none'` volta; o service worker é registrado à mão só pelo Terço                                      | teste "abrir só o Exame não registra"; com as duas barreiras removidas, falha |
| 6   | Falha ao abrir o cache virava erro de rede                                                                                                                 | erros do cache tratados (sem cópia, segue a rede)                                                                 | —                                                                             |
| 7   | Rede primeiro sem prazo e sem reserva para 404/503                                                                                                         | prazo de 3 s e cópia guardada em erro do servidor                                                                 | —                                                                             |
| 8   | Links com parâmetros e endereços sem barra não abriam sem internet                                                                                         | navegação com parâmetros usa a página guardada; sem barra, redireciona                                            | unitários e E2E                                                               |
| 9   | Firefox e WebKit não testados localmente                                                                                                                   | no CI, a suíte offline é pulada com o motivo, se o service worker não ativar lá; no Chromium, tem de ativar       | CI                                                                            |

Também mudou o "Sobre": a cópia passa a ser guardada depois de abrir o **Terço**.

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
