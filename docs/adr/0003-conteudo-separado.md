# ADR-0003 — Conteúdo religioso separado do código, com procedência e aprovação editorial

- **Status:** Aceito em princípio (proposta aprovada em 26/11/2026). A implementação começa no M1 (Terço).
- **Data:** 26/11/2026

## Contexto

- O projeto não pode inventar meditações, passagens, atribuições de autoria nem fórmulas de oração.
- Muitos textos religiosos têm direitos autorais: traduções bíblicas, textos da LEV, edições de Montfort.
- Decisões litúrgicas e editoriais precisam ser aprovadas por um responsável editorial.
- A referência do Korvo mistura texto, lógica e apresentação num único `index.html`.

## Decisão

1. **Onde fica o conteúdo:**
   - Todo conteúdo religioso fica em `content/<módulo>/`, **só com dados e sem lógica**.
   - A interface e o domínio importam esses dados; não os redefinem.
2. **Formato no MVP:** módulos TypeScript de dados com `as const satisfies <Tipo>`.
   - Zero dependências e validação em tempo de compilação.
   - O formato será revisto quando houver editores não técnicos editando diretamente, ou na Biblioteca, que precisará de JSON/Markdown e de um pipeline de importação.
3. **Campos obrigatórios em cada item:**
   - `source`: procedência, com obra, edição, tradução e página quando houver;
   - `license`;
   - `status`: `'aprovado'` ou `'em-revisao'`.
4. **Porta editorial:**
   - O build de publicação falha se alguma página referenciar conteúdo que não esteja `'aprovado'`.
   - A aprovação é registrada no PR pelo responsável editorial.
5. **Fixtures de teste:**
   - São marcadas como tais, por exemplo `[texto de teste]`.
   - Ficam junto aos testes e nunca são publicadas.
   - Nunca imitam orações reais.
6. **Procedência e licenças:**
   - Cada pasta de conteúdo tem um `SOURCES.md` com a procedência detalhada.
   - Tem também anotação própria no `REUSE.toml`.
7. **Proibido:** conteúdo gerado automaticamente (inclusive por IA) e trechos atribuídos sem fonte verificável.

## Consequências

- A lógica (domínio do Terço, Exame) pode ser desenvolvida e testada antes da aprovação do conteúdo.
- A publicação de cada módulo depende das pendências editoriais (`docs/editorial/pendencias.md`).
- Trocar de edição ou tradução vira uma mudança só de dados, revisável em PR.
