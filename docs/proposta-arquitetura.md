# Proposta de arquitetura e execução — Plataforma Católica FOSS (nome de trabalho: Catoolicas)

> **Rev. 1 — histórica.** As fases, o roadmap e as perguntas foram substituídos pela [rev. 2](proposta-revisao-2.md); a arquitetura técnica continua válida, salvo onde a rev. 2 diz o contrário. Proposta aprovada em 26/11/2026. Decisões ainda pendentes estão na seção 12 e em `docs/editorial/pendencias.md`. Correção posterior à aprovação: o Korvo cadastra **9** jaculatórias, não ~40 (ver CHG-0001).

## Contexto

**O que foi investigado (fatos medidos — [MED])**

- `catoolicas/Catoolicas`: repositório **vazio**. A branch `claude/quirky-lovelace-1cp3q1` não tem commits e o remoto não tem refs. Projeto **greenfield**.
- Referência do Korvo, `github.com/garamogger/terco-diario` (commit `e4cbfd6`, de 28/10/2026), clonada só para leitura fora do projeto:
  - Licença: **GPL-3.0** (texto integral em `LICENSE`). O código não traz aviso "only" nem "or later".
  - Um único `index.html` de **1.157.413 bytes** (604.185 bytes com gzip -9), com JS inline, publicado no GitHub Pages.
  - Composição do arquivo:
    - ~210 KB de PNG em base64: é só o logo do corvo, com 3 máscaras **duplicadas** (prefixo `-webkit-`).
    - ~387 KB de um **"exame completo" cifrado** (AES-GCM, chave por PBKDF2, aberto com senha), em PT e EN.
    - ~283 KB de traduções EN/LA (`TRAD_DADOS`).
    - Google Fonts (Cormorant Garamond) carregado de terceiros.
    - `<html>` sem `lang`.
  - O escopo vai bem além do Terço:
    - Via Sacra, Seleta de orações e "Outros terços", incluindo um grupo "com ressalva" (devoções sem aprovação oficial).
    - Ladainha, santos de devoção e orações próprias do usuário.
    - Exame simples (sem senha, sem persistência) e esquemas de dias "2002" e "Montfort".
    - Configuração da abertura, das orações finais e das jaculatórias.
    - Intenções particulares salvas em `localStorage`.
  - Atalhos atuais: `→`/`Espaço`/`j` avançam, `←`/`k` voltam, `↑↓` mudam de dezena, `Esc` volta ao menu.
  - Procedência declarada no rodapé: _"Textos conforme o livreto 'O Santo Rosário Meditado' — método de São Luís Maria Grignion de Montfort. Perícopes evangélicas segundo a tradução dos livretos de origem."_
  - Os mistérios luminosos já trazem um aviso: não fazem parte do método de dez pontos de Montfort. Em vez de inventar pontos, usam uma frase-guia, hoje chamada "método abreviado".

**Estado das tecnologias, verificado em fontes oficiais (nov/2026)**

| Tecnologia                      | Estado atual                                                                                       | Impacto no projeto                                                                                                                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SvelteKit                       | **3.0**, lançado em 01/10/2026. Exige Node ≥ 22.17, TypeScript 6, Svelte ≥ 5.57.1 e Vite ≥ 8.0.12. | Config passa para o plugin `sveltekit()` no `vite.config` (`svelte.config.js` não é mais suportado). `$lib` vira `#lib` e `$app/stores` foi removido (usar `$app/state`). O service worker ganhou módulos novos. |
| Remote functions / async Svelte | **Experimentais**                                                                                  | Não usar no MVP                                                                                                                                                                                                  |
| Vite                            | 8 (Rolldown), estável desde mar/2026                                                               | Padrão do SvelteKit 3                                                                                                                                                                                            |
| pnpm                            | **12** é a linha atual, um executável nativo                                                       | Fixar no campo `packageManager`                                                                                                                                                                                  |
| Node.js                         | v26 é o LTS mais recente (26.13.1). v24 e v22 também são LTS.                                      | Node 26 no dev/CI. É só ferramenta de build: a saída é estática.                                                                                                                                                 |
| Tauri                           | 2.12.x (crate 2.12.7, de 18/11/2026)                                                               | O guia oficial de SvelteKit pede SPA (`fallback` + `ssr = false`), mas está fixado no SvelteKit 2.20/Svelte 5.25, então está **desatualizado** frente ao SvelteKit 3.                                            |

**Legenda usada no documento**

| Marcador  | Significado                                        |
| --------- | -------------------------------------------------- |
| **[REQ]** | Requisito confirmado por você                      |
| **[REC]** | Recomendação técnica                               |
| **[HIP]** | Hipótese ainda não validada                        |
| **[DEC]** | Decisão pendente (sua ou do responsável editorial) |
| **[FUT]** | Funcionalidade futura                              |
| **[MED]** | Fato medido ou verificado nesta investigação       |

---

## 1. Visão consolidada do produto

**Missão.** Oferecer ferramentas livres, leves e fiéis para a oração, o exame de consciência, o estudo e a vida católica:

- sem rastreamento;
- sem exigir conta;
- com conteúdo de procedência verificável.

**Público-alvo**

| Público                 | Necessidade principal                                        | Módulos                 |
| ----------------------- | ------------------------------------------------------------ | ----------------------- |
| Fiéis                   | Rezar todos os dias, inclusive offline e em aparelho modesto | Terço, Novenário, Exame |
| Catequistas             | Material confiável, exame interativo, documentos citáveis    | Exame, Biblioteca       |
| Religiosos e estudiosos | Pesquisa determinística, comparação, referências exatas      | Biblioteca, Sinopse     |
| Artistas e artesãos     | Expor o trabalho a um público afim                           | Vitrine                 |

**Proposta de valor**

1. **Ferramenta dedicada em vez de chat.**
   - Navegação por contas e leitura confortável.
   - Pesquisa com referência exata.
   - Funciona sem conta.
2. **Privacidade como característica do produto.** Exemplo: o exame nunca sai do aparelho.
3. **Conteúdo curado, com procedência e aprovação editorial.** Nada gerado por IA nem inventado.
4. **Longevidade.**
   - Saída estática, barata de hospedar.
   - Código GPL, fácil de auditar e de bifurcar.

**Relação com o Telegram** [REC]: o Telegram continua sendo o **canal da comunidade** (avisos, conversa, alcance, bots). A plataforma é a **ferramenta** (rezar, examinar, estudar, consultar).

| Hoje no Telegram              | Na plataforma                                                                     | Integração proposta                                              |
| ----------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Novenários (bot)              | Catálogo, leitura por dia, acompanhamento local                                   | Deep link `t.me/<bot>?start=<novena>` para "receber no Telegram" |
| Pedidos de oração (bot/canal) | Fase 1: redirecionamento. Fase 2: exibir intenções **já públicas e consentidas**. | Export somente leitura vindo do bot. Sem dupla moderação.        |
| Biblioteca (canal)            | Biblioteca pesquisável com referências estáveis                                   | Links do canal apontando para âncoras estáveis                   |

- [FUT] Rodar a plataforma como _Telegram Mini App_. Exige carregar o script do Telegram, o que precisa de revisão de privacidade antes de qualquer adoção.

---

## 2. Análise crítica dos requisitos

### 2.1 O que está claro [REQ]

- Stack: SvelteKit + Svelte 5 + TS strict + Vite + pnpm. Web primeiro, Tauri 2 depois.
- Exame com **zero transmissão e zero persistência**.
- Sem autenticação onde não for necessária.
- GPL-3.0.
- Conteúdo religioso separado da lógica e nunca inventado.
- Marketplace começa como vitrine simples, sem pagamentos.

### 2.2 Riscos, inconsistências e oportunidades

