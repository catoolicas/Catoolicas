# ADR-0003 — Conteúdo religioso separado do código, com procedência e aprovação editorial

- **Status:** Aceito. Emendado em 26/11/2026: base do Korvo aprovada e rascunho assistido para itens do Exame.
- **Data:** 26/11/2026
- **Responsáveis editoriais:** `garamogger` (Korvo) e `williamdasilvazoia8-blip`

## Contexto

- O projeto não pode inventar meditações, passagens, atribuições de autoria nem fórmulas de oração.
- Muitos textos religiosos têm direitos autorais: traduções bíblicas, textos da LEV, edições modernas.
- Decisões litúrgicas e editoriais cabem aos responsáveis.
- O conteúdo do Terço e o exame simples vêm do `terco-diario`. O autor é um dos responsáveis e declarou autorização explícita para todo o material que usou.
- Os três PDFs de exame de consciência recebidos não podem ser reproduzidos:
  - um é "© Santa Cruz Editora 2020, todos os direitos reservados";
  - os outros dois não têm licença e, portanto, têm direitos reservados por padrão (Lei 9.610/98).

## Decisão

1. **Onde fica o conteúdo:**
   - Todo conteúdo religioso fica em `content/<módulo>/`, **só com dados e sem lógica**.
   - A interface e o domínio importam esses dados; não os redefinem.
2. **Formato no MVP:** módulos TypeScript de dados com `as const satisfies <Tipo>`.
   - Zero dependências e validação em tempo de compilação.
   - O formato será revisto na Fase 2, quando a Biblioteca precisar de pipeline de importação.
3. **Campos obrigatórios em cada item:**
   - `source`: procedência;
   - `status`: `'aprovado'` ou `'em-revisao'`.
   - Itens não originais do projeto também têm `license`.
4. **Porta editorial:**
   - O build de publicação falha se alguma página referenciar conteúdo que não esteja `'aprovado'`.
   - A aprovação é registrada no PR por um dos responsáveis.
5. **Base aprovada:** o conteúdo importado do `terco-diario` (commit `e4cbfd6`) entra como `'aprovado'`, porque o autor é responsável pelo conteúdo. As **mudanças** sobre essa base passam pela aprovação normal.
6. **Rascunho assistido, só para itens do Exame de consciência:**
   - Itens novos (perguntas, frases de acusação, notas pastorais) podem ser **rascunhados pelo assistente de IA**.
   - Os rascunhos partem de uma matriz de **tópicos**, nunca de frases dos PDFs, e usam redação própria.
   - Entram com `status: 'em-revisao'` e `origem: 'rascunho-assistido'`.
   - A marcação de gravidade é uma proposta.
   - **Só são publicados após aprovação item a item** por um dos responsáveis.
7. **Continua proibido gerar ou redigir automaticamente:**
   - orações, atos de contrição e fórmulas;
   - meditações;
   - passagens bíblicas ou de documentos;
   - citações e atribuições de autoria.
   - Esses textos vêm só de fontes com procedência registrada.
8. **Fixtures de teste:** são marcadas como tais (`[texto de teste]`), não imitam orações reais e nunca são publicadas.
9. **Procedência:** cada pasta de conteúdo tem um `SOURCES.md` e anotação própria no `REUSE.toml`.

## Consequências

- A lógica (domínio do Terço, Exame) pode ser desenvolvida e testada antes da aprovação do conteúdo novo.
- O Exame pode crescer além da base do Korvo sem copiar fontes protegidas. O custo é a revisão humana de cada item.
- Trocar de edição ou tradução vira uma mudança só de dados, revisável em PR.
