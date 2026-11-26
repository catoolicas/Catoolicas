# Procedência do conteúdo do Terço

## Origem

| Campo              | Valor                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Repositório        | [`garamogger/terco-diario`](https://github.com/garamogger/terco-diario) ("Rosário Meditado", do Korvo) |
| Commit             | `e4cbfd689666d10ee4c2fc59fbe37dc815fb733b` (28/10/2026)                                                |
| Arquivo            | `index.html` (dados nas constantes do script)                                                          |
| Licença na origem  | GPL-3.0                                                                                                |
| Data da importação | 26/11/2026 (CHG-0002)                                                                                  |

## Autorização

- O autor do `terco-diario` (`garamogger`, Korvo) é um dos responsáveis por este projeto e pelo seu conteúdo.
- Ele declarou ter autorização explícita para todo o material usado no `terco-diario` (decisão registrada em 26/11/2026, `docs/proposta-revisao-2.md`).
- Por isso, esse conteúdo entra como **base aprovada** (ADR-0003, item 5).

## Fontes declaradas na origem

- **Rodapé do aplicativo:** "Textos conforme o livreto 'O Santo Rosário Meditado' — método de meditação de São Luís Maria Grignion de Montfort. Perícopes evangélicas segundo a tradução dos livretos de origem."
- **Por oração** (campo `procedencia.fonte`): São Luís Maria Grignion de Montfort (oferecimento inicial); Mt 6,9-13 (Pai-Nosso); Lc 1,28.42 (Ave-Maria); Missal Romano, festa do Rosário (coleta); Anjo de Portugal, 1916 (orações do Anjo).
- São Luís de Montfort escreveu os seus métodos em **francês**. Os textos em português e em latim dos pontos de meditação são **traduções**, tal como estão na origem.

## Latim

- **Fontes do latim:**
  - a tabela de tradução da origem (`TRAD_DADOS`, coluna latina);
  - os textos latinos das orações (`ORACOES.la`);
  - as jaculatórias (`JAC_ITENS[].txt.la`).
- Três orações de Montfort (oferecimento inicial, oferecimento do terço e saudação a Maria) não tinham versão latina nas fontes do livreto. A origem traz para elas um latim marcado como **"translatio non officialis"**, e aqui esse texto leva `laNaoOficial: true`.

## O que foi e o que não foi importado

- **Organização desde a CHG-0004a:**
  - `series.ts`: cabeçalhos das séries;
  - `misterios/<serie>.ts`: um arquivo por série;
  - `misterios.ts`: índice.
  - Os textos não foram alterados: a conferência foi refeita com 785/785.
- **Importado:**
  - 4 séries com 5 mistérios cada: título, fruto, perícope, oferecimento, intenção do Pai-Nosso, fecho, pontos de Montfort e notas;
  - as cláusulas;
  - 12 orações de abertura e de fecho;
  - 9 jaculatórias;
  - os esquemas de dias "2002" e "Montfort";
  - os padrões de abertura, de fecho e de jaculatórias.
- **Importado depois, em changes próprias:** o exame de consciência simples e os atos de contrição (CHG-0005).
- **Não importado (fases posteriores ou fora do escopo):** inglês, Via Sacra, Seleta, outros terços, Ladainha, santos de devoção, textos da interface, "exame completo" cifrado (uso pessoal do autor).

## Método e conferência

- **Extração estática:** o `index.html` foi analisado por um parser de JavaScript, sem executar o arquivo.
  - As ferramentas usadas estão em `docs/changes/CHG-0002/`. O parser não é dependência do projeto.
- **Única transformação:** o `<br>` entre versículo e resposta da Salve-Rainha virou os campos `versiculo.v` e `versiculo.r`. Nenhum texto foi editado.
- **Conferência automática string a string** entre a origem e este diretório: **785 conferências, 0 divergências**. Um teste de mutação confirmou que a conferência detecta uma alteração de uma única letra.

## Fonte única

- A partir desta importação, **este diretório é a fonte única** do conteúdo do Terço.
- Correções e acréscimos são feitos aqui, por PR aprovado por um dos responsáveis.
