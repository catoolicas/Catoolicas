# Como contribuir

Obrigado pelo interesse. Este é um projeto comunitário de longo prazo. O processo é leve, mas tem regras claras para proteger:

- a qualidade;
- a privacidade dos usuários;
- a fidelidade do conteúdo religioso.

## O que é bem-vindo agora

- **Relatos de problemas e sugestões:** abra uma _issue_.
- **Revisão de conteúdo:** apontar erros em orações, referências e procedências.
- **Revisão de acessibilidade e usabilidade.**
- **Contribuições de código:** temporariamente **restritas aos mantenedores**.
  - O motivo é preservar a decisão sobre distribuição em lojas de aplicativos (`docs/adr/0001-licenciamento.md`, item 7).
  - Essa restrição será revista assim que a decisão for tomada.

## Fluxo de trabalho

1. **Proposta:** mudanças relevantes começam como uma _change_ em `docs/changes/CHG-XXXX-nome.md`. A change registra:
   - o problema;
   - o escopo e o que fica fora dele;
   - tarefas verificáveis e critérios de aceitação;
   - os riscos.
2. **Decisões duradouras** viram um ADR curto em `docs/adr/`.
3. **Implementação** em incrementos pequenos: uma change por PR, sem alterar áreas não relacionadas.
4. **Verificação:** `pnpm verify` precisa passar, e o CI repete tudo a partir de um checkout limpo.
5. **Revisão independente** antes do merge.
6. **Registro do resultado:** a change documenta o que foi medido, o que ficou pendente e o que foi apenas simulado.

## Conteúdo religioso

- **Nunca** invente orações, meditações, passagens ou atribuições de autoria. Não use texto gerado por IA.
- Todo texto precisa de procedência (obra, edição, tradução) e de licença ou permissão verificada (`docs/adr/0003-conteudo-separado.md`).
- Conteúdo só é publicado com aprovação do responsável editorial (`docs/editorial/pendencias.md`).

## Privacidade

- Nada de analytics, rastreadores, cookies ou recursos de terceiros (fontes, scripts, imagens).
- O Exame de consciência nunca transmite nem persiste dados. Qualquer mudança nele precisa manter a suíte de privacidade verde.

## Origem das contribuições (DCO)

Usamos o [Developer Certificate of Origin](https://developercertificate.org/):

- Ao contribuir, você declara ter o direito de enviar o trabalho sob a licença do projeto.
- Assine cada commit com `git commit -s`, que acrescenta a linha `Signed-off-by`.

## Ambiente

- Node.js ≥ 22.18 (o CI usa a versão de `.node-version`).
- pnpm na versão do campo `packageManager` do `package.json`.

```bash
pnpm install
```

```bash
pnpm exec playwright install
```

```bash
pnpm verify
```
