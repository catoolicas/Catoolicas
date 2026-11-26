# CHG-0003 — Domínio do Terço

- **Status:** implementada localmente; push e CI bloqueados por falta de acesso ao GitHub
- **Marco:** M1 (Terço)
- **Depende de:** CHG-0002 (conteúdo)

## Problema

A interface do Terço (CHG-0004) precisa de regras confiáveis e testáveis, separadas do Svelte e do DOM:

- qual série rezar hoje;
- qual perícope mostrar;
- em que ordem vêm as orações e as contas;
- como navegar;
- quais teclas fazem o quê.

## Escopo

| Arquivo                                      | Responsabilidade                                                                                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/modules/terco/domain/calendario.ts` | Série do dia pelo esquema, data local, dias desde a época, **perícope do dia** (determinística, pela data local, sem efeito de fuso nem de horário de verão)                        |
| `src/lib/modules/terco/domain/sequencia.ts`  | Monta a **sequência linear de passos**: abertura → dezenas (anúncio, Pai-Nosso, 10 Ave-Marias, Glória, jaculatórias, fecho) → oração final da série → fecho. Valida a configuração. |
| `src/lib/modules/terco/domain/navegacao.ts`  | Próximo e anterior, próxima dezena e dezena anterior, início e fim, progresso (passos e Ave-Marias). Sempre dentro dos limites.                                                     |
| `src/lib/modules/terco/domain/teclado.ts`    | Mapa de teclas puro e tabela de ajuda                                                                                                                                               |
| `src/lib/modules/terco/conteudo.ts`          | Liga o domínio ao conteúdo de `content/terco/` e define a configuração padrão (os padrões da origem)                                                                                |

## Regras implementadas

- **Avanço automático:** como a sequência é linear, o passo seguinte ao fecho de uma dezena é o anúncio da próxima.
- **Meditações de Montfort:** cada Ave-Maria traz o seu ponto (1 a 10).
- **Luminosos:** não têm pontos de Montfort. Com as meditações ligadas, a cláusula do mistério serve de frase-guia, como no `terco-diario`.
- **Rosário das cláusulas** (alternância): a cláusula entra em todas as Ave-Marias, de todas as séries.
- **Rosário inteiro:** várias séries em sequência. A abertura e o fecho aparecem uma vez; cada série termina com a sua oração final.
  - Essa é a interpretação provisória da pendência E2 (15 ou 20 mistérios, repetição da abertura), a confirmar pelos responsáveis.
- **Atalhos:**
  - setas, PageUp/PageDown, Home/End e Esc funcionam sempre;
  - **Espaço, letras (inclusive Vim `j k h l J K gg G`), `t` e `?`** dependem de uma opção que pode ser desligada (WCAG 2.2, critério 2.1.4). Por cautela, o Espaço também entra nesse grupo.
  - Os atalhos ignoram combinações com Ctrl, Cmd ou Alt.

## Testes

Vitest: 31 testes novos, 62 no total.

| Arquivo              | O que cobre                                                                                                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `calendario.test.ts` | Esquemas 2002 e Montfort; formato da data; **um dia a mais por dia ao longo de um ano inteiro**; alternância e determinismo da perícope (com fixture marcada `[texto de teste]`)                                                                                    |
| `sequencia.test.ts`  | Tamanho e forma do terço padrão (95 passos); 3 Ave-Marias iniciais com intenção; 50 Ave-Marias numeradas; pontos de Montfort; cláusulas nos luminosos e no rosário das cláusulas; jaculatórias; rosário inteiro (20 dezenas, 200 Ave-Marias); erros de configuração |
| `navegacao.test.ts`  | Limites; passagem de uma dezena à seguinte; próxima dezena e dezena anterior em todos os casos de borda; progresso                                                                                                                                                  |
| `teclado.test.ts`    | Teclas sempre ativas; atalhos de um caractere só com a opção ligada; `gg`; modificadores; **a tabela de ajuda corresponde exatamente ao mapa de teclas**                                                                                                            |

Também foram executados:

- **Fusos horários:** os 62 testes passaram em UTC, America/Sao_Paulo, America/New_York, Europe/Lisbon, Pacific/Auckland e Asia/Kolkata.
- **Teste de mutação**, com as duas falhas revertidas:
  - tirar a regra da cláusula nos luminosos fez 1 teste falhar;
  - deixar o Espaço sempre ativo fez 2 testes falharem.

## Fora do escopo

- Interface, estado reativo, preferências e rotas: ficam para a CHG-0004. Nenhuma página usa o domínio ainda, então **o build publicado não muda**.
- Persistência do progresso do dia (CHG-0004).

## Validação

Executada em 26/11/2026 com pnpm 12.23.0. Os E2E rodaram só em Chromium (desktop e móvel).

| Verificação                              | Node 22.23.5          | Node 26.13.1      |
| ---------------------------------------- | --------------------- | ----------------- |
| `pnpm check`                             | 0 erros, 0 avisos     | 0 erros, 0 avisos |
| `pnpm lint`                              | OK                    | OK                |
| `pnpm test:unit`                         | 62/62                 | 62/62             |
| `pnpm build`, `budget`, `licenses:check` | OK (build inalterado) | OK                |
| `pnpm test:e2e`                          | 30/30                 | 30/30             |
| `reuse lint`                             | 66/66 arquivos        | —                 |

## Riscos e pendências

- **E2:** a forma do rosário inteiro pode mudar, mas a mudança fica restrita a `montarSequencia`.
- **Rotação de perícopes:** só se nota quando houver mais de uma perícope por mistério (pendência E7).