| #      | Tema                                                | Análise                                                                                                                                                                                                                                                                                                                                                                                 | Tipo        |
| ------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| R1     | **Direitos do conteúdo** (o maior risco do projeto) | A GPL cobre o **código**, não os textos de terceiros. Precisam de verificação: traduções bíblicas, textos do Magistério (a LEV declara direitos sobre textos pontifícios e da Cúria), traduções de Montfort, o livreto-fonte do Korvo, os PDFs de novenas e do exame e fotos de arte sacra. O código do Korvo ser GPL **não** prova que os textos possam ser redistribuídos.            | [DEC]       |
| R2     | GPL-3.0 × App Store (iOS)                           | Há histórico de conflito: a FSF afirmou incompatibilidade, e VLC e GNU Go saíram da App Store em 2010–2011. Os termos da Apple mudaram desde então, e o estado atual **não está confirmado**. O ponto prático: uma permissão adicional (GPLv3 §7) só é fácil de adotar **antes** de existirem contribuições de terceiros. Se portarmos código do Korvo, ele também passa a ser titular. | [DEC]       |
| R3     | GPL e serviço web                                   | A GPL não obriga a oferecer o código a quem só usa o site (a AGPL obrigaria). Como o repositório é público, o efeito prático é pequeno. Fica só o registro, já que a licença é requisito.                                                                                                                                                                                               | Informativo |
| R4     | LGPD                                                | "Convicção religiosa" e "saúde" são **dados pessoais sensíveis** (Lei 13.709/2018, art. 5º, II; tratamento no art. 11). Pedidos de oração com nome ou doença, contas de usuário numa plataforma católica e listas de e-mail viram dados sensíveis. Esse é um forte argumento para **não coletar nada no MVP**.                                                                          | [REC]       |
| R5     | Notificações                                        | Push na web exige servidor e chaves VAPID. No iOS, só funciona com o app instalado na tela inicial. Não há API web padrão para agendar notificação local sem servidor. **Alternativa sem infraestrutura:** gerar um arquivo `.ics` (9 eventos com alarme) no próprio navegador.                                                                                                         | [HIP]       |
| R6     | Exame: limites da garantia                          | O app controla rede, armazenamento e CSP. Não controla extensões, "imprimir para PDF", restauração de sessão do navegador, revisor ortográfico em nuvem (Chrome "Verificação ortográfica avançada", Edge Editor) nem tradução automática da página. Esses riscos precisam ser **mitigados e comunicados**, não negados.                                                                 | [REC]       |
| R7     | Atalhos Vim × acessibilidade                        | WCAG 2.2, SC 2.1.4 (nível A): atalhos de **uma tecla** precisam poder ser desligados, remapeados ou valer só com foco. Leitores de tela usam `h`, `j`, `k` no modo de navegação. Recomendação: Vim **opcional**, com alternância.                                                                                                                                                       | [REC]       |
| R8     | "Avanço automático" é ambíguo                       | Hipótese: ao fim da 10ª Ave-Maria e do Glória, o próximo comando já leva à dezena seguinte, sem trocar de tela. **Não** é um avanço por cronômetro.                                                                                                                                                                                                                                     | [HIP]       |
| R9     | "Terço do dia" em página pré-renderizada            | O HTML é gerado no build e não sabe a data do visitante. O mistério do dia e a perícope do dia são resolvidos **no cliente**. As páginas estáticas por série (`/terco/gozosos`) servem para SEO e primeira pintura.                                                                                                                                                                     | [REC]       |
| R10    | Escopo do Korvo maior que o pedido                  | Via Sacra, Seleta, Outros terços (incluindo "com ressalva"), orações próprias e traduções EN/LA de procedência desconhecida. Precisa de decisão de escopo e de decisão doutrinal sobre as devoções "com ressalva".                                                                                                                                                                      | [DEC]       |
| R11    | Exame "completo" cifrado no Korvo                   | Indica restrição de distribuição: direitos ou opção pastoral. Publicar texto cifrado num repositório GPL público com a senha circulando é ambíguo jurídica e eticamente. **Não reproduzir** sem esclarecer.                                                                                                                                                                             | [DEC]       |
| R12    | Comissão no marketplace                             | Cobrar comissão implica **intermediar o pagamento**, com obrigações de consumidor, fiscais, de estorno e de identificação do vendedor (KYC). A vitrine com contato externo evita tudo isso no início.                                                                                                                                                                                   | [REC]       |
| R13    | Sinopse                                             | O alinhamento por perícopes é **dado editorial**. Os Cânones de Eusébio (séc. IV) estão em domínio público. Sinopses modernas podem ter direitos sobre a compilação. Exige decisão editorial e jurídica.                                                                                                                                                                                | [DEC]       |
| R14    | Tauri × "extremamente leve"                         | O Tauri é leve, mas o app mobile acrescenta toolchain Rust e publicação em lojas. Um PWA pode cobrir boa parte do uso mobile. Avaliar com dados na fase mobile, sem antecipar.                                                                                                                                                                                                          | [HIP]       |
| **O1** | Oportunidade                                        | **Estático primeiro** atende ao mesmo tempo: hospedagem gratuita, offline, SEO e a exigência do Tauri (só SSG/SPA).                                                                                                                                                                                                                                                                     | [REC]       |
| **O2** | Oportunidade                                        | O Korvo já resolveu muitas regras de domínio (esquemas de dias, abertura e finais configuráveis, aviso dos luminosos). Dá para portar as **regras** para TS testável e cortar ~95% do peso.                                                                                                                                                                                             | [REC]       |

### 2.3 Decisões editoriais e litúrgicas que exigem aprovação [DEC]

Estas não são perguntas de arquitetura. Vão para `docs/editorial/pendencias.md`, cada uma com o padrão atual do Korvo e uma recomendação, para o responsável editorial aprovar.

- **E1. Esquema de mistérios por dia.** Opções: "2002" (_Rosarium Virginis Mariae_; o padrão do Korvo) ou "Montfort/tradicional". Também: se há variações por tempo litúrgico (Advento, Quaresma).
- **E2. "Rosário inteiro".** 15 ou 20 mistérios; ordem; se as orações iniciais se repetem a cada terço.
- **E3. Orações iniciais e finais padrão.** No Korvo: oferecimento de Montfort, Credo, Salve Rainha, coleta e outras.
- **E4. Jaculatórias ao fim das dezenas.** No Korvo: Glória + Fátima por padrão. Revisar a lista completa (9 itens).
- **E5. Versão textual das orações comuns.** Fórmula tradicional ou tradução litúrgica vigente.
- **E6. Rosário das cláusulas.**
  - Renomear "método abreviado" para **"rosário das cláusulas"**.
  - Texto de cada cláusula.
  - **Autoria das cláusulas dos luminosos.** Montfort morreu em 1716, então elas não são dele.
  - Uso nos luminosos.
- **E7. Perícopes.**
  - Conjunto curado de passagens por mistério, para a alternância diária.
  - Tradução bíblica usada (direitos).
  - Regra de rotação, por exemplo: dias desde uma data fixa, módulo N.
- **E8.** Frutos dos mistérios.
- **E9.** Edição e tradução dos pontos de meditação de Montfort.
- **E10.** Imagens sacras: seleção, legendas e textos alternativos.
- **E11.** Ladainha: incluir ou não; qual forma (o Korvo usa as invocações recentes).
- **E12. Exame.**
  - Marcação "pode ser matéria grave".
  - Linguagem.
  - Estados de vida e vocação.
  - Atos de contrição e suas fontes.
  - Avisos pastorais: "não substitui a confissão".
- **E13.** Devoções "com ressalva": incluir ou não.
- **E14.** Mostrar "sequências" ou gamificação de oração. **Recomendação: não.**

