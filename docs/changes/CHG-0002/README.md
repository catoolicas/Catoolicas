# Ferramentas da importação do Terço (CHG-0002)

Registro de **como** o conteúdo de `content/terco/` foi gerado. Estas ferramentas não fazem parte do app nem do CI, e o parser `acorn` não é dependência do projeto.

| Arquivo              | Função                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `extrair.cjs`        | Lê o `index.html` do `terco-diario` e converte as constantes do script em JSON, **sem executar o arquivo** (análise estática com `acorn`). |
| `gerar-terco.cjs`    | Gera `content/terco/*.ts` a partir desse JSON.                                                                                             |
| `conferir-terco.mjs` | Confere, string a string, o conteúdo gerado contra a origem.                                                                               |

Para reproduzir, rode cada comando numa pasta temporária fora do repositório. Primeiro, instale o parser:

```bash
npm install acorn@8
```

Baixe o repositório de origem:

```bash
git clone https://github.com/garamogger/terco-diario
```

Fixe o commit importado:

```bash
git -C terco-diario checkout e4cbfd689666d10ee4c2fc59fbe37dc815fb733b
```

Copie as três ferramentas para a pasta temporária. Extraia os dados:

```bash
node extrair.cjs terco-diario/index.html korvo.json
```

Gere o conteúdo:

```bash
node gerar-terco.cjs korvo.json <repo>/content/terco
```

Formate o resultado:

```bash
pnpm --dir <repo> exec prettier --write content/terco
```

Confira contra a origem:

```bash
node conferir-terco.mjs korvo.json <repo>
```

Resultado em 26/11/2026: **785 conferências, 0 divergências**.

> Desde a importação, `content/terco/` é a fonte única. Regenerar sobrescreveria correções feitas depois. Use estas ferramentas só para auditoria ou para comparar com uma nova versão da origem.
