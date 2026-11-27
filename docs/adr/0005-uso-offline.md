# ADR-0005 — Uso sem internet por service worker

- **Status:** Aceito (roadmap da rev. 2, CHG-0007: "PWA mínimo, offline do Terço e do Exame"; plano aprovado em 27/11/2026)
- **Data:** 27/11/2026

## Contexto

- Quem reza o terço todos os dias, inclusive sem internet ou com aparelho modesto, precisa do site disponível offline (proposta de arquitetura, persona "Fiéis").
- O site é estático (ADR-0002) e cabe inteiro em poucas centenas de KB.
- O Exame tem regras de privacidade próprias (ADR-0004). Usá-lo em modo avião é, além disso, a garantia mais forte de que nada sai do aparelho.

## Decisão

1. **Service worker do SvelteKit** (`src/service-worker/index.ts`), registrado automaticamente.
   - O registro só acontece nas páginas com JavaScript (Terço e Exame). Início e Sobre continuam com 0 KB de JS.
   - Por isso o site passa a funcionar sem internet **depois da primeira visita ao Terço ou ao Exame**.
2. **O que guarda:** na instalação, os arquivos imutáveis do build, os arquivos estáticos e as páginas pré-renderizadas, todos listados em `$app/manifest`. Nada além disso.
3. **Estratégia** (`src/lib/sw/estrategia.ts`, função pura com testes):
   - **arquivos imutáveis** (nome com hash): cache primeiro;
   - **páginas e estáticos**: rede primeiro. Online, a pessoa vê a versão nova, e a cópia é atualizada; sem internet, recebe a cópia guardada;
   - **qualquer outra coisa** (outro método, outra origem, endereço com parâmetros, caminho fora da lista, `version.json`): o service worker não interfere e não guarda.
4. **Atualização:** o cache chama-se `catoolicas-<versão do build>`; ao ativar, a versão nova apaga os caches antigos. Sem `skipWaiting`: a versão nova assume quando as abas antigas fecham. Até lá, a rede primeiro garante HTML novo, e os arquivos novos, que têm outro nome, vêm da rede.
5. **Privacidade:**
   - guarda só o conteúdo público do site;
   - não vê o que a pessoa faz: o Exame não faz requisições depois de aberto;
   - não envia nem registra nada;
   - **a página "Sobre" explica** a cópia guardada e como apagá-la.
6. **Exame:** a CSP própria da página deixa de ter `worker-src 'none'`, que bloquearia o registro feito a partir dela (ADR-0004 atualizada).
7. **Sem manifesto de aplicativo (instalação na tela inicial) por ora:** os ícones dependem do logo do Korvo (CHG-0004b, pendente). O manifesto entra junto com o logo.
8. **Testes:** os E2E comuns rodam com service workers bloqueados (`serviceWorkers: 'block'`), para não dependerem de instalação em segundo plano. A suíte `tests/e2e/offline.e2e.ts` os liga e testa o modo avião.

## Consequências

- **Cache no aparelho:** ~480 KB (49 arquivos, sem compressão; medido na CHG-0007b) de arquivos públicos ficam guardados no navegador. Não são dados pessoais, mas são armazenamento, e isso está dito na página "Sobre".
- **Primeira visita:** depois de abrir o Terço ou o Exame, o navegador baixa o resto do site em segundo plano, uma vez por versão.
- **Tipos:** o service worker tem `tsconfig` próprio (bibliotecas de WebWorker) e é verificado por `tsc` dentro de `pnpm check`.
- **Navegadores:** o SvelteKit registra o service worker como módulo (`type: 'module'`). Onde isso não for suportado, o site continua funcionando online, sem o uso offline.