---

## 3. Arquitetura proposta

### 3.1 Visão geral (estático primeiro)

```
content/  ── dados religiosos/editoriais versionados (procedência, licença, status editorial)
   │  importados e validados no build
   ▼
src/lib/modules/<módulo>/domain   TS puro: sem Svelte, sem DOM  ◄── testes unitários (Vitest)
   ▼
src/lib/modules/<módulo>/{state,ui}  classes reativas (.svelte.ts) + componentes Svelte 5
   ▼
src/routes  (rotas, layouts por "tipo de página")  ── vite build + adapter-static (prerender)
   ▼
build/  HTML + CSS + JS estáticos ──► hospedagem estática (web)
                                 └──► [FUT] frontendDist do Tauri 2
[FUT, fase 3] API pequena e separada (pedidos com moderação, vitrine dinâmica) — só quando validada
```

### 3.2 SvelteKit 3 e Svelte 5 [REC]

- **SvelteKit 3**, configurado no plugin `sveltekit()` do `vite.config.ts`.
  - `@sveltejs/adapter-static` com `strict: true`: o build falha se alguma rota não for pré-renderizável.
  - `prerender = true` no layout raiz.
- **Só `load` universais** (`+page.ts`/`+layout.ts`) no MVP.
  - **Proibido `+page.server.ts`** nas rotas do núcleo.
  - Isso garante pré-renderização e compatibilidade com Tauri.
- **Fora do MVP:** remote functions e async Svelte (experimentais), e `$app/stores` (removido). Usar `$app/state`.
- **Convenções do Svelte 5:**
  - Runes: `$state`, `$derived`, `$props`. `$effect` só para efeitos colaterais de DOM ou de API do navegador.
  - Snippets no lugar de slots e atributos de evento (`onclick`).
  - Estado compartilhado em classes `.svelte.ts` com campos `$state`, passadas por **contexto** e não como singletons de módulo. Isso evita estado vazando entre páginas e é essencial no exame.
- **CSS:** puro, com custom properties (tokens) e estilos escopados do Svelte. **Sem Tailwind e sem biblioteca de componentes.** O design é tipográfico, tokens bastam e assim evitamos uma toolchain extra.

**Renderização por rota** [REC]:

| Rota                                             | prerender          | ssr | csr                       | Motivo                                                                         |
| ------------------------------------------------ | ------------------ | --- | ------------------------- | ------------------------------------------------------------------------------ |
| `/` e `/sobre` (privacidade, licenças, créditos) | sim                | sim | mínimo, medir `csr=false` | Leve, SEO                                                                      |
| `/terco`, que resolve "hoje" no cliente          | sim (casca)        | sim | sim                       | Data do visitante (R9)                                                         |
| `/terco/[serie]`                                 | sim, para 4 séries | sim | sim                       | SEO e primeira pintura. Conteúdo de cada série em chunk carregado sob demanda. |
| `/exame`                                         | sim                | sim | sim                       | Entrada e saída com recarga completa e CSP mais restrita (§3.5)                |
| `/novenas`, `/novenas/[slug]`                    | sim                | sim | parcial                   | Catálogo estático                                                              |
| `/biblioteca/[obra]/[ref]` [FUT]                 | sim                | sim | **não**                   | Leitura com zero JS, SEO                                                       |
| `/biblioteca/busca`, `/comparar` [FUT]           | sim (casca)        | sim | sim                       | Interativas                                                                    |
| `/vitrine/...` [FUT]                             | sim                | sim | não                       | Páginas de conteúdo                                                            |

### 3.3 Organização dos módulos e do domínio

- Cada módulo tem três camadas:
  - **`domain/`**: funções puras, 100% testáveis.
  - **`state/`**: classe reativa fina que envolve o domínio.
  - **`ui/`**: componentes.
- O conteúdo fica em `content/<módulo>/`, **somente dados**.

Esboço do domínio do Terço [REC]:

```ts
type Step =
  | { kind: 'prayer'; prayerId: string; decade?: number; bead?: number; clause?: string; point?: string }
  | { kind: 'announce'; mysteryId: string; pericopeId: string };

buildSequence(config: RosaryConfig, content: RosaryContent): Step[]   // abertura → 5 (ou 15/20) dezenas → finais
next(cursor) / prev(cursor) / jumpToDecade(cursor, n) / jumpToStart / jumpToEnd
mysterySetFor(localDate, schedule): MysterySet            // esquemas E1
pericopeFor(localDate, mystery): Pericope                 // determinística; só passagens cadastradas (E7)
resolveKey(event, { vimEnabled }): Command | null         // mapa de teclas puro e testável
```

- O "avanço automático" sai naturalmente da sequência linear (R8).
- Os toggles (meditações de Montfort, cláusulas, texto completo) só mudam a **sequência gerada** ou a **apresentação**. Não há lógica espalhada pela UI.
- **Generalização justificada:** o Korvo já tem três tipos de sequência (rosário, Via Sacra, outros terços). Modelar como "sequência de passos" serve a requisitos reais, não especulativos. Ainda assim, o MVP implementa **só o Terço/Rosário**.

### 3.4 Dados e persistência — precisa de banco no MVP? **Não.** [REC]

| Módulo           | Banco no MVP?       | Estratégia                                                                                                                                                                                                                 |
| ---------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Terço            | Não                 | Conteúdo versionado em `content/`. Preferências (toggles, tema, tamanho de fonte, Vim) em `localStorage`, documentadas e com botão "limpar". **Intenções particulares não são persistidas por padrão** (o Korvo persiste). |
| Exame            | **Proibido**        | Só memória, no estado local do componente                                                                                                                                                                                  |
| Novenário        | Não                 | Catálogo em `content/`. Progresso local (id da novena + data de início), com opção "não lembrar". PDFs como arquivos estáticos ou links, conforme direitos.                                                                |
| Biblioteca [FUT] | Não necessariamente | Corpus em arquivos e índice estático gerado no build (ADR na fase 2)                                                                                                                                                       |
| Vitrine [FUT]    | Não na v1           | Perfis e produtos como arquivos. Moderação via PR. Contato externo.                                                                                                                                                        |
| Pedidos [FUT]    | Sim, só na fase 3   | Pequeno serviço com SQLite e retenção curta. Exige RIPD/LGPD, moderação prévia e consentimento específico.                                                                                                                 |

**Formato de conteúdo no MVP** [REC]:

- Módulos TypeScript **só de dados**, com `as const satisfies <Tipo>`.
  - Zero dependências e validação em tempo de compilação.
  - Separação física em `content/`, importada via `package.json#imports` (`#content/*`) [HIP: validar junto com o `#lib` do SvelteKit 3].
- Cada item tem `source` (procedência), `license` e `status: 'aprovado' | 'em-revisao'`.
- O **job de release falha** se houver item referenciado sem aprovação. Essa é a "porta editorial".
- Rever o formato (ADR) quando houver editores não técnicos, ou na Biblioteca, que precisa de JSON/Markdown e de um pipeline.

### 3.5 Segurança e privacidade

**Base global** [REC]:

- Zero requisições a terceiros: fontes auto-hospedadas, sem analytics, sem CDN de script.
- CSP via `csp: { mode: 'hash' }` do SvelteKit.
  - Em páginas pré-renderizadas, a CSP vai em `<meta http-equiv>`.
  - Nesse caso `frame-ancestors`, `report-uri` e `sandbox` são **ignorados**: precisam vir por cabeçalho do host.
- Diretivas propostas:
  - `default-src 'self'; script-src 'self'` (hashes automáticos do SvelteKit)
  - `img-src 'self'; font-src 'self'; connect-src 'self'`
  - `object-src 'none'; base-uri 'self'; form-action 'self'`
  - `style-src 'self'`. [HIP] Verificar se o SSR do Svelte exige `'unsafe-inline'` para atributos `style`; nesse caso, restringir com `style-src-attr`.
