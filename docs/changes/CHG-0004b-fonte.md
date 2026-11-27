# CHG-0004b — Identidade visual do Korvo: fonte Cormorant Garamond

- **Status:** implementada (parcial); publica quando os responsáveis mesclarem o PR. **O logo do corvo em SVG continua pendente:** depende do vetor original do Korvo.
- **Marco:** M1 (Terço) e M2 (Exame), identidade visual
- **Depende de:** CHG-0004a

## Problema

O `terco-diario` usa a Cormorant Garamond (400, 600 e 400 itálico) pelo Google Fonts. Aqui, o texto usava fontes do sistema, e buscar a fonte no Google enviaria o IP de quem visita a um terceiro, o que a CSP e o princípio de privacidade não permitem.

## Escopo

- **Arquivos:** as três faces, subconjunto latino, woff2, copiadas sem alteração do pacote `@fontsource/cormorant-garamond` 5.3.0 para `src/lib/fontes/`.
  - O pacote foi baixado com `npm pack` fora do projeto e **não é dependência**.
  - O subconjunto latino cobre `U+0000-00FF` e `U+0152-0153`, inclusive æ e œ do latim. Caracteres fora dele (por exemplo, ℣ e ℟) usam a fonte de reserva.
- **Licença:** OFL-1.1.
  - Texto em `LICENSES/OFL-1.1.txt` (`reuse download`).
  - Anotação no `REUSE.toml` com a linha de copyright do arquivo LICENSE do pacote: "2015 The Cormorant Project Authors (github.com/CatharsisFonts/Cormorant)".
- **Uso:**
  - `@font-face` em `src/app.css`, com `font-display: swap` e `unicode-range` do subconjunto;
  - `--fonte-texto` começa por `'Cormorant Garamond'`, com as fontes de antes como reserva;
  - títulos, orações e itens do exame usam a fonte nova; botões, rótulos e notas continuam na fonte do sistema;
  - tamanho do texto: 1,125 rem com entrelinha de 1,6, o mesmo do `terco-diario` (1,125 rem, 1,62).
- **Pré-carga:** o layout pré-carrega as faces 400 e 600, com o endereço com hash gerado pelo Vite (`?url`).
  - O texto não troca de fonte depois de aparecer.
  - No Exame, as três faces carregam ao abrir a página, antes de qualquer interação (medido). A suíte de privacidade continua sem nenhuma requisição depois do carregamento.
- **Orçamento de fontes:** `scripts/check-budget.ts` passa a somar os `.woff2` do build. O limite em `budgets.json` é de 3 arquivos e 120 KB.

## Medição

| Face        | Tamanho               |
| ----------- | --------------------- |
| 400 normal  | 22.876 B              |
| 600 normal  | 23.396 B              |
| 400 itálico | 23.660 B              |
| **Total**   | **68,3 KB** de 120 KB |

As fontes ficam em `_app/immutable/assets/` com hash: o navegador as guarda em cache de longa duração.

## Testes

- `scripts/check-budget.test.ts` (+2): `avaliarFontes` aceita dentro do limite e aponta arquivos e bytes excedidos.
- E2E: os testes base (só a própria origem, sem erros de CSP) e a suíte de privacidade do Exame passam com as fontes.

## Validação

Executada em 27/11/2026 com pnpm 12.23.0. Os E2E rodaram em Chromium desktop e móvel; Firefox e WebKit rodam no CI.

| Verificação                                                              | Node 22.23.5     | Node 26.13.1 |
| ------------------------------------------------------------------------ | ---------------- | ------------ |
| `pnpm check` e `pnpm lint`                                               | OK               | OK           |
| `pnpm test:unit`                                                         | 162/162          | 162/162      |
| `pnpm build`, `check:rascunhos`, `budget` (com fontes), `licenses:check` | OK               | OK           |
| `pnpm test:e2e` (`chromium` + `chromium-movel`)                          | 132/132          | 132/132      |
| E2E com `BASE_PATH=/Catoolicas` (`chromium`)                             | 66/66            | —            |
| `reuse lint`                                                             | 142/142 arquivos | —            |

**Verificação visual:** capturas do Terço (desktop, claro) e do Exame (celular, escuro).
