# ADR-0001 — Licenciamento, contribuições e distribuição

- **Status:** Aceito (decisões dos responsáveis em 26/11/2026)
- **Data:** 26/11/2026
- **Responsáveis pelo projeto e pelo conteúdo:** `garamogger` (Korvo) e `williamdasilvazoia8-blip`

## Contexto

- O código precisa ser livre.
- O repositório também terá orações, meditações, documentos e, mais tarde, edições de missais e breviários.
- Os aplicativos serão distribuídos nas principais lojas, começando pelo F-Droid e por releases no GitHub (para o Obtainium).
- Houve conflito entre a GPL e a App Store da Apple em 2010–2011 (VLC, GNU Go). O estado atual dos termos **não está confirmado**.
- O conteúdo do Terço vem de `garamogger/terco-diario`, publicado sob GPL-3.0. O autor é um dos responsáveis do projeto.

## Decisão

1. **Tudo é GPL:** código, configuração, documentação e **conteúdo original** do projeto (textos próprios, arte, design, fontes Typst) ficam sob `GPL-3.0-or-later`.
2. **Domínio público continua domínio público.** A GPL cobre só as contribuições originais (seleção, organização, notas, código). Textos de terceiros entram com a procedência e o status registrados (ADR-0003), anotados no `REUSE.toml`.
3. **Conformidade [REUSE 3.3](https://reuse.software):**
   - `REUSE.toml` com `precedence = "closest"`: um arquivo com licença própria, por cabeçalho SPDX ou arquivo `.license` ao lado, não herda a anotação geral;
   - textos das licenças em `LICENSES/`;
   - verificação no CI.
4. **Dependências:** só licenças da lista permitida em `scripts/check-licenses.ts`, verificada no CI.
   - **GPL-2.0-only é proibida**, por ser incompatível com a GPLv3.
   - Ampliar a lista exige justificativa registrada aqui.
5. **Contribuições:** [Developer Certificate of Origin](https://developercertificate.org/) (`git commit -s`), sem CLA.
6. **Distribuição:**
   1. Web.
   2. APKs assinados nas releases do GitHub (Obtainium).
   3. F-Droid.
   4. Demais lojas.
7. **App Store do iOS (pendente):** até existir uma permissão adicional (GPLv3, seção 7) para distribuição em lojas, **só os responsáveis contribuem código**.
   - Essa permissão deve ser redigida ou revisada por alguém qualificado.
   - Como os responsáveis são os titulares, podem concedê-la sem depender de terceiros.
   - Revisões, sugestões de conteúdo e relatos de problemas continuam abertos a todos.
8. **Impressos (Fase 3):** cada livro produzido a partir de fontes GPL traz o aviso de licença e a oferta escrita do código-fonte (GPLv3, seção 6). O texto em domínio público continua livre.

## Alternativas consideradas

| Alternativa                     | Por que não                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| GPL-3.0-only                    | Impede adotar versões futuras da GPL sem relicenciar                                            |
| AGPL-3.0                        | Obrigaria a oferecer o código a quem só usa o site; a decisão foi GPL e o repositório é público |
| CC BY-SA para conteúdo original | Proposta na rev. 1; os responsáveis preferiram uma licença única para tudo                      |
| CLA com cessão de direitos      | Cria atrito e concentra direitos; o DCO basta para registrar a origem                           |

## Consequências

- O CI falha se uma dependência trouxer licença fora da lista ou se algum arquivo ficar sem licença declarada.
- Conteúdo em domínio público precisará de uma anotação REUSE própria, sem a GPL, quando entrar (Fase 2).
- Abrir contribuições de código a terceiros exige, antes, decidir a permissão do item 7.