- Cabeçalhos no host, quando houver suporte:
  - `frame-ancestors 'none'`
  - `Referrer-Policy: no-referrer`
  - `Permissions-Policy` restritiva
  - `X-Content-Type-Options`
- Links externos (Telegram, vendedores) com `rel="noopener noreferrer"`, para não vazar de qual página o usuário veio.
- Nada de `{@html}` com conteúdo de usuário.
- Dependências:
  - Lockfile e `pnpm install --frozen-lockfile`.
  - Padrões de cadeia de suprimentos do pnpm: período de espera para pacotes recém-publicados.
  - Lista de licenças permitidas, checada em CI.

**Arquitetura de privacidade do Exame** (requisito crítico) [REC]:

1. **Conteúdo público e estático.** Só as respostas são privadas.
2. **Estado só em `$state` local ao componente da página.** Nunca em módulo, contexto global ou URL. O título do documento é fixo.
3. **Regra de lint** (`no-restricted-globals`/`no-restricted-properties`) em `src/lib/modules/exame/**` e `src/routes/exame/**`. Proíbe:
   - rede: `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `navigator.sendBeacon`, `BroadcastChannel`;
   - armazenamento: `localStorage`, `sessionStorage`, `indexedDB`, `caches`, `document.cookie`;
   - URL e histórico: `history.pushState`/`replaceState`, escrita em `location.hash`.
4. **CSP mais restrita só no exame.**
   - `connect-src 'none'; form-action 'none'` numa `<meta>` adicional no HTML pré-renderizado. Várias políticas valem cumulativamente.
   - Também por cabeçalho, se o host permitir.
   - Entrada e saída da rota com `data-sveltekit-reload`, para que a política nunca "vaze" nem fique faltando na navegação client-side.
   - Pré-carregamento de links desligado (`data-sveltekit-preload-data="off"`).
5. **Campos de texto blindados:**
   - `autocomplete="off"`, sem `name` e sem `<form>` submetido (nada a autopreencher depois);
   - `spellcheck="false"`, que evita o revisor ortográfico em nuvem;
   - `autocorrect="off"` e `writingsuggestions="false"`;
   - `translate="no"` nos campos e no resumo.
6. **Ciclo de vida.**
   - Botão **"Apagar tudo agora"**.
   - Limpeza no `pagehide`. Ao voltar com `pageshow.persisted` (bfcache), o estado é zerado.
   - `Cache-Control: no-store` quando o host permitir, como reforço e não como garantia.
7. **Impressão local** via `@media print` na própria página. Sem bibliotecas de PDF e sem iframe.
   - Aviso: "Imprimir para PDF cria um arquivo no aparelho; destrua a folha após a confissão" (frase já usada pelo Korvo).
8. **Aviso discreto de privacidade** dizendo o que é garantido e o que não é: extensões, aparelho compartilhado, e o fato de que o histórico registra **a visita ao endereço**, mas não o conteúdo.
9. **Auditoria automatizada** (§8):
   - Teste E2E de "zero requisições após o carregamento".
   - Armazenamentos vazios.
   - A CSP bloqueia um `fetch` forçado.
   - Atributos dos campos.
   - Checklist manual por navegador para o que não dá para automatizar (restauração de sessão do Firefox, Safari).
10. **Linguagem.** O exame não é tratado como sacramento nem como aconselhamento: o aviso pastoral está em E12.

### 3.6 Acessibilidade (meta: WCAG 2.2 AA) [REC]

- HTML semântico, landmarks e link "pular para o conteúdo".
- `lang="pt-BR"` no documento e `lang="la"` em trechos latinos (SC 3.1.2).
- **Terço:**
  - Controles são `<button>` reais, com alvos de ≥ 44 px (o SC 2.5.8 exige ≥ 24 px).
  - O progresso é anunciado em região `aria-live="polite"`, de forma concisa: "Mistério 3, Ave-Maria 4 de 10".
  - O SVG das contas é decorativo (`aria-hidden`).
  - Foco gerenciado na troca de dezena.
  - Sem `role="application"`.
- **Atalhos:**
  - Tabela visível, aberta com `?`.
  - O tratador global ignora eventos cujo alvo é um controle interativo: evita o duplo disparo de `Espaço` sobre um botão.
  - Vim é opcional (SC 2.1.4).
- **Exibição:**
  - `prefers-reduced-motion` desliga as animações.
  - Contraste ≥ 4.5:1 nos dois temas.
  - Zoom de 200% e reflow a 320 px.
  - Rubricas em vermelho **e** em itálico: a cor não é o único sinal (SC 1.4.1).
- **Atalhos propostos** [DEC de UX, reversível]:

| Ação                           | Tradicional                    | Vim (opcional) |
| ------------------------------ | ------------------------------ | -------------- |
| Próximo                        | `→`, `Espaço`                  | `l`, `j`       |
| Anterior                       | `←`                            | `h`, `k`       |
| Dezena seguinte / anterior     | `↓`/`PageDown`, `↑`/`PageUp`   | `J`, `K`       |
| Início / fim                   | `Home` / `End`                 | `gg` / `G`     |
| Mostrar/ocultar texto completo | `t` (de uma tecla: desligável) | —              |
| Ajuda / sair                   | `?` / `Esc`                    | —              |

- Nota: a Lei Brasileira de Inclusão (Lei 13.146/2015, art. 63) exige acessibilidade em sites de empresas com sede no país. Relevante se o projeto virar pessoa jurídica [HIP: confirmar aplicabilidade].

### 3.7 Preparação para Tauri 2, sem implementar [REC]

Regras desde já:

1. Rotas do núcleo pré-renderizáveis e sem `load` de servidor.
2. APIs de navegador só dentro de `onMount`/`$effect` ou atrás de `browser`.
3. Caminhos relativos (`paths.relative`).
4. Nada essencial depende de cabeçalho do host: a CSP também está no HTML.
5. URL de API configurável (`PUBLIC_API_BASE`) quando houver API.
6. E2E também em **WebKit**, porque o iOS usa WKWebView.

Sem dependência nem configuração Tauri até a fase mobile. Lá, um **spike** decide entre:

- (a) reaproveitar o build pré-renderizado [HIP: deve funcionar, porque não usaremos APIs Tauri no `load`];
- (b) um perfil SPA (`fallback` + `ssr=false`), como no guia oficial (desatualizado).

Também não crio `src/lib/platform/` vazio: a camada de adaptação nasce quando a primeira capacidade nativa for necessária.

---

## 4. Estrutura inicial do repositório

```
Catoolicas/
├── README.md                 # visão, como rodar, princípios, status
├── LICENSE                   # GPL-3.0 (texto integral)
├── LICENSES/                 # textos das demais licenças (padrão REUSE): CC-BY-SA-4.0, OFL-1.1…
├── REUSE.toml                # licença/copyright por caminho — código ≠ conteúdo ≠ fontes ≠ imagens
├── CONTRIBUTING.md           # fluxo proposta→change→revisão; DCO; regras de conteúdo e procedência
├── package.json              # scripts, engines (node>=22.17), packageManager (pnpm@12.x), imports (#lib, #content)
├── vite.config.ts            # sveltekit({ adapter-static, csp, prerender }) + config do Vitest
├── tsconfig.json             # strict + noUncheckedIndexedAccess (índices de contas!) + noImplicitOverride
├── eslint.config.js          # inclui (M2) as regras de privacidade do exame
├── playwright.config.ts      # projetos chromium + webkit (+ firefox) contra o build (preview), não o dev server
├── .node-version             # 26 (LTS)
├── docs/
│   ├── adr/                  # decisões arquiteturais curtas (contexto, decisão, alternativas, consequências)
│   ├── changes/              # CHG-XXXX: problema, escopo, fora de escopo, tarefas, critérios, testes, riscos, resultado medido
│   ├── editorial/            # pendencias.md (E1–E14), glossário ("rosário das cláusulas"), aprovações
│   ├── privacy/              # (M2) modelo de ameaças do exame + checklist manual por navegador
│   └── budgets.md            # metas de desempenho vs. medições registradas
├── content/                  # SOMENTE dados religiosos/editoriais; sem lógica
│   └── terco/                # (M1) oracoes.ts, misterios.ts, jaculatorias.ts, esquemas.ts, SOURCES.md
├── scripts/                  # check-budget.ts, check-licenses.ts (Node puro, zero deps)
├── src/
│   ├── app.html              # lang="pt-BR"; sem scripts inline
│   ├── app.css               # tokens (cor, tipo, espaço, movimento) + reset mínimo
│   ├── lib/modules/terco/{domain,state,ui}/   # (M1) testes *.test.ts ao lado do domínio
│   └── routes/               # grupos (oracao)/, (estudo)/, (vitrine)/ com layouts próprios quando existirem
├── static/                   # robots.txt, favicon.svg; (M1) fontes woff2 subsetadas
├── tests/e2e/                # Playwright + axe
└── .github/workflows/ci.yml
```

**Por que esta organização:**

- **App única, não monorepo.** Não há segundo pacote real hoje.
- **`content/` na raiz.** Separação física e jurídica: o REUSE anota por pasta, e um revisor editorial enxerga só dados.
- **Módulos verticais** (`modules/terco`) em vez de camadas globais (`components/`, `services/`). Cada módulo pode ser removido ou testado isoladamente.
- **Grupos de rotas por tipo de página** (§5): layouts e densidade diferentes sem duplicar código.
- **`src/lib/ui/` compartilhado só quando ≥ 2 módulos** precisarem do mesmo componente.

---

## 5. Estratégia de design

**Direção visual** [REC]: um _livro de orações digital_. A tipografia é a protagonista, com sobriedade, margens generosas e contraste de papel e tinta.

- **Rubricas em vermelho**, como nos missais: a instrução fica em vermelho e itálico, o texto rezado em tinta. Isso dá significado à cor, não só decoração.
- O acento sutil por série de mistérios, que o Korvo já usa, é mantido.

**Paleta (tokens em `:root`, validados por contraste)**

| Token            | Uso                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| papel / tinta    | Fundo e texto. Tema claro com fundo marfim; **modo noturno** quente e de baixa luminância, para rezar à noite. |
| rubrica          | Vermelho escuro, ≥ 4.5:1 nos dois temas                                                                        |
| ouro             | **Só decorativo** (filetes, ornamentos), nunca texto                                                           |
| acento por série | Gozosos, luminosos, dolorosos e gloriosos, discretos                                                           |

**Tipografia**

- **UI:** pilha `system-ui`, com zero bytes baixados.
- **Texto de oração e leitura:** **uma** serifada OFL-1.1, variável, auto-hospedada e com subset latin + latin-ext.
  - Precisa cobrir æ, œ e os acentos latinos, e ℣ ℟ para textos litúrgicos [HIP: checar cobertura].
  - Candidatas: **Source Serif 4** ou **Literata** (feitas para leitura em tela).
  - A Cormorant Garamond, do Korvo, é de display: traço fino e pouca legibilidade em corpo pequeno e telas de baixa densidade.
- **Orçamento:** ≤ 2 arquivos woff2 (romano + itálico), `font-display: swap`, `preload` só do principal.

**Iconografia**

- SVG inline próprio, de traço simples.
- Símbolos cristãos (cruz, IHS, monograma mariano, contas) desenhados para o projeto. **Oportunidade: a artista da comunidade.**
- Ícones de UI copiados pontualmente do Lucide (ISC) com atribuição, sem dependência npm.
- **Sem emoji como ícone.**
- O logo do corvo, se adotado como identidade, vira **SVG** de poucos KB, contra os ~210 KB de PNG medidos [MED].

**Arte sacra**

- `<figure>` com legenda completa: obra, autor, data, acervo, fonte e licença.
- Proporção fixa (sem CLS).
- AVIF/WebP responsivos via `@sveltejs/enhanced-img` (add-on oficial; `sharp` só no build).
- `loading="lazy"`; `fetchpriority` só na imagem principal.
- Opção **"economizar dados / ocultar imagens"**.
- Texto alternativo descritivo e revisado editorialmente.
- Só obras com procedência registrada e direitos verificados para o Brasil [DEC].

**Três tipos de página, uma identidade**

|           | Contemplativa (Terço, Novena, Exame)                        | Estudo (Biblioteca, Sinopse)               | Comercial (Vitrine)                                 |
| --------- | ----------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------- |
| Densidade | Mínima; um foco por tela                                    | Alta; painéis, referências sempre visíveis | Média; grade de produtos                            |
| Navegação | Recolhida; modo "rezar" quase em tela cheia                 | Barra de busca, painéis, atalhos           | Filtros por categoria e vendedor                    |
| Movimento | Só o progresso das contas (≤ 200 ms, `opacity`/`transform`) | Nenhum além do redimensionamento           | Nenhum                                              |
| Comércio  | **Proibido** (nenhum link de venda dentro da oração)        | Proibido                                   | Explícito, com o aviso "venda direta pelo vendedor" |
| JS        | Necessário                                                  | Mínimo (leitura com `csr=false`)           | Mínimo                                              |

**Responsividade do Terço**

- **≥ 960 px:** horizontal, com trilho de contas, texto da oração e meditação/perícope lado a lado.
- **Celular:** coluna única, com os controles fixos na **zona do polegar** e um botão grande "Próxima".

---

## 6. Priorização por fases

| Fase                           | Entregas                                                                                                                                                                                                                                                                                | Valor                                    | Complexidade                   | Risco                                            | Dependências                                            |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------ | ------------------------------------------------ | ------------------------------------------------------- |
| **MVP — "Rezar e examinar"**   | M0 Fundação · M1 Terço do Dia · M2 Exame · M3 Novenário v1 + links do Telegram (pedidos por redirecionamento) · M4 Publicação                                                                                                                                                           | Alto, uso diário                         | Baixa a média, **sem backend** | Direitos e aprovação de conteúdo                 | Respostas Q1–Q6                                         |
| **Fase 2 — "Estudar e expor"** | Biblioteca v1 (poucas obras com direitos claros, busca estática, leitura com âncoras estáveis, comparação em painéis) · Vitrine v1 · intenções públicas vindas do Telegram · Via Sacra, Seleta e outros terços no mesmo motor · PWA/offline, se validado · textos latinos, se aprovados | Alto para estudiosos e para a comunidade | Média                          | Direitos de documentos; modelagem de referências | ADR de busca; acesso ao bot                             |
| **Fase 3 — Avançado**          | Sinopse dos Evangelhos · formulário próprio de pedidos com moderação · Tauri 2 mobile · notificações nativas/push, se validadas · orçamentos e encomendas na vitrine · pagamentos **só** após estudo jurídico e fiscal · i18n                                                           | Médio a alto                             | Alta                           | LGPD, fiscal, lojas de apps                      | Backend, ADRs de autenticação de moderadores e de dados |

**Por que esta ordem:**

- O Terço e o Exame têm o **maior valor diário** e o **menor custo operacional** (estáticos), e já existe base: o Korvo.
- O Exame é o diferencial de privacidade.
- Tudo que exige dados pessoais (pedidos, contas, pagamentos) fica para quando houver base jurídica, moderação e demanda comprovada.

---

## 7. Estratégia de monetização

| Modelo                                                                        | Compatível com FOSS?                               | Prós                                                       | Contras e limites                                                                                                                                        |
| ----------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Doações diretas** (Pix, Liberapay, GitHub Sponsors, Open Collective)        | Sim                                                | Simples; transparência gera confiança                      | Receita imprevisível. Pix exige um recebedor (CPF ou CNPJ), o que é decisão de **governança**. Taxas e condições variam por plataforma [verificar].      |
| **Edições próprias com Typst** (Typst é Apache-2.0) via impressão sob demanda | Sim (código-fonte aberto; venda de cópias físicas) | Receita sem logística própria; serve à comunidade          | **Exige direitos sobre os textos** (missais e breviários: traduções e edições típicas podem ser protegidas) [DEC]                                        |
| **Vitrine:** listagem gratuita → destaque ou assinatura simbólica voluntária  | Sim                                                | Valida a demanda antes de cobrar; sem intermediar dinheiro | Receita pequena no início                                                                                                                                |
| **Comissão sobre vendas**                                                     | Sim, mas complexo                                  | Escala com as vendas                                       | Exige intermediar o pagamento (split via provedores com KYC e taxas), nota fiscal, estornos, disputas e responsabilidade de consumidor. **Fora do MVP.** |
| **Apoio institucional** (paróquias, associações)                              | Sim                                                | Estabilidade                                               | Risco de dependência ou de influência editorial: precisa de política clara                                                                               |
| Anúncios ou afiliados com rastreamento                                        | **Não recomendado**                                | —                                                          | Conflitam com privacidade e com páginas contemplativas                                                                                                   |

**Custos operacionais potenciais** (ordens de grandeza a verificar, não orçamento):

- **Domínio:** dezenas de reais por ano.
- **Hospedagem estática:** R$ 0 em planos gratuitos, com limites.
- **Fase 3:** servidor pequeno para a API (poucos dólares por mês), backups e e-mail transacional, se necessário.
- **Consultoria jurídica pontual:** direitos autorais, LGPD e, se houver comissão, fiscal.
- **O maior custo real é o tempo dos mantenedores e da revisão editorial.**

**Trade-off central:** como qualquer um pode bifurcar o código GPL, a sustentabilidade vem de **confiança, comunidade, curadoria e serviço**, não de exclusividade do código.

---

## 8. Estratégia de qualidade

| Camada         | Ferramenta                                                                              | O que cobre                                                                                                                                                 | Quando                    |
| -------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Unitário       | Vitest                                                                                  | Domínio puro: sequência, navegação, calendário, perícope do dia, mapa de teclas, resumo do exame, checagem de orçamento                                     | Todo PR                   |
| Componente     | Vitest (modo navegador)                                                                 | Só componentes com lógica não coberta pelo domínio nem pelo E2E                                                                                             | Quando surgir necessidade |
| E2E            | Playwright: Chromium + **WebKit** (+ Firefox), contra o **build**                       | Fluxos reais: rezar o terço inteiro por teclado e por toque (viewport móvel), toggles, tema escuro, movimento reduzido                                      | Todo PR                   |
| Acessibilidade | `@axe-core/playwright` (MPL-2.0, só dev) + checklist manual                             | Zero violações automáticas WCAG 2.2 A/AA por rota e estado. Leitor de tela (NVDA+Firefox, VoiceOver iOS, TalkBack) a cada marco.                            | PR / marco                |
| Desempenho     | `scripts/check-budget.ts` (gzip dos artefatos, zero deps) + Lighthouse manual por marco | Falha o CI em regressão de JS, CSS ou HTML. Mede Web Vitals de laboratório.                                                                                 | PR / marco                |
| Privacidade    | Lint restrito + suíte E2E do exame + checklist manual                                   | Zero requisições após o carregamento; storage, cookies e Cache Storage vazios; CSP bloqueia `fetch` forçado; atributos dos campos; nada na URL ou no título | PR (M2+)                  |
| Conteúdo       | Teste sobre `content/`                                                                  | Todo item tem `source`, `license` e `status`; release só com itens `aprovado`                                                                               | PR / release              |
| Licenças       | `pnpm licenses list --json` + lista permitida; REUSE lint                               | Dependências compatíveis; todo arquivo com licença declarada                                                                                                | PR                        |

**Orçamentos iniciais.** São **metas propostas, não medidas.** Serão recalibradas na primeira medição e registradas em `docs/budgets.md`.

| Métrica                                       | Meta proposta                                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| JS inicial (gzip), página interativa do Terço | ≤ 60 KB                                                                                             |
| JS inicial (gzip), páginas de conteúdo        | ≤ 35 KB, ou 0 com `csr=false`                                                                       |
| CSS total (gzip)                              | ≤ 15 KB                                                                                             |
| HTML por rota (gzip)                          | ≤ 30 KB                                                                                             |
| Fontes                                        | ≤ 2 woff2, ≤ 120 KB no total                                                                        |
| Primeira visita ao `/terco`, sem imagens      | ≤ 200 KB transferidos. Referência medida: o Korvo transfere ~604 KB comprimidos [MED].              |
| LCP / CLS / INP                               | ≤ 2,5 s / ≤ 0,1 / ≤ 200 ms (limiares "bons" do web.dev), em Lighthouse mobile com throttling padrão |

**Validação em ambiente limpo:**

- CI a partir de checkout novo: `pnpm install --frozen-lockfile` → check → lint → unit → build → E2E no `preview` → orçamento → licenças.
- Cada CHG registra os **resultados medidos**.
- Cada CHG distingue explicitamente o que é **simulado** do que foi **integrado de verdade**. Exemplo: Telegram "simulado" até o teste com o bot real.

**Processo, adaptado ao tamanho do projeto:**

- Uma change (CHG) por PR, com critérios objetivos de aceitação.
- ADR só para decisões duradouras.
- Revisão independente antes do merge: humana, ou automatizada com confirmação humana.
- Aprovação editorial registrada no PR pelo responsável de conteúdo, com `status: 'aprovado'` no conteúdo.

---

## 9. Roadmap técnico

```
M0 Fundação ──► M1 Terço ──────────► M4 Publicação (deploy só com sua aprovação)
      │            ▲ conteúdo aprovado (E1–E11, Q3, Q4)
      ├──────► M2 Exame ─────────────┘
      │            ▲ direitos do exame (Q5) + E12
      └──────► M3 Novenário v1 + links do Telegram
                   ▲ catálogo e direitos dos PDFs
