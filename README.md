# Catoolicas

Plataforma católica livre: ferramentas para a oração, o exame de consciência, o estudo e a vida de fé.

- Sem cadastro e sem rastreamento.
- Conteúdo com procedência verificável.
- "Catoolicas" é o nome de trabalho.

> **Status:** em desenvolvimento. Esta versão contém apenas a fundação técnica (CHG-0001). As ferramentas ainda não estão disponíveis.

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

- [Proposta de arquitetura e roadmap](docs/proposta-arquitetura.md)
- [Decisões arquiteturais (ADRs)](docs/adr/)
- [Changes](docs/changes/)
- [Pendências editoriais](docs/editorial/pendencias.md)
- [Orçamentos de desempenho](docs/budgets.md)
- [Como contribuir](CONTRIBUTING.md)

## Referências

- [Terço Diário](https://github.com/garamogger/terco-diario), do Korvo (GPL-3.0). É a referência do módulo do Terço. Nenhum código ou texto dele foi incorporado até agora; isso depende das decisões registradas em `docs/editorial/pendencias.md`.

## Licença

- Código, configuração e documentação: [GNU GPL, versão 3 ou posterior](LICENSE) (`GPL-3.0-or-later`).
- Conteúdos de terceiros mantêm as licenças das suas fontes, declaradas no padrão [REUSE](https://reuse.software) (`REUSE.toml`).
