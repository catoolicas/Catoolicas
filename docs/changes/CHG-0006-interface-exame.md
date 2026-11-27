# CHG-0006 — Interface e privacidade do Exame de consciência

- **Status:** publicada em 27/11/2026: merge do [PR #1](https://github.com/catoolicas/Catoolicas/pull/1) por `garamogger` e [run 46010872784](https://github.com/catoolicas/Catoolicas/actions/runs/46010872784).
- **Verificação ao vivo** (Chromium, no site publicado):
  - resposta 200, com as duas `<meta>` de CSP e nenhum texto em revisão no HTML;
  - depois de marcar itens, escrever, imprimir, focar a janela e mostrar a aba: nenhuma requisição, nenhuma violação de CSP, nenhum erro de console e nada no armazenamento.
- **Marco:** M2 (Exame)
- **Depende de:** CHG-0005 (conteúdo)
- **Decisão de arquitetura:** [ADR-0004](../adr/0004-privacidade-exame.md), com o modelo de ameaças

## Problema

O conteúdo do exame estava pronto, sem página. O requisito dos responsáveis é estrito: nada do que a pessoa marca ou escreve pode sair da memória da página. Isso exclui rede, logs, análise de audiência, armazenamento do navegador, cookies e persistência automática. A impressão tem de ser local.

## Escopo

### Rota `/exame/`

Pré-renderizada, com hidratação.

- Na ordem da página:
  - título e subtítulo da base ("Preparação para a confissão");
  - aviso de privacidade e aviso pastoral;
  - "Antes de começar" (oração e 7 orientações da base);
  - as 9 seções com caixas de seleção;
  - "Minha lista".
- Item marcado que "pode ser matéria grave" mostra "Quantas vezes, aproximadamente (opcional)", **como no `terco-diario`**.
- "Minha lista":
  - "Tempo desde a última confissão (opcional)";
  - escolha do ato de contrição entre os 3 da base;
  - o Confiteor num `<details>`;
  - **Imprimir** e **Apagar tudo agora**;
  - a lista: graves primeiro, depois as outras faltas, o roteiro do confessionário, o ato escolhido e "Depois da confissão…".
- **Filtro por estado de vida:** só aparece se algum item visível tiver o marcador `estados`. Em produção, nenhum aparece, porque só os rascunhos têm o marcador.
- Navegação principal ganhou "Exame". A página inicial e "Sobre" (privacidade) apontam para ele.

### Conteúdo e porta editorial

- **`content/exame/interface.ts`:** títulos e avisos da interface que vêm da base, copiados do `index.html` e conferidos pela ferramenta da CHG-0005 (240/240).
- **Rascunhos fora do build de produção:**
  - `pnpm exame:rascunhos` agora também gera `content/exame/rascunhos-aprovados.ts`, só com os aprovados (hoje, nenhum);
  - o site importa **só esse arquivo**; o `rascunhos.ts` completo é importado dinamicamente apenas com `import.meta.env.DEV`, e o build o elimina;
  - verificado: nenhum texto em revisão no `build/` nem no que o navegador baixa (E2E).
- `+page.server.ts` continua proibido (ADR-0002): a montagem fica em `+page.ts` (`conteudo.ts`).

### Privacidade

Detalhes e justificativas na ADR-0004.

| Barreira                                                                                    | Onde                                                                                                                    |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Estado só na memória do componente (`EstadoExame`)                                          | `state/exame.svelte.ts`                                                                                                 |
| Campos e botões desativados até a hidratação, com explicação                                | `ui/Exame.svelte`, `routes/exame/+page.svelte` (`<noscript>`)                                                           |
| Roteador do SvelteKit isolado (`beforeunload`, `visibilitychange`, `focus` da janela)       | `ui/Exame.svelte`; tipo em `src/app.d.ts`                                                                               |
| Nenhum texto em revisão no build                                                            | `scripts/check-rascunhos.ts` (`pnpm check:rascunhos`, no CI e antes de publicar)                                        |
| CSP adicional `connect-src 'none'`, `img-src data:` e outras                                | `<meta>` literal em `routes/exame/+page.svelte`; ícone do site embutido no `app.html`                                   |
| Carga completa ao entrar e ao sair                                                          | `+layout.svelte`, `+page.svelte` (inicial)                                                                              |
| `pagehide` e `pageshow` (bfcache) zeram o estado                                            | `ui/Exame.svelte`                                                                                                       |
| Campos com atributos de "não guardar, não corrigir, não traduzir", sem `name`, sem `<form>` | `ui/CaixaPrivada.svelte`, `ui/TextoPrivado.svelte`, seletor em `ui/Exame.svelte`; lista de referência em `ui/campos.ts` |
| Valores de mão única (o estado manda no campo na hidratação)                                | os mesmos componentes; seletor por `$effect`                                                                            |
| Regras de lint do exame                                                                     | `scripts/eslint-privacidade.ts`, aplicadas em `eslint.config.js`                                                        |
| `translate="no"` na "Minha lista"                                                           | `ui/Exame.svelte`                                                                                                       |
| Impressão por `@media print`, sem iframe nem biblioteca                                     | `ui/Exame.svelte`, `ui/Resumo.svelte`                                                                                   |

### Textos de interface escritos pelo projeto (pendência E19)

Os demais textos da página vêm da base.

- **Aviso pastoral:** "Este roteiro ajuda a preparar a confissão. Não é a confissão e não substitui o sacramento nem a orientação do confessor."
- **Aviso de privacidade:**
  - o parágrafo "O que você marca ou escreve…";
  - a lista "O que esta página não controla" (GitHub Pages, histórico, extensões, teclados, tradutores, impressão, quem estiver com o aparelho).
- **Rótulos:**
  - "Tempo desde a última confissão (opcional)";
  - "Ato de contrição na lista";
  - "Mostrar também as perguntas para" (pessoas casadas, pais e mães, quem trabalha ou emprega);
  - "Apagar tudo agora";
  - "Tudo foi apagado.";
  - as marcas de rascunho, que só aparecem no desenvolvimento.
- **Sem JavaScript** (depois da revisão independente):
  - `<noscript>`: "Os campos do exame só funcionam com JavaScript, que é o que apaga tudo ao sair da página. Sem ele, ficam desativados: dá para ler o exame, mas não para preenchê-lo.";
  - aviso na lista, que some na hidratação: "Os campos só funcionam depois que a página termina de carregar, com JavaScript ligado. Até lá, ficam desativados: assim, nada do que fosse marcado ficaria guardado no navegador."

## Decisões e desvios em relação ao plano

1. **Sem campos "descrição" e "circunstâncias"** (pendência E20). O plano os previa. Ficou como no `terco-diario`, só "quantas vezes" nos graves: a base pede "sem nomes, sem detalhes, sem justificativas", e há menos dado sensível na tela.
2. **Seletor em vez de botões de opção** para o ato: botões de opção precisam de `name` para formar grupo (setas do teclado, "1 de 3"), e o lint proíbe `name`.
3. **"Apagar tudo agora" sem confirmação** (o `terco-diario` confirmava): serve para apagar na hora.
4. **Sem índice de seções com âncoras:** cada `#ex-m6` iria para o histórico e revelaria qual mandamento foi aberto.
5. **Atributos literais, sem espalhamento:** `{...CAMPO_PRIVADO}` e `value` no `<select>` traziam ~2,5 KB de código genérico do Svelte ao JS de **todas** as páginas interativas (medido: o Terço passou de 57,1 para 59,6 KB, a 0,4 KB do limite). Com atributos literais, o custo caiu para 0,1 KB.
6. **Seletor sincronizado por `$effect`:** o teste de restauração mostrou que o `selected` das opções não desfaz uma seleção restaurada pelo navegador.
7. **Sem `+page.server.ts`** (ADR-0002); a separação dos rascunhos é feita pelo arquivo gerado.

## Testes

- **Unitários** (157 no total, 64 novos):
  - `scripts/eslint-privacidade.test.ts` (49): cada API proibida, em `.ts` e `.svelte`, é barrada **por uma regra de privacidade** (erro de sintaxe não conta); o código normal do exame passa; o Terço continua podendo gravar preferências. Usa o `eslint.config.js` real.
  - `domain/resumo.test.ts` (8): ordem graves e depois as outras; "quantas vezes" aparado e só nos graves; ordem do exame, não a da marcação; filtro por estado de vida; marcações de itens escondidos descartadas.
  - `domain/montagem.test.ts` (+2): `soAprovados`.
  - `scripts/check-rascunhos.test.ts` (3): textos e ids em revisão; aprovados ficam de fora; aponta o arquivo onde achou.
  - `scripts/exame-rascunhos.test.ts` (+2): o arquivo de aprovados está em dia e não traz nada em revisão.
- **E2E de privacidade** (`tests/e2e/exame.e2e.ts`, 11 testes por navegador):
  - **nenhuma requisição nem violação de CSP** enquanto se marca, digita, passa o mouse nos links, abre detalhes, imprime, foca a janela e esconde e mostra a aba; URL, título, `history.length`, `history.state`, `window.name`, cookies, localStorage, sessionStorage, Cache, IndexedDB e service workers **iguais antes e depois**;
  - `fetch`, `sendBeacon`, `new Image()` e `background-image` para a própria origem, forçados, são **bloqueados pela CSP** (violação de `connect-src`), e nada chega à rede;
  - todos os campos têm os atributos de `CAMPO_PRIVADO`, **no HTML pré-renderizado e no DOM**, sem `name` e sem `<form>`;
  - "Apagar tudo agora" zera e anuncia;
  - recarregar não restaura, nem a posição de rolagem (`sessionStorage` vazio);
  - **cache de navegação de verdade** (Chromium com o bfcache ligado): sair, voltar do cache e nada volta;
  - **valores restaurados pelo navegador antes da hidratação são descartados** (simulação durante a leitura do HTML);
  - sair por link recarrega a página, e voltar não restaura;
  - entrar por link recarrega a página;
  - `pagehide` e `pageshow` (persisted) zeram.
- **E2E sem JavaScript** (1 por navegador): campos e botões desativados, aviso visível, `<noscript>` no HTML.
- **E2E de funcionamento** (8 por navegador): lista e ato; impressão (só título e lista); **nenhum rascunho em revisão no HTML e no JS**; teclado; axe nos dois temas com dois itens graves marcados; cada "quantas vezes" descrito pela sua pergunta; reflow a 320 px.
- **Testes base:** `/exame/` entrou nas rotas verificadas (origem, CSP, `aria-current`, links, axe, reflow).

### Testes de mutação

Cada barreira foi desligada de propósito, e o teste correspondente falhou:

| Mutação                                                           | Teste que falhou                                                                                     |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Sem a `<meta>` de CSP do exame                                    | "a política da página bloqueia qualquer conexão"                                                     |
| Sem `pagehide`/`pageshow`                                         | "pagehide e a volta do cache de navegação zeram o estado"                                            |
| Sem recarga ao sair do exame                                      | "sair por um link recarrega a página"                                                                |
| Campo de texto sem `autocomplete="off"`                           | "campos: atributos de privacidade"                                                                   |
| `bind:value` sem `autocomplete` no campo de texto                 | "valores que o navegador restaurar… são descartados"                                                 |
| `bind:checked` na caixa                                           | idem                                                                                                 |
| Seletor sem o `$effect`                                           | idem (foi este teste que revelou o problema do seletor)                                              |
| CSP sem `img-src data:`                                           | "a política da página bloqueia qualquer conexão"                                                     |
| Sem isolar `visibilitychange` do roteador                         | "nenhuma requisição nem violação" (só depois de corrigir o teste: o evento sintético não borbulhava) |
| Sem isolar o `focus` da janela                                    | idem                                                                                                 |
| Sem isolar `beforeunload`                                         | "recarregar… nem a posição de rolagem"                                                               |
| Sem `pagehide`/`pageshow`, com bfcache ligado                     | "cache de navegação de verdade"                                                                      |
| Caixa sem `disabled` antes da hidratação                          | "sem JavaScript: campos e botões desativados"                                                        |
| "Quantas vezes" sem descrição                                     | "cada quantas vezes é descrito pela sua pergunta"                                                    |
| Build com `NODE_ENV=development` e `--mode development`           | `pnpm check:rascunhos` acusou `ex-preceitos` no HTML e num pedaço de JS                              |
| As 16 regras novas do lint desligadas (regras do commit anterior) | os 16 testes novos de `eslint-privacidade`                                                           |
| Regra de `bind:` desligada no lint                                | 2 testes de `eslint-privacidade`                                                                     |

- **O que não pôde ser observado aqui:** o Chromium sem interface não restaura campos ao recarregar, por isso a restauração é simulada.
- **Firefox e WebKit** rodam no CI.
- **O que depende de navegador real, teclado ou extensão:** checklist manual em [`docs/privacy/exame-checklist.md`](../privacy/exame-checklist.md), com todas as linhas **não verificadas**.

## Desempenho

| Página            | JS declarado (gzip)        | Limite       |
| ----------------- | -------------------------- | ------------ |
| `/exame/`         | 50,2 KB (nada sob demanda) | 60 KB (novo) |
| `/terco/`         | 45,4 KB (+0,1)             | 50 KB        |
| `/terco/<série>/` | 57,2 KB (+0,1)             | 60 KB        |

O HTML do exame tem ~7,3 KB (gzip). O ícone embutido acrescentou ~250 B ao HTML de cada página e tirou uma requisição. Detalhes em `docs/budgets.md`.

## Validação

Executada em 26/11/2026 com pnpm 12.23.0. Os E2E rodaram em Chromium desktop e móvel; Firefox e WebKit rodam no CI.

| Verificação                                                             | Node 22.23.5                                                                                               | Node 26.13.1      |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------- |
| `pnpm check`                                                            | 0 erros, 0 avisos                                                                                          | 0 erros, 0 avisos |
| `pnpm lint` (com as regras de privacidade)                              | OK                                                                                                         | OK                |
| `pnpm test:unit`                                                        | 157/157                                                                                                    | 157/157           |
| `pnpm build`, `check:rascunhos`, `budget` (9 páginas), `licenses:check` | OK                                                                                                         | OK                |
| `pnpm test:e2e` (`chromium` + `chromium-movel`)                         | 128/128                                                                                                    | 128/128           |
| E2E com `BASE_PATH=/Catoolicas` (`chromium`)                            | 64/64                                                                                                      | —                 |
| `reuse lint`                                                            | 137/137 arquivos                                                                                           | —                 |
| Conferência do Exame (com `interface.ts`)                               | 240/240                                                                                                    | —                 |
| Conferência do Terço (regressão)                                        | 785/785                                                                                                    | —                 |
| Modo de desenvolvimento (`vite dev`)                                    | 10 seções, 44 itens visíveis (8 marcas de rascunho); filtro presente; "pessoas casadas" acrescenta 2 itens | —                 |

**Verificação visual:** capturas no desktop (1280 px, claro), no celular (Pixel 7, escuro) e na impressão. Elas levaram ao alinhamento da nota com o texto da pergunta.

## Revisão independente

Feita por um agente separado, com o requisito e o código, sem as conclusões desta change. Achados e o que foi feito:

| #   | Achado (verificado pelo revisor)                                                                                                                                                                                           | Correção                                                                                                                                            | Teste                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | Sem JavaScript (ou com a hidratação falhando), os campos funcionavam, "Apagar" não, e o bfcache restaurava tudo, contrariando o aviso                                                                                      | campos e botões desativados até a hidratação; `<noscript>` e aviso na lista                                                                         | "sem JavaScript"                                                          |
| 2   | A CSP da página não barrava pedidos à própria origem com dados na URL (`<img>`, `background-image` via CSSOM, prefetch)                                                                                                    | `img-src data:` (ícone embutido); lint de elementos e atributos de URL. Script, estilo, fonte e navegação não têm barreira de CSP: ficam com o lint | "bloqueia qualquer conexão" com imagem e `background-image`               |
| 3   | O lint era fácil de contornar: `../` escapava da lista de imports; `<img src>`, `<a href>`, `style:`, `<title>` com dados, `<svelte:element>`, apelido do `console`, `reportError`, desestruturação; layout fora do escopo | regras novas e layout/hooks com as regras de código                                                                                                 | 16 casos novos, que falham com as regras antigas                          |
| 4   | Testes que não podiam falhar: o de voltar não usava o bfcache (o Playwright o desliga no Chromium); "nenhuma requisição" não via tentativas barradas; o de rascunhos só olhava parte dos arquivos e dos campos             | bfcache ligado num teste próprio; ouvinte de violações de CSP; varredura do `build/` inteiro                                                        | mutações D, B, E e a de build                                             |
| 5   | O roteador do SvelteKit gravava a posição de rolagem no `sessionStorage` e buscava `version.json` ao focar a janela                                                                                                        | isolado enquanto o exame está aberto                                                                                                                | "recarregar… nem a posição de rolagem"; "nenhuma requisição nem violação" |
| 6   | A porta dos rascunhos dependia só de `DEV`: `NODE_ENV=development pnpm build` publicava rascunhos                                                                                                                          | exige também `MODE === 'development'`; `pnpm check:rascunhos` no CI e antes de publicar                                                             | controle positivo                                                         |
| 7   | Acessibilidade: campos "quantas vezes" com o mesmo nome; região de status fora da árvore até ter texto; aviso não sumia nem se repetia                                                                                     | descrição pela pergunta; região sempre presente; aviso some a cada mudança e é reescrito                                                            | testes de descrição e de "Apagar" duas vezes                              |

**Sem correção, e registrado:** `throw new Error(dado)` chegaria ao console (revisão de código); desfazer (Ctrl+Z) depois de "Apagar" não traz o texto de volta no Chromium (bom); no Firefox, não verificado.

## Riscos e pendências

- **Teste de bfcache real:** só no Chromium, com o bfcache ligado e o canal `chromium`, que é o navegador completo sem janela. O primeiro CI (run 45904924724) mostrou que o "headless shell", padrão do Playwright, não restaura páginas do bfcache. No Firefox e no WebKit, o comportamento é coberto pelos eventos `pagehide`/`pageshow` simulados e pelo teste de voltar pelo histórico.

- **Editoriais:** E12a (rascunhos), E19 (textos de interface), E20 (campos de descrição).
- **Desenvolvimento:** na página do exame, o HMR do Vite é bloqueado pela CSP. É preciso recarregar à mão.
- **Fora do alcance da página:** extensões, teclados que ignoram os pedidos, tradutores e impressão (aviso e checklist).
- **Checklist manual:** nenhuma linha executada ainda.