```

| Marco               | Changes previstas                                                                                                                                | Critério de conclusão                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M0 Fundação**     | CHG-0001                                                                                                                                         | CI verde a partir de clone limpo; páginas `/` e `/sobre` pré-renderizadas; CSP ativa; axe sem violações; orçamento e licenças checados; ADRs 0001–0003  |
| **M1 Terço**        | CHG-0002 domínio (com fixtures **marcadas como teste**, nunca orações inventadas) · CHG-0003 UI e atalhos · CHG-0004 conteúdo aprovado e imagens | Terço completo e rosário inteiro por teclado, toque e leitor de tela; toggles; perícope diária determinística; orçamento cumprido; só conteúdo aprovado |
| **M2 Exame**        | CHG-0005 domínio e UI · CHG-0006 suíte de privacidade e ADR do exame                                                                             | Suíte de privacidade verde em 3 motores; checklist manual executado e registrado; conteúdo aprovado                                                     |
| **M3 Novenário v1** | CHG-0007                                                                                                                                         | Catálogo, leitura por dia, progresso local opcional, `.ics` [HIP validada com usuários], deep links do Telegram                                         |
| **M4 Publicação**   | CHG-0008                                                                                                                                         | Host e domínio escolhidos; cabeçalhos; páginas de privacidade, licenças e créditos; decisão sobre PWA; **deploy aprovado por você**                     |

---

## 10. Decisões arquiteturais (ADRs)

**Agora (na CHG-0001), curtas, ≤ 1 página cada:**

1. **ADR-0001 Licenciamento e contribuições.**
   - Código GPL-3.0 (variante conforme Q1).
   - Conteúdo original do projeto sob CC BY-SA 4.0 [REC]; a licença tem compatibilidade unidirecional com GPLv3.
   - Textos de terceiros com a licença da fonte.
   - REUSE e DCO.
   - Política sobre App Store (Q2).
2. **ADR-0002 Estático primeiro.**
   - SvelteKit 3 + adapter-static + prerender.
   - Sem backend nem banco no MVP.
   - Regras por rota e regras de compatibilidade com Tauri.
3. **ADR-0003 Conteúdo separado do código.**
   - `content/`, procedência, `status` editorial e porta de release.
   - Proibição de conteúdo gerado ou inventado.

**No momento em que forem necessárias (adiadas):**

| Decisão                                                                                                                                            | Quando                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| ADR do exame (modelo de ameaças e garantias)                                                                                                       | M2                                                  |
| Hospedagem e cabeçalhos                                                                                                                            | M4                                                  |
| PWA / service worker                                                                                                                               | M4                                                  |
| Motor de busca da Biblioteca (Pagefind × MiniSearch × SQLite FTS5 no servidor — spike com critérios: lematização PT, acentos, frases, referências) | Fase 2                                              |
| Modelo de referências documentais                                                                                                                  | Fase 2                                              |
| Backend, banco e autenticação de moderadores                                                                                                       | Fase 3                                              |
| Perfil de build Tauri                                                                                                                              | Fase 3                                              |
| Notificações                                                                                                                                       | Fase 3                                              |
| Pagamentos                                                                                                                                         | Fase 3                                              |
| Biblioteca de i18n                                                                                                                                 | Quando houver um 2º idioma de interface             |
| Observabilidade além das estatísticas agregadas do host                                                                                            | Se houver necessidade comprovada; nunca no `/exame` |

**Rascunho da Biblioteca, para registro [FUT]:**

- **Modelo:** Obra → Edição/Tradução (idioma, tradutor, editora, ano, licença, URL de origem, data de captura, hash) → Unidades endereçáveis (parágrafo, cânon, artigo), com IDs estáveis do tipo `cic:1234` e `cdc1983:c1055§1`.
- **Busca:** a busca por **referência** é resolvida por um analisador determinístico, antes do texto livre.
- **Comparação:** layout em árvore de divisões, como no i3, com o padrão acessível _Window Splitter_ (WAI-ARIA APG). Vira abas/pilha no celular. Layout serializável na URL.
- **IA e busca semântica:** **não recomendadas** agora. Custo e infraestrutura somados ao risco de referências falsas superam o benefício. Se um dia entrarem, só como recuperação sobre unidades verificadas, sempre com link para a unidade exata e nunca com texto gerado.

---

## 11. Primeira change proposta — CHG-0001 "Fundação do projeto"

**Escopo mínimo:**

- Esqueleto SvelteKit 3 + Svelte 5 + TS strict + Vite 8 + pnpm 12.
- Saída estática pré-renderizada, CSP e pipeline de qualidade completo.
- Duas páginas reais: **início** e **sobre** (privacidade, licenças, créditos).
- Documentação de base.

**Fora do escopo:** qualquer módulo funcional, conteúdo religioso, fontes customizadas, imagens, PWA e deploy.

**Arquivos esperados:**

- **Raiz:** `package.json`, `pnpm-lock.yaml`, `.node-version`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `playwright.config.ts`.
- **`src/`:** `app.html`, `app.css`, `app.d.ts`, `routes/+layout.ts`, `routes/+layout.svelte`, `routes/+page.svelte`, `routes/sobre/+page.svelte`.
- **Outros:** `static/robots.txt`, `static/favicon.svg`, `tests/e2e/base.test.ts`.
- **Scripts:** `scripts/check-budget.ts` + `budgets.json`, `scripts/check-licenses.ts` (+ teste unitário de cada).
- **CI:** `.github/workflows/ci.yml`.
- **Licenciamento:** `LICENSE`, `LICENSES/`, `REUSE.toml`.
- **Docs:**
  - `README.md`, `CONTRIBUTING.md`;
  - `docs/adr/0001-licenciamento.md`, `docs/adr/0002-estatico-primeiro.md`, `docs/adr/0003-conteudo-separado.md`;
  - `docs/changes/CHG-0001-fundacao.md`, `docs/budgets.md`, `docs/editorial/pendencias.md` (E1–E14).

**Tarefas verificáveis:**

| #   | Tarefa                                                                                                                                                                                                       | Verificação                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | Gerar com o CLI oficial: `pnpm dlx sv create` com template `minimal` e `--types ts`, add-ons `eslint`, `prettier`, `vitest`, `playwright`, `sveltekit-adapter` (static). Registrar comando e versões na CHG. | Versões no lockfile ≥ mínimos do SvelteKit 3                                                                                                 |
| T2  | TS `strict` + `noUncheckedIndexedAccess` + `noImplicitOverride`                                                                                                                                              | `pnpm check` com 0 erros                                                                                                                     |
| T3  | adapter-static (`strict: true`) + `prerender = true` no layout raiz                                                                                                                                          | `pnpm build` gera só arquivos estáticos e falha se uma rota não for pré-renderizável                                                         |
| T4  | CSP `mode: 'hash'` com as diretivas de §3.5                                                                                                                                                                  | O HTML gerado contém `<meta http-equiv="Content-Security-Policy">` sem `unsafe-inline` em `script-src`                                       |
| T5  | Layout base: `lang="pt-BR"`, link "pular para o conteúdo", landmarks, tokens claro/escuro, `prefers-reduced-motion`, fonte do sistema                                                                        | E2E + axe                                                                                                                                    |
| T6  | Páginas início e sobre (privacidade: "não coletamos dados"; licenças; créditos ao Korvo como referência)                                                                                                     | E2E                                                                                                                                          |
| T7  | Teste base E2E (Chromium + WebKit)                                                                                                                                                                           | Nenhuma requisição a outra origem; `document.cookie === ''`; storage vazio; axe sem violações nos dois temas; skip link funciona por teclado |
| T8  | Script de orçamento (gzip por artefato) + teste unitário                                                                                                                                                     | O CI falha quando a meta é excedida (teste com artefato sintético)                                                                           |
| T9  | Script de licenças (`pnpm licenses list --json` + lista permitida: MIT, ISC, BSD-2/3, Apache-2.0, MPL-2.0, 0BSD, CC0, OFL-1.1, LGPL só em dependência de build) + teste unitário                             | Falha com licença fora da lista                                                                                                              |
| T10 | CI: install congelado → check → lint → unit → build → E2E no preview → orçamento → licenças                                                                                                                  | Workflow verde no push da branch                                                                                                             |
| T11 | Documentos (ADRs, CHG, pendências editoriais E1–E14, CONTRIBUTING com DCO)                                                                                                                                   | Revisão                                                                                                                                      |
| T12 | Validação em ambiente limpo: clone novo + sequência completa; registrar tamanhos **medidos** em `docs/budgets.md`                                                                                            | Resultado registrado na CHG                                                                                                                  |

**Critérios de aceitação:**

- Todos os comandos de T10 passam localmente (clone limpo) e no CI.
- Zero dependências de _runtime_ além de Svelte/SvelteKit.
- Zero requisições a terceiros.
- axe sem violações.
- Tamanhos medidos registrados.
- Nenhum conteúdo religioso incluído.

**Riscos e pendências da CHG-0001:**

1. **Ecossistema jovem.** O SvelteKit 3 tem ~8 semanas e o pnpm 12 é uma reescrita nativa. Plugins de lint/teste e a action do pnpm podem estar atrás.
   - Mitigação: só add-ons oficiais e versões fixadas.
   - Plano B: pnpm 11.
2. **Scripts em `.ts`** dependem do _type stripping_ nativo do Node (Node 26) [HIP]. Plano B: `.js` com JSDoc checado pelo `tsc`.
3. **Neste ambiente de nuvem** o Chromium/Playwright já vem pré-instalado. Se a versão fixada pelo projeto divergir, usar o `executablePath` indicado. No GitHub Actions, o CI instala os navegadores próprios.
4. **O aviso de licença** depende de Q1. Uso a recomendação como padrão e ajusto antes do merge se você decidir diferente.
5. **Commits na branch `claude/quirky-lovelace-1cp3q1`.** Sem PR e sem deploy até você pedir.

---

## 12. Perguntas para aprovação (só alto impacto)

| #                             | Pergunta                                                                                                                                                    | Opção recomendada                                                                                                                                                                                                                                                               | Justificativa                                                                                                                                                                                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Q1**                        | Variante da licença e política de contribuição                                                                                                              | **GPL-3.0-or-later** para o código; **CC BY-SA 4.0** para conteúdo original do projeto; REUSE; **DCO** (sem CLA)                                                                                                                                                                | `or-later` é o padrão da FSF e evita relicenciamento futuro. CC BY-SA tem compatibilidade unidirecional com GPLv3. O DCO é leve para contribuidores. Pedir ao Korvo que declare explicitamente "GPL-3.0-or-later" no repositório dele, se formos portar código. |
| **Q2**                        | Publicar na App Store do iOS é objetivo?                                                                                                                    | **Sim, como possibilidade.** Até decidirmos a permissão adicional (GPLv3 §7, redigida ou revisada por alguém qualificado), **aceitar código só dos mantenedores** e do Korvo com o acordo dele.                                                                                 | Adotar a exceção depois exige o consentimento de todos os titulares. Congelar contribuições externas de código custa pouco agora. Conteúdo e revisão podem vir de qualquer pessoa.                                                                              |
| **Q3**                        | Procedência e direitos do conteúdo do Terço (livreto "O Santo Rosário Meditado": edição, editora, tradução bíblica das perícopes; traduções EN/LA do Korvo) | **MVP só em pt-BR**, com cada texto de procedência documentada e permissão escrita do titular ou fonte comprovadamente livre. EN/LA ficam fora até a procedência ser comprovada.                                                                                                | "Não inventar" vale também para não **republicar sem direito**. O código GPL do Korvo não licencia textos de terceiros.                                                                                                                                         |
| **Q4**                        | Quem é o responsável editorial/doutrinal e como a aprovação é registrada?                                                                                   | **Uma pessoa nomeada** (o responsável pelo conteúdo, com conta no GitHub) aprova os PRs de `content/`. Registro em `status: 'aprovado'`. As pendências E1–E14 vão para ela.                                                                                                     | Sem uma autoridade editorial definida, o M1 não pode publicar conteúdo. O domínio e a UI avançam em paralelo com fixtures de teste.                                                                                                                             |
| **Q5**                        | Exame: qual é a origem e o direito do PDF? Por que o "exame completo" do Korvo é cifrado com senha?                                                         | Publicar **só** o conteúdo com permissão clara. Começar pelo exame simples, se a autoria e a aprovação forem confirmadas. **Nunca** distribuir conteúdo restrito cifrado em repositório público.                                                                                | A cifra sugere restrição de direitos ou pastoral. O módulo precisa de uma base de conteúdo legítima.                                                                                                                                                            |
| **Q6**                        | Escopo do Terço no MVP frente aos extras do Korvo                                                                                                           | **MVP:** Terço e Rosário com os toggles que você listou (Montfort, cláusulas, texto completo, Vim), esquemas de dias e jaculatórias. **Fase 2:** Via Sacra, Seleta e Outros terços, no mesmo motor. **Excluir por ora:** devoções "com ressalva" e orações próprias do usuário. | Entrega rápida e verificável. Os extras reaproveitam o motor depois. "Com ressalva" é uma decisão doutrinal (E13).                                                                                                                                              |
| **Q7** _(não bloqueia M0–M2)_ | Temos acesso ao código e à administração do bot do Telegram? O bot registra consentimento para publicar intenções?                                          | **MVP só com deep links.** Na fase 2, um export somente leitura de intenções **já públicas e consentidas**.                                                                                                                                                                     | Evita duplicar moderação e nunca expõe intenção privada.                                                                                                                                                                                                        |

**Podem esperar** (com recomendação já registrada):

- Hospedagem e domínio, no M4. Com saída estática, a escolha é reversível.
- PWA, no M4.
- Entidade jurídica e recebimento de doações, na fase 2.
- Escolha final da fonte serifada, no M1.

---

## Recomendação final

1. **Aprovar este plano** e a **CHG-0001 (Fundação)**. Ela não depende das respostas, exceto pelo aviso de licença (Q1), que segue a recomendação até você decidir.
2. **Em paralelo:** você responde Q1–Q6, e o responsável editorial recebe `docs/editorial/pendencias.md`.
3. **Em seguida:** CHG-0002 (domínio do Terço com fixtures de teste). O conteúdo real só entra após a aprovação editorial.

## Verificação (como a CHG-0001 será comprovada)

- **Local, em clone limpo:**
  - `pnpm install --frozen-lockfile && pnpm check && pnpm lint && pnpm test:unit && pnpm build && pnpm test:e2e && pnpm budget && pnpm licenses:check`.
  - Os resultados medidos (tamanhos gzip, contagem de violações do axe) ficam registrados em `docs/changes/CHG-0001-fundacao.md` e `docs/budgets.md`.
- **Inspeção do `build/`:** só arquivos estáticos; `<meta>` CSP presente; `lang="pt-BR"`; nenhuma URL de terceiros no HTML, CSS ou JS (busca por `https?://` fora da allowlist).
- **CI:** workflow verde no push da branch `claude/quirky-lovelace-1cp3q1`.

