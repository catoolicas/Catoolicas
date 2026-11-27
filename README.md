# Catoolicas

Plataforma católica livre: ferramentas para a oração, o exame de consciência, o estudo e a vida de fé.

- Sem cadastro e sem rastreamento.
- Conteúdo com procedência verificável.
- "Catoolicas" é o nome de trabalho.

> **Status:** em desenvolvimento, publicado em https://catoolicas.github.io/Catoolicas/. O Terço (CHG-0004a) e o Exame de consciência (CHG-0005, CHG-0006 e CHG-0008) já funcionam. Funcionam também sem internet depois da primeira visita (CHG-0007b). Da identidade visual (CHG-0004b), falta só o logo.

## Fases

| Fase              | Conteúdo                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| **MVP**           | Terço (a partir do Terço Diário do Korvo, em português e latim) e Exame de consciência, os dois sem servidor        |
| Trilha Android    | App via Tauri 2: releases no GitHub (Obtainium), depois F-Droid e demais lojas                                      |
| Fase 2 — Estudo   | Leitura e comparação de documentos da Igreja e de santos nas edições comprovadamente livres; sinopse dos Evangelhos |
| Fase 3 — Loja     | Missais e breviários acessíveis (edições próprias em Typst); depois, artigos de outros vendedores                   |
| Fase 4 — Conexões | Pedidos de oração, novenas e outras ideias                                                                          |

Detalhes em [`docs/proposta-revisao-2.md`](docs/proposta-revisao-2.md).

**Responsáveis pelo projeto e pelo conteúdo:** [`garamogger`](https://github.com/garamogger) (Korvo) e [`williamdasilvazoia8-blip`](https://github.com/williamdasilvazoia8-blip).

## Princípios

- **Estático primeiro:** o site é pré-renderizado e pode ser hospedado em qualquer serviço estático, o que também o prepara para o futuro app em Tauri 2 (`docs/adr/0002-estatico-primeiro.md`).
- **Privacidade por padrão:**
  - sem cookies, sem analytics, sem recursos de terceiros;
  - o Exame de consciência nunca sai do aparelho.
- **Conteúdo separado do código:**
  - orações e documentos têm procedência e licença registradas;
  - só são publicados com aprovação editorial (`docs/adr/0003-conteudo-separado.md`);
  - nada é inventado nem gerado por IA.
- **Leve e acessível:**
  - orçamentos de desempenho verificados no CI;
  - meta WCAG 2.2 AA, com testes automáticos de acessibilidade.

## Tecnologias

SvelteKit 3 · Svelte 5 (runes) · TypeScript (strict) · Vite 8 · pnpm 12 · Vitest · Playwright + axe-core.

## Como rodar

Requisitos:

- Node.js ≥ 22.18 (o CI usa a versão de `.node-version`);
- pnpm na versão do campo `packageManager`.

Instale as dependências:

```bash
pnpm install
```

Rode em modo de desenvolvimento:

```bash
pnpm dev
```

Rode a verificação completa (tipos, lint, unitários, build, orçamento, licenças, E2E). Os testes E2E exigem os navegadores do Playwright, instalados com `pnpm exec playwright install`:

```bash
pnpm verify
```

## Publicação

O site é publicado no GitHub Pages pelo workflow `.github/workflows/pages.yml`. Ele só publica depois de passar por:

- todo o CI;
- os testes E2E contra o próprio artefato a publicar.

Para publicar:

1. **Uma vez:** em _Settings → Pages_, escolha _Source: GitHub Actions_.
2. Faça push ou merge em `main`, ou rode o workflow em _Actions → Publicar no GitHub Pages → Run workflow_.

Detalhes em [`docs/changes/CHG-0007-publicacao.md`](docs/changes/CHG-0007-publicacao.md).

## Estrutura

| Caminho            | Conteúdo                                                                             |
| ------------------ | ------------------------------------------------------------------------------------ |
| `src/routes/`      | Rotas e layouts (todas pré-renderizadas)                                             |
| `src/lib/modules/` | Módulos por funcionalidade (`domain/` em TS puro, `state/` e `ui/`). A partir do M1. |
| `content/`         | Somente dados religiosos e editoriais, com procedência. A partir do M1.              |
| `scripts/`         | Verificações de orçamento e de licenças, sem dependências                            |
| `tests/e2e/`       | Testes de ponta a ponta contra o build de produção                                   |
| `docs/`            | Proposta de arquitetura, ADRs, changes, pendências editoriais e orçamentos           |

## Documentação

- [Proposta revisada (rev. 2): fases e MVP](docs/proposta-revisao-2.md)
- [Proposta de arquitetura (rev. 1)](docs/proposta-arquitetura.md)
- [Decisões arquiteturais (ADRs)](docs/adr/)
- [Changes](docs/changes/)
- [Pendências editoriais](docs/editorial/pendencias.md)
- [Orçamentos de desempenho](docs/budgets.md)
- [Como contribuir](CONTRIBUTING.md)

## Referências

- [Terço Diário](https://github.com/garamogger/terco-diario), do Korvo (GPL-3.0). É a base do módulo do Terço: o conteúdo será importado com procedência registrada (CHG-0002).

## Licença

- Código, documentação e conteúdo original: [GNU GPL, versão 3 ou posterior](LICENSE) (`GPL-3.0-or-later`).
- Textos em domínio público continuam em domínio público.
- Procedência e licença de cada arquivo declaradas no padrão [REUSE](https://reuse.software) (`REUSE.toml`).
