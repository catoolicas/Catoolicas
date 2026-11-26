# Procedência do conteúdo do Exame de consciência

## Base aprovada: `terco-diario`

| Campo              | Valor                                                                   |
| ------------------ | ----------------------------------------------------------------------- |
| Repositório        | [`garamogger/terco-diario`](https://github.com/garamogger/terco-diario) |
| Commit             | `e4cbfd689666d10ee4c2fc59fbe37dc815fb733b` (28/10/2026)                 |
| Arquivo            | `index.html`                                                            |
| Licença na origem  | GPL-3.0                                                                 |
| Data da importação | 26/11/2026 (CHG-0005)                                                   |

O autor (`garamogger`, Korvo) é um dos responsáveis pelo projeto e declarou ter autorização explícita para o material que usou. Esse conteúdo entra como **base aprovada** (ADR-0003, item 5).

| Arquivo          | Conteúdo                                                                                                   | Origem no `index.html`                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `secoes.ts`      | 9 seções, 37 itens: pergunta, frase de acusação, nota pastoral, "pode ser matéria grave"                   | Constante `EXAME`                                                                                                |
| `orientacoes.ts` | Oração "Peça luz", 7 orientações ("Antes de começar") e os textos do resumo e do roteiro do confessionário | HTML estático dos templates do exame e da função `resumoHTML`                                                    |
| `atos.ts`        | Confiteor e três atos de contrição                                                                         | Seleta, categoria "Penitência e confissão". O ato do resumo (`EX_ATO`) é idêntico a "Meu Deus, eu me arrependo". |

- **Não importado:** o "exame completo" cifrado. Segundo o próprio aplicativo, ele fica guardado com senha porque, por descer a muitos detalhes, pode alimentar o escrúpulo; o autor o declarou de uso pessoal.
- **Método:** extração estática, sem executar o arquivo, com as ferramentas de `docs/changes/CHG-0005/`. Não houve nenhuma edição de texto.
- **Conferência automática string a string:** **233 conferências, 0 divergências**. Um teste de mutação confirmou que a troca de uma letra é detectada.

## Rascunhos assistidos (`rascunhos.ts`)

- **O que são:** itens redigidos com IA, por decisão dos responsáveis ("eu rascunho, vocês aprovam"), a partir da matriz de **tópicos** em `docs/editorial/exame-matriz.md`.
- **O que não são:** nenhuma frase foi copiada ou parafraseada dos três PDFs de referência. Um deles é "© Santa Cruz Editora 2020, todos os direitos reservados", e os outros dois não têm licença.
- **Status:** todos estão `em-revisao` e não são publicados até aprovação item a item.
- **Cânones citados nas notas:** conferidos em 26/11/2026 no texto oficial do Código de Direito Canônico (1983), em vatican.va.
  - Cân. 97 §1: maioridade aos 18 anos. [Latim, Livro I](https://www.vatican.va/archive/cod-iuris-canonici/latin/documents/cic_liberI_la.html)
  - Cân. 920: Comunhão ao menos uma vez por ano, no tempo pascal. [Latim, Livro IV](https://www.vatican.va/archive/cod-iuris-canonici/latin/documents/cic_liberIV_la.html)
  - Cân. 989: confessar os pecados graves ao menos uma vez por ano. [Latim, Livro IV](https://www.vatican.va/archive/cod-iuris-canonici/latin/documents/cic_liberIV_la.html)
  - Cân. 1252: abstinência a partir dos 14 anos completos; jejum da maioridade até o início dos 60. [Inglês, cân. 1244–1253](https://www.vatican.va/archive/cod-iuris-canonici/eng/documents/cic_lib4-cann1244-1253_en.html)
  - Cân. 1253: a conferência episcopal pode determinar a observância e substituir por outras formas de penitência. [Inglês, cân. 1244–1253](https://www.vatican.va/archive/cod-iuris-canonici/eng/documents/cic_lib4-cann1244-1253_en.html)
  - Cân. 222 §1: dever de ajudar a Igreja em suas necessidades. [Latim, Livro II](https://www.vatican.va/archive/cod-iuris-canonici/latin/documents/cic_liberII_la.html)

## Fonte única

Este diretório é a fonte única do conteúdo do Exame. Correções são feitas aqui, por PR aprovado por um dos responsáveis.