## Fontes consultadas

- SvelteKit 3: https://svelte.dev/blog/sveltekit-3-is-here · https://svelte.dev/docs/kit/migrating-to-sveltekit-3
- Configuração e CSP: https://svelte.dev/docs/kit/configuration · adapter-static: https://svelte.dev/docs/kit/adapter-static
- CLI `sv`: https://svelte.dev/docs/cli/sv-create · https://svelte.dev/docs/cli/sv-add
- Vite 8: https://vite.dev/blog/announcing-vite8
- pnpm: https://pnpm.io/installation · https://pnpm.io/blog
- Node.js: https://nodejs.org/en/about/previous-releases
- Tauri + SvelteKit: https://v2.tauri.app/start/frontend/sveltekit/ · releases: https://v2.tauri.app/release/ · notificações: https://v2.tauri.app/plugin/notification/
- LEV (direitos sobre textos pontifícios): https://www.vatican.va/roman_curia/institutions_connected/lev/docs_lev/copyright_po.htm
- GPL × App Store (histórico 2010–2011, estado atual não confirmado): https://www.computerworld.com/article/1347653/gplv2-blocks-vlc-from-apple-s-app-store.html · https://mailman.videolan.org/pipermail/vlc-devel/2010-November/077087.html
- Pagefind (candidato da fase 2, recursos a validar): https://pagefind.app/docs/multilingual
- Referência analisada: https://github.com/garamogger/terco-diario
