# Pendências editoriais e litúrgicas

Decisões que **não são técnicas**. Cabem aos responsáveis pelo conteúdo: **`garamogger` (Korvo)** e **`williamdasilvazoia8-blip`**.

- **Status possíveis:** **pendente** → **aprovado** (com data) ou **rejeitado**.
- **Como aprovar:**
  - aprovar o PR que altera este arquivo ou o conteúdo em `content/`;
  - no conteúdo, o campo `status` passa a `'aprovado'` (ADR-0003).
- **Base aprovada:** o conteúdo do `terco-diario` (commit `e4cbfd6`) é a base aprovada, porque o autor é responsável e declarou autorização explícita para o material usado (decisão de 26/11/2026). Só as **mudanças** sobre essa base ficam pendentes.
- Nenhum texto deste documento é conteúdo a publicar.

## Terço

| #   | Tema                                  | Situação                                                                                                                                                                                                                                                                     |
| --- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | Esquema de mistérios por dia          | **Aprovado (base do Korvo):** os dois esquemas ("2002" e "Montfort"), com o de 2002 como padrão. Variações por tempo litúrgico ficam fora do MVP.                                                                                                                            |
| E2  | Rosário inteiro                       | **Pendente.** O Korvo não tem esse modo, só uma série por vez, embora o texto dele explique "quinze mistérios… vinte, desde 2002". Decidir: 15 ou 20 mistérios, a ordem das séries e se as orações iniciais e finais se repetem a cada terço ou só abrem e fecham o rosário. |
| E3  | Orações iniciais e finais padrão      | **Aprovado (base do Korvo):** **abertura** — sinal da cruz, oferecimento inicial (Montfort), Credo, oferecimento do terço, Pai-Nosso, 3 Ave-Marias, Glória; **finais** — saudação a Maria (Montfort), Salve-Rainha, coleta, duas orações do Anjo.                            |
| E4  | Jaculatórias ao fim das dezenas       | **Pendente:** revisão das jaculatórias finais, pedida por vocês. Base: 9 cadastradas, com Glória e Fátima como padrão.                                                                                                                                                       |
| E5  | Versão das orações comuns             | **Aprovado (base do Korvo)** em PT e LA. O inglês fica para depois.                                                                                                                                                                                                          |
| E6  | Rosário das cláusulas                 | **Pendente:** renomear "método abreviado" para "rosário das cláusulas" e usar as cláusulas como regra nos luminosos. As cláusulas atuais vêm da base.                                                                                                                        |
| E7  | Perícopes por mistério                | **Base aprovada:** uma perícope por mistério, a do Korvo. **Pendente:** cadastrar passagens adicionais para a alternância diária, com a mesma tradução e procedência registrada. A regra de rotação é determinística pela data local.                                        |
| E8  | Frutos dos mistérios                  | **Aprovado (base do Korvo).**                                                                                                                                                                                                                                                |
| E9  | Pontos e textos do método de Montfort | **Aprovado (base do Korvo).** A procedência das traduções PT e LA fica registrada em `content/terco/SOURCES.md`. Montfort escreveu em francês.                                                                                                                               |
| E10 | Imagens sacras                        | **Pendente** e fora do MVP: seleção, procedência, legendas e textos alternativos.                                                                                                                                                                                            |
| E11 | Ladainha                              | **Fora do MVP** (fase seguinte do Terço, junto com Via Sacra, Seleta e outros terços).                                                                                                                                                                                       |
| E13 | Devoções "com ressalva"               | **Fora** por ora.                                                                                                                                                                                                                                                            |
| E14 | Sequências e gamificação              | **Recomendação:** não mostrar sequências, pontuações ou metas. Pendente de confirmação.                                                                                                                                                                                      |

## Exame de consciência

| #    | Tema                                                  | Situação                                                                                                                                                                                   |
| ---- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E12  | Base do exame                                         | **Aprovado (base do Korvo):** 37 itens em 9 seções, notas pastorais, marcação "pode ser matéria grave" e um ato de contrição. O "exame completo" cifrado é de uso pessoal e **não entra**. |
| E12a | Itens novos                                           | **Pendente item a item.** São rascunhos assistidos com `status: 'em-revisao'`, a partir da matriz de tópicos (`docs/editorial/exame-matriz.md`).                                           |
| E15  | Disciplina dos preceitos (jejum, abstinência, idades) | **Pendente.** Recomendação: lei vigente (CDC de 1983, cân. 1249–1253). Um dos PDFs de referência usa regras anteriores a 1966.                                                             |
| E16  | Itens sobre posições políticas (por exemplo, voto)    | **Pendente.** Um dos PDFs de referência os traz. Decisão de vocês.                                                                                                                         |
| E17  | Orientação para pessoas escrupulosas                  | **Pendente.** A base do Korvo já traz notas como "dúvida… não é pecado". Um dos PDFs orienta "na dúvida, confesse", o que pede cuidado pastoral.                                           |
| E18  | Linguagem dos itens do 6º e 9º mandamentos            | **Pendente.** Recomendação: discrição, sem detalhes, adequada a adolescentes.                                                                                                              |
