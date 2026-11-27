# ADR-0005 — Uso sem internet por service worker

- **Status:** Aceito (roadmap da rev. 2, CHG-0007: "PWA mínimo, offline do Terço e do Exame"; plano aprovado em 27/11/2026). Revisado no mesmo dia, depois da revisão independente (CHG-0007b).
- **Data:** 27/11/2026

## Contexto

- Quem reza o terço todos os dias, inclusive sem internet ou com aparelho modesto, precisa do site disponível offline (proposta de arquitetura, persona "Fiéis").
- O site é estático (ADR-0002) e cabe inteiro em poucas centenas de KB.
- O Exame tem regras de privacidade próprias (ADR-0004). Usá-lo em modo avião é, além disso, a garantia mais forte de que nada sai do aparelho.
- No GitHub Pages, a origem (`<conta>.github.io`) pode servir vários sites, e o Cache Storage é da origem inteira.

## Decisão

1. **Service worker** em `src/service-worker/index.ts`, **registrado à mão só pelas páginas do Terço** (`src/routes/terco/+layout.svelte`, depois do `load`).
   - O registro automático do SvelteKit fica desligado (`serviceWorker.register: false`).
   - Assim, a página do Exame **mantém `worker-src 'none'`**: nenhum código dela cria workers, que poderiam usar a rede (ADR-0004). Mesmo assim, ela é servida sem internet pelo service worker já instalado, porque controlar a página não depende de `worker-src`.
   - Início e Sobre continuam com 0 KB de JS.
   - O site passa a funcionar sem internet **depois da primeira visita ao Terço**.
2. **Fotografia fixa por versão:** na instalação, guarda os arquivos imutáveis do build, os estáticos e as páginas pré-renderizadas listados em `$app/manifest`.
   - A busca usa `cache: 'reload'`, para não pegar do cache HTTP do navegador uma página antiga que aponte para arquivos de outra versão.
   - **Nada é guardado nem trocado durante o uso.** Uma página nova nunca fica no cache sem os seus arquivos.
3. **Estratégia** (`src/lib/sw/estrategia.ts`, funções puras com testes):
   - **imutáveis** (nome com hash): cache primeiro;
   - **páginas e estáticos:** rede primeiro, com **prazo de 3 s**. Sem resposta a tempo, sem internet ou com erro do servidor (404, 503), usa a cópia guardada;
   - **navegação com parâmetros** (por exemplo, `?fbclid=`): usa a página guardada, sem guardar o endereço;
   - **navegação sem a barra final** (`/terco`): redireciona para `/terco/`;
   - **qualquer outra coisa** (outro método, outra origem, caminho fora da lista, `version.json`): o service worker não interfere.
4. **Atualização:**
   - o cache chama-se `catoolicas-<versão do build>`;
   - ao ativar, a versão nova apaga **só os caches `catoolicas-*` antigos**, nunca os de outros sites da mesma origem;
   - sem `skipWaiting`: a versão nova assume quando as abas antigas fecham. Até lá, a versão antiga continua servindo a sua fotografia completa, e online a rede traz o HTML novo, cujos arquivos (com outros nomes) também vêm da rede.
5. **Privacidade:**
   - guarda só o conteúdo público do site;
   - não vê o que a pessoa faz: o Exame não faz requisições depois de aberto;
   - não envia nem registra nada; erros de registro e de cache são silenciosos.
   - **A página "Sobre" explica** a cópia guardada e como apagá-la.
6. **Sem manifesto de aplicativo (instalação na tela inicial) por ora:** os ícones dependem do logo do Korvo (CHG-0004b, pendente).
7. **Testes:** os E2E comuns rodam com service workers bloqueados (`serviceWorkers: 'block'`). A suíte `tests/e2e/offline.e2e.ts` os liga, desliga a rede inclusive para o próprio service worker e confere que cada página veio dele.

## Consequências

- **Cache no aparelho:** ~480 KB (49 arquivos, sem compressão; medido na CHG-0007b) de arquivos públicos ficam guardados no navegador. Não são dados pessoais, mas são armazenamento, e isso está dito na página "Sobre".
- **Primeira visita:** depois de abrir o Terço, o navegador baixa o resto do site em segundo plano, uma vez por versão.
- **Tipos:** o service worker tem `tsconfig` próprio (bibliotecas de WebWorker) e é verificado por `tsc` dentro de `pnpm check`.
- **Navegadores:** o registro é como módulo (`type: 'module'`). Onde isso não for suportado, o site continua funcionando online, sem uso offline e sem erro.
- **Limite conhecido:** o endereço `/Catoolicas`, sem a barra, fica fora do escopo do service worker e não abre sem internet. Os links do site sempre usam a barra.
