# ADR-0001 — Licenciamento e contribuições

- **Status:** Proposto. Os itens 1, 6 e 7 dependem das respostas às perguntas Q1 e Q2 da proposta. Até lá, valem as opções recomendadas.
- **Data:** 26/11/2026

## Contexto

- **Licença exigida [REQ]:** o código deve ser livre, sob GPL-3.0.
- **Conteúdo de terceiros:** o repositório vai conter também orações, meditações, documentos e imagens. Muitos desses textos têm direitos próprios, como traduções e textos da LEV.
- **Distribuição futura:** a versão mobile via Tauri 2 pode passar por lojas de aplicativos.
- **Histórico com a App Store:** houve conflito entre a GPL e a App Store da Apple (VLC e GNU Go, 2010–2011). O estado atual dos termos **não está confirmado**.
- **Referência do Terço:** o código do Korvo (`garamogger/terco-diario`) é GPL-3.0, mas não diz "only" nem "or later".

## Decisão

1. **Código, configuração e documentação:** `GPL-3.0-or-later`. É a forma recomendada pela FSF e evita relicenciamento futuro.
2. **Conteúdo original que não é código** (textos editoriais próprios, arte, design): `CC-BY-SA-4.0`.
   - Essa licença é unidirecionalmente compatível com a GPLv3.
   - Passa a valer quando surgir o primeiro conteúdo desse tipo.
3. **Conteúdo de terceiros:** fica com a licença da fonte, registrada junto com a procedência (ADR-0003).
   - Nunca entra sem licença ou permissão verificada.
   - Conteúdo restrito cifrado não é publicado.
4. **Conformidade [REUSE 3.3](https://reuse.software):** `REUSE.toml` na raiz, textos das licenças em `LICENSES/`, verificação no CI (`reuse lint`).
5. **Dependências:** só licenças da lista permitida em `scripts/check-licenses.ts`, verificada no CI.
   - **GPL-2.0-only é proibida**, por ser incompatível com a GPLv3.
   - Ampliar a lista exige justificativa registrada aqui.
6. **Contribuições:** [Developer Certificate of Origin](https://developercertificate.org/) (`git commit -s`), sem CLA.
7. **Lojas de aplicativos (pendente, Q2):** até a decisão, **só os mantenedores contribuem código**.
   - O código do Korvo também pode entrar, se ele concordar explicitamente.
   - Isso preserva a possibilidade de adotar uma permissão adicional (GPLv3, seção 7) para distribuição em lojas. Essa permissão deve ser redigida ou revisada por alguém qualificado.
   - Revisões, conteúdo editorial e relatos de problemas continuam abertos a todos.

## Alternativas consideradas

| Alternativa                                    | Por que não (por ora)                                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| GPL-3.0-only                                   | Impede adotar versões futuras da GPL sem relicenciar                                               |
| AGPL-3.0                                       | Obrigaria a oferecer o código a quem só usa o site; o requisito é GPL e o repositório já é público |
| CLA com cessão de direitos                     | Cria atrito para contribuidores e concentra direitos; o DCO basta para registrar a origem          |
| Tudo sob GPL, inclusive arte e textos próprios | A GPL é pensada para software; a CC BY-SA é mais adequada para texto e imagem                      |

## Consequências

- O CI falha se uma dependência trouxer licença fora da lista ou se algum arquivo ficar sem licença declarada.
- Portar código do Korvo exige pedir que ele declare explicitamente "GPL-3.0-or-later" e que concorde com a política do item 7.
- Adotar depois a permissão para lojas exige o consentimento de todos os titulares de código. Por isso o item 7 restringe as contribuições até a decisão.

## Pendências

- **Q1:** confirmar `GPL-3.0-or-later`, `CC-BY-SA-4.0` e DCO.
- **Q2:** decidir se a App Store do iOS é objetivo e, se for, providenciar o texto da permissão adicional.
