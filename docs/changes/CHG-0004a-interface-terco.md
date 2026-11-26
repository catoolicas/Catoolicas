# CHG-0004a — Interface do Terço (funcional)

- **Status:** implementada e **publicada** em 26/11/2026 ([run 45895544356](https://github.com/catoolicas/Catoolicas/actions/runs/45895544356)). Verificada ao vivo: as páginas respondem 200; num navegador real, o "terço de hoje" levou aos luminosos numa quinta-feira, sem erros de console e sem requisições externas.
- **Marco:** M1 (Terço)
- **Depende de:** CHG-0002 (conteúdo), CHG-0003 (domínio)
- **Fica para a CHG-0004b:** identidade visual do Korvo (Cormorant Garamond auto-hospedada e logo do corvo em SVG, quando o vetor chegar)

## Problema

O conteúdo e o domínio do Terço estavam prontos, mas sem nenhuma página. Era preciso permitir rezar o terço do dia, qualquer série ou o rosário inteiro:

- por teclado, toque e leitor de tela;
- com as preferências pedidas;
- sem enviar nada a ninguém;
- dentro do orçamento de desempenho.

## Escopo

### Rotas

Todas pré-renderizadas:

| Rota                    | Conteúdo                                                                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/terco/`               | Menu. O botão "Começar o terço de hoje" é calculado no navegador, pela data local e pelo esquema escolhido (2002 ou Montfort). Também lista as 4 séries e o rosário inteiro. |
| `/terco/[serie=serie]/` | O terço de uma série. O matcher de rota está em `src/params.ts`, com `defineParams` do SvelteKit 3.                                                                          |
| `/terco/rosario/`       | Rosário inteiro: 20 dezenas e 200 Ave-Marias                                                                                                                                 |

A página inicial e a navegação principal passam a apontar para o Terço. Nas páginas internas da seção, a navegação marca `aria-current="true"`.

### Estado

- **`state/terco.svelte.ts`:** classe `EstadoTerco`, criada por página.
  - `$state` guarda `indice` e `preferencias`; a sequência, o passo e o progresso são `$derived`.
  - Ao mudar uma preferência que altera a sequência, mantém a posição equivalente (`passoEquivalente`, nova função pura em `domain/navegacao.ts`).
- **`state/preferencias.ts`:** preferências e progresso do dia no `localStorage`.
  - Validados campo a campo, sempre com `try/catch`.
  - **Nada é gravado só por abrir a página**: só depois de a pessoa avançar ou mudar uma preferência.
  - Botão "Apagar dados deste aparelho".

### Componentes

| Componente                     | Responsabilidade                                                                                                                                                                                                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui/Terco.svelte`              | Junta tudo: teclado (`resolverTecla`), diálogos nativos, região `aria-live`                                                                                                                                                                                                         |
| `ui/PassoAtual.svelte`         | Mostra o passo atual. Anúncio com fruto, **perícope do dia**, oferecimento e notas. Orações com versículo e resposta. Ave-Maria com o ponto de Montfort e a cláusula. Jaculatória. Fecho. Oração final. Usa `lang="la"` no latim e marca a "(tradução não oficial)". Sem `{@html}`. |
| `ui/ContasRosario.svelte`      | Contas em SVG decorativo (`aria-hidden`), com a dezena atual, a conta atual e as já rezadas                                                                                                                                                                                         |
| `ui/Controles.svelte`          | Botões de ≥ 44 px, fixos embaixo no celular; barra de progresso nativa (`<progress>`)                                                                                                                                                                                               |
| `ui/PainelPreferencias.svelte` | Idioma PT/LA; meditações de Montfort; **"Rosário das cláusulas"**; texto completo; jaculatórias; atalhos de uma tecla                                                                                                                                                               |
| `ui/AjudaAtalhos.svelte`       | Ajuda gerada de `AJUDA_ATALHOS`                                                                                                                                                                                                                                                     |
| `ui/descrever.ts`              | Descrição de cada passo para leitores de tela                                                                                                                                                                                                                                       |
| `ui/texto.ts`                  | Escolha de idioma, com o português de reserva                                                                                                                                                                                                                                       |

### Conteúdo reorganizado, sem alteração de texto

- `content/terco/series.ts`: cabeçalhos das séries (nome, tema, oração final, aviso). São pequenos, e o menu usa sem baixar os mistérios.
- `content/terco/misterios/<serie>.ts`: um arquivo por série. Cada página carrega só a sua (`carregar.ts`, `import.meta.glob`).
- `content/terco/misterios.ts`: índice para testes e ferramentas.
- A conferência string a string contra o `terco-diario` foi refeita: **785/785, 0 divergências**.

### Outras mudanças

- **CSP:** `style-src-attr 'unsafe-hashes' 'sha256-S8qM…'` autoriza **um único** estilo inline, o do anunciador de rotas do SvelteKit (`div#svelte-announcer`, em `runtime/components/root.svelte`).
  - O hash foi calculado a partir do código-fonte e confere com o que o navegador aponta.
  - Não usa `unsafe-inline`.
- **Cores por série:** a paleta do `terco-diario` (claro e escuro) virou o token `--cor-serie`.
- **Largura das páginas do Terço:** 60 rem, com cabeçalho e rodapé alinhados.

## Decisões e desvios em relação ao plano

1. **`domain/navegacao.ts` ganhou `passoEquivalente`.** O plano previa o domínio sem mudanças, mas a regra de manter a posição é de domínio e precisava de testes.
2. **Sem `role="application"`**: os controles são botões comuns, e os atalhos ignoram eventos com foco em botões, campos e diálogos.
3. **Espaço num botão focado ativa o botão**, comportamento nativo. Exemplo: depois de fechar as Preferências, o foco volta ao botão e o Espaço reabre o diálogo. Isso foi mantido.
4. **Mensagem do fim do terço:** "Fim do terço.", neutra. Nenhuma fórmula devocional foi acrescentada (ADR-0003).
5. **Rosário inteiro** (pendência E2): a abertura e o fecho aparecem uma vez, e cada série tem a sua oração final.
6. **Intenções particulares:** fora desta change.

## Testes

- **Unitários** (81 no total, 19 novos):
  - preferências: validação campo a campo, JSON corrompido, armazenamento bloqueado, progresso por data e página, apagar;
  - `passoEquivalente`;
  - `exibir` (idioma, reserva em português, não oficial);
  - `descreverPasso`.
- **E2E** (`tests/e2e/terco.e2e.ts`, por projeto de navegador):
  - rezar o terço inteiro **só com teclado** (95 passos), voltar ao início e navegar por dezenas;
  - rezar o terço inteiro **só com toque** (`tap` nos projetos móveis) ou clique;
  - região `aria-live`;
  - atalhos de uma tecla desligáveis, com as setas continuando a funcionar;
  - latim com `lang="la"` e o aviso de tradução não oficial;
  - **nada gravado só por abrir a página**;
  - progresso e preferências sobrevivem ao recarregamento, e "Apagar dados" zera tudo;
  - `Esc` volta ao menu;
  - rosário inteiro (200 Ave-Marias, passagem para os luminosos);
  - **terço de hoje com relógio controlado**: numa quinta-feira, o esquema 2002 dá os luminosos e o de Montfort dá os gozosos (a escolha persiste);
  - 4 páginas: só a própria origem, sem erros de console ou de CSP, axe nos dois temas e reflow a 320 px;
  - diálogos acessíveis (axe);
  - **peso real de JS** (abaixo).
- **Testes base:** o menu do Terço entra nas rotas verificadas (origem, CSP, `aria-current`, axe, reflow, links internos).

## Desempenho

| Página            | JS declarado no HTML (`pnpm budget`) | JS realmente baixado (E2E)                    | Meta                         |
| ----------------- | ------------------------------------ | --------------------------------------------- | ---------------------------- |
| `/terco/`         | 46.396 B                             | 45,6 KB                                       | 50 KB                        |
| `/terco/<série>/` | 58.427 B                             | 63,8 KB (o conteúdo da série vem sob demanda) | 60 KB declarado / 70 KB real |
| `/terco/rosario/` | 58.357 B                             | 78,5 KB (4 séries)                            | 60 KB declarado / 90 KB real |

- **Para reduzir mais** [FUT]: separar o latim do português em pedaços diferentes, de modo que quem reza em português não baixe o latim.
- Para comparação: o `index.html` do `terco-diario` tinha 604 KB comprimido.

## Validação

Executada em 26/11/2026 com pnpm 12.23.0. Os E2E rodaram em Chromium desktop e móvel; Firefox e WebKit rodam no CI.

| Verificação                                          | Node 22.23.5            | Node 26.13.1      |
| ---------------------------------------------------- | ----------------------- | ----------------- |
| `pnpm check`                                         | 0 erros, 0 avisos       | 0 erros, 0 avisos |
| `pnpm lint`                                          | OK                      | OK                |
| `pnpm test:unit`                                     | 81/81                   | 81/81             |
| `pnpm build`, `budget` (8 páginas), `licenses:check` | OK                      | OK                |
| `pnpm test:e2e` (`chromium` + `chromium-movel`)      | 76/76                   | 76/76             |
| E2E com `BASE_PATH=/Catoolicas` (`chromium`)         | 38/38                   | —                 |
| `reuse lint`                                         | 97/97 arquivos          | —                 |
| Conferência do conteúdo contra a origem              | 785/785, 0 divergências | —                 |

**Verificação visual:** capturas de tela no desktop (1280 px, tema claro) e no celular (390 px, tema escuro). Elas levaram ao alinhamento do cabeçalho e do rodapé com o conteúdo mais largo.

**Teste de mutação nos novos E2E:** sem a exceção de CSP do anunciador, os testes de origem e de console falharam nas páginas com JS. Foi esse o achado que levou à exceção.

## Riscos e pendências

- **E6 (rosário das cláusulas):** o rótulo já usa o nome pedido. O uso das cláusulas como frase-guia nos luminosos segue a base do Korvo e aguarda confirmação dos responsáveis.
- **E2 (rosário inteiro) e E7 (perícopes adicionais):** pendentes.
- **CHG-0004b:** depende do vetor do logo.
- **`unsafe-hashes`:** é amplamente suportado, mas navegadores antigos que não o reconhecem bloqueiam o estilo do anunciador. Nesse caso, a `div` vazia do anunciador fica visível; não há outro efeito.
