# CHG-0002 — Importação do conteúdo do Terço (PT + LA)

- **Status:** implementada localmente; push e CI bloqueados por falta de acesso ao GitHub
- **Marco:** M1 (Terço)
- **Origem:** `garamogger/terco-diario`, commit `e4cbfd6`

## Problema

O módulo do Terço parte do Terço Diário do Korvo. O conteúdo dele (orações, mistérios, pontos de Montfort, cláusulas, jaculatórias, esquemas) estava misturado à lógica e à apresentação num único `index.html` de 1,16 MB. Era preciso trazer **só os dados**, em português e latim, com procedência e sem nenhuma alteração de texto.

## Escopo

- **Tipos do conteúdo:** `src/lib/modules/terco/domain/tipos.ts`.
- **Conteúdo, só dados**, em `content/terco/`:

| Arquivo           | Conteúdo                                                                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `oracoes.ts`      | 12 orações de abertura e fecho (PT + LA), com versículo, nota e fonte                                                                                             |
| `misterios.ts`    | 4 séries × 5 mistérios: título, fruto, perícope, oferecimento, intenção do Pai-Nosso, fecho, 10 pontos de Montfort (exceto luminosos), notas, aviso dos luminosos |
| `clausulas.ts`    | 5 cláusulas por série                                                                                                                                             |
| `jaculatorias.ts` | 9 jaculatórias com devoção                                                                                                                                        |
| `esquemas.ts`     | Esquemas de dias "2002" e "Montfort"; padrões de abertura, fecho e jaculatórias                                                                                   |

- **Procedência:** `content/terco/SOURCES.md` e anotação REUSE própria (Korvo e contribuidores).
- **Alias `#content/*`** no `package.json`; `content/` incluída no `tsconfig` e no Vitest.
- **Ferramentas da importação**, versionadas para auditoria em `docs/changes/CHG-0002/`. O ESLint ignora `docs/`.

## Fora do escopo

- Uso do conteúdo por alguma página: fica para a CHG-0004. Por isso esta change **não altera o build publicado**.
- Exame (CHG-0005).
- Inglês, Via Sacra, Seleta, outros terços e Ladainha.
- As mudanças editoriais pendentes (rosário das cláusulas, perícopes adicionais, jaculatórias). A importação é fiel à origem.

## Decisões técnicas

1. **Extração estática** com `acorn`: o `index.html` não é executado. O parser roda numa pasta temporária e não entra nas dependências.
2. **Fidelidade:**
   - nenhum texto é editado;
   - única transformação: o `<br>` da Salve-Rainha vira `versiculo.v`/`versiculo.r`, para dispensar `{@html}`;
   - os campos `frase` dos luminosos são idênticos às cláusulas (o gerador verifica) e ficam só em `clausulas.ts`.
3. **Latim não oficial:** três orações de Montfort têm na origem latim marcado como "translatio non officialis". Aqui o campo `laNaoOficial: true` preserva essa marcação para a interface exibir.
4. **`perícopes` é lista:** a origem tem uma por mistério. A alternância diária passa a funcionar quando os responsáveis cadastrarem outras (E7).

## Testes

- **Conferência da importação** (`docs/changes/CHG-0002/conferir-terco.mjs`):
  - **785 conferências, 0 divergências**, entre todos os textos PT e LA, fontes, esquemas e padrões;
  - teste de mutação: trocar uma letra de um fruto gerou 1 divergência, apontada com o local exato.
- **Integridade no projeto** (`content/terco/conteudo.test.ts`, 9 testes no Vitest):
  - séries e quantidades;
  - 10 pontos, exceto nos luminosos;
  - perícopes;
  - cláusulas;
  - PT e LA não vazios e sem HTML;
  - latim não oficial só nas 3 orações;
  - ids únicos, procedência e status;
  - esquemas válidos;
  - padrões que só referenciam itens existentes.

## Validação

Executada em 26/11/2026 com pnpm 12.23.0. Os E2E rodaram só em Chromium (desktop e móvel).

| Verificação                              | Node 22.23.5                                                    | Node 26.13.1      |
| ---------------------------------------- | --------------------------------------------------------------- | ----------------- |
| `pnpm check`                             | 0 erros, 0 avisos                                               | 0 erros, 0 avisos |
| `pnpm lint`                              | OK                                                              | OK                |
| `pnpm test:unit`                         | 31/31                                                           | 31/31             |
| `pnpm build`, `budget`, `licenses:check` | OK (build inalterado: o conteúdo ainda não é usado por páginas) | OK                |
| `pnpm test:e2e`                          | 30/30                                                           | 30/30             |
| `reuse lint`                             | 56/56 arquivos                                                  | —                 |

## Riscos e pendências

- **Fonte única:** a partir daqui, correções são feitas em `content/terco/`. Se o `terco-diario` continuar sendo editado em paralelo, as duas cópias divergem. Isso precisa ser combinado com o Korvo (bloqueio listado na rev. 2).
- **Aprovação:** o conteúdo entra como base aprovada (ADR-0003, item 5). O PR desta change deve ser aprovado por um dos responsáveis.
