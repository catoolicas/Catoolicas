# Proposta revisada (rev. 2) — Plataforma Católica FOSS (Catoolicas)

> Aprovada em 26/11/2026 pelos responsáveis.

> Substitui as fases, o roadmap e as perguntas da rev. 1, que está versionada em `docs/proposta-arquitetura.md`.
> A arquitetura técnica da rev. 1 continua valendo (estático primeiro, módulos `domain/state/ui`, `content/` separado, privacidade do Exame), salvo onde este documento diz o contrário.

## Contexto

**Por que revisar:** você redefiniu as fases, respondeu às perguntas Q1–Q7, mandou três PDFs de exame de consciência e decidiu quem redige os itens novos do Exame.

**Estado do repositório (verificado)**

- **CHG-0001 (fundação):** dois commits locais na branch `claude/quirky-lovelace-1cp3q1`, `90dfdd4` e `92bfb67`.
  - **Não publicados:** o `git push` falhou com HTTP 403, porque o Claude não tem acesso a `catoolicas/Catoolicas` pela organização.
  - Sem push não há CI, e Firefox e WebKit seguem **não verificados**.
- **Correções da revisão independente, já feitas e testadas, mas sem commit:**
  - `trailingSlash: 'always'`: corrige o erro 404 em `/sobre` em servidores estáticos simples, reproduzido com `python3 -m http.server`;
  - servidor estático estrito para os testes E2E (`scripts/serve-build.ts`, com testes);
  - teste E2E que verifica todos os links internos (o teste de mutação confirmou que ele falha quando deve);
  - orçamento padrão de JS recalibrado para 50 KB: só a hidratação do framework mede 39 KB;
  - REUSE com `precedence = "closest"`;
  - entrada dos scripts por caminho real, sem burla via link simbólico;
  - parser do orçamento mais robusto.
  - Validado: 22 testes unitários e 30 E2E em Chromium, tanto no Node 22.23.5 quanto no **Node 26.13.1**; REUSE com 41/41 arquivos.
  - A contagem "REUSE 31/31" registrada na CHG-0001 estava desatualizada e será corrigida.

**Fatos levantados nos PDFs (leitura integral)**

| PDF                                             | Direitos                                                                                                       | Estrutura útil                                                                                                                                                                            | Problemas                                                                                                                                               |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Exame de consciência — 10 mandamentos" (18 p.) | Sem autor nem aviso. É trecho de um livro maior (cita "p. 206").                                               | 12 passos para uma boa confissão; mortal × venial; como acusar (fato, motivo, duração); 8 perguntas iniciais; preceitos da Igreja com dias de guarda no Brasil; roteiro do confessionário | Parte dos mandamentos é catecismo em prosa, não lista de verificação                                                                                    |
| "Método para se confessar bem" (41 p.)          | **"© Santa Cruz – Editora & Livraria, 2020 … Todos os direitos reservados"**                                   | ~80 itens no formato "pequei __ vezes" com marcação mortal/venial; pecados capitais; método breve (pensamentos, palavras, obras); roteiro do confessionário                               | Reedição de manual anterior a 1966–69, com disciplina **desatualizada**: jejum a partir dos 21 anos, Septuagésima, Índex, indulgências contadas em dias |
| "Manual de Confissão" (Padre Paulo, 39 p.)      | Marca _Christo Nihil Praeponere_; sem licença, portanto todos os direitos reservados por padrão (Lei 9.610/98) | ~112 perguntas em 1ª pessoa; 10 perguntas iniciais; notas "ATENÇÃO/OBS"; marcações inline (casados, pais); 3 condições do pecado mortal; 5 requisitos da confissão                        | Itens com posições políticas (voto); regra "na dúvida, confesse", que é delicada para escrupulosos                                                      |

**Conclusão:** nenhum dos três pode ser copiado. Eles servem como **lista de tópicos e de estrutura**.

---

## 1. Decisões registradas

| #     | Sua resposta                                                                               | Consequência no plano                                                                                                                                                                                                                                           |
| ----- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1    | "Tudo será GPL"                                                                            | Código, documentação e **conteúdo original** sob `GPL-3.0-or-later`; a CC BY-SA sai do ADR-0001. Mantenho o "or later" e o DCO da recomendação original. Textos em domínio público continuam em domínio público, porque a GPL só cobre contribuições originais. |
| Q2    | Todas as lojas, eventualmente; primeiro F-Droid e GitHub Releases (Obtainium)              | **Trilha Android** depois do MVP web. A questão GPL × App Store do iOS continua aberta: até existir a permissão adicional (GPLv3 §7), só os mantenedores contribuem código.                                                                                     |
| Q3    | Português primeiro; latim e inglês depois; o Terço já em PT + LA                           | O Terço do MVP traz as orações em **PT e LA**, com alternância de idioma, como no Korvo. A interface fica só em português.                                                                                                                                      |
| Q4    | Responsáveis: `garamogger` (Korvo) e `williamdasilvazoia8-blip`                            | São eles que aprovam o conteúdo, revisando o PR.                                                                                                                                                                                                                |
| Q5    | Os arquivos do Korvo têm autorização explícita; a senha do exame completo é de uso pessoal | O conteúdo do Terço do Korvo pode ser importado. O "exame completo" cifrado **não entra**.                                                                                                                                                                      |
| Q6    | Recomendação original                                                                      | MVP: Terço e Rosário. Via Sacra, Seleta e outros terços ficam para depois; devoções "com ressalva" e orações próprias do usuário ficam fora por ora.                                                                                                            |
| Q7    | Há acesso ao bot e ao canal                                                                | Útil só na Fase 4.                                                                                                                                                                                                                                              |
| Exame | "Eu rascunho, vocês aprovam"                                                               | Rascunhos meus a partir de uma matriz de tópicos, com `status: 'em-revisao'`. Publicação só item a item, após aprovação (§4.2). Exige emenda ao ADR-0003.                                                                                                       |

**Interpretação confirmada na aprovação (26/11/2026):** como o Korvo é autor e responsável, o conteúdo atual dele é a **base aprovada**.

- Isso fecha a maior parte das pendências editoriais E1–E14: esquema de dias, orações de abertura e finais, jaculatórias, frutos, pontos de Montfort e perícopes atuais.
- Ficam abertas só as **mudanças** que você pediu (§4.1) e os itens do Exame.
- Depois da importação, **a fonte única do conteúdo passa a ser este repositório**. O `terco-diario` vira legado.

---

## 2. Onde as orientações precisam de ajuste

**2.1 Fase 2: "tudo é domínio público" não vale para todas as obras citadas.**

- No Brasil, o direito patrimonial dura **70 anos após a morte do autor** (Lei 9.610/98, art. 41). Isso vale também para **tradutores**: o original pode ser livre e a tradução, não.
- A LEV declara direitos sobre textos pontifícios e da Cúria.

| Obra             | Provavelmente livre (verificar edição a edição)                              | Provavelmente protegido                                                  |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Suma Teológica   | Texto latino; traduções antigas cujo tradutor morreu há mais de 70 anos      | Traduções portuguesas modernas                                           |
| Denzinger        | Edições latinas antigas, como Herder 1908/1911 (digitalizadas no HathiTrust) | Edições Schönmetzer (1963+) e Hünermann (1991+), e traduções modernas    |
| Direito Canônico | Código de 1917 (texto latino)                                                | **Código de 1983** (LEV) e suas traduções                                |
| Catecismos       | Catecismo Romano (latim); Catecismo de São Pio X no original                 | **Catecismo da Igreja Católica (1992) e Compêndio (2005)**, ambos da LEV |
| Concílios        | Trento e Vaticano I (latim)                                                  | **Vaticano II** (LEV) e traduções                                        |
| Bíblia (sinopse) | Vulgata; traduções antigas                                                   | Traduções modernas                                                       |

**Proposta:** antes de qualquer código da Fase 2, montar uma **matriz de direitos por edição** em `docs/estudo/direitos.md`.

- Colunas: obra, edição, idioma, tradutor e ano de morte, fonte digital, status e decisão.
- Começar só pelos itens "verdes".
- Eu **não** afirmo o status de nenhuma edição sem verificação.

**2.2 Fase 3: missais e breviários.**

- O texto latino da liturgia é antigo e provavelmente livre.
- Mas é preciso definir **qual edição e qual rito** (por exemplo, a edição típica de 1962).
- Traduções portuguesas, notas rubricais, comentários e ilustrações de edições bilíngues específicas podem ser protegidos.
- **Decisão pendente para a Fase 3:** a edição de referência e a verificação de direitos dela.
- **GPL em impressos:** cada livro deve trazer o aviso de licença e a oferta escrita do código-fonte Typst (GPLv3 §6). O texto em domínio público continua livre.

**2.3 "O terço foi originalmente escrito em latim/português".**

- As orações comuns (Pater, Ave, Gloria, Credo, Salve Regina) têm, de fato, original latino.
- Os métodos de São Luís de Montfort foram escritos em **francês**. Os pontos de meditação em latim e em português são traduções, e a procedência de cada uma será registrada.
- A decisão de produto (PT + LA no MVP) continua de pé.

**2.4 Disciplina vigente no Exame.**

- O manual da Santa Cruz usa regras anteriores a 1966.
- Recomendo seguir a **lei vigente** (CDC de 1983, cân. 1249–1253) nos preceitos de jejum e abstinência e nas idades.
- Decisão editorial (E15).
- Também são editoriais (E16, E17): itens de posição política e orientação para pessoas escrupulosas.

**2.5 Telegram (Fase 4).**

- Republicar na web posts de um canal público aumenta a exposição: a página pode ser indexada por buscadores.
- Exige consentimento do dono do canal, `noindex` e uma janela curta de exibição.
- Tecnicamente: o bot do amigo, como administrador, exporta os posts para um build agendado.
- **Sem o widget do Telegram**, que carrega script de terceiro.

**2.6 F-Droid.**

- O F-Droid compila o app a partir do código, nos próprios servidores. A receita de build Tauri (Rust + Node + NDK) não está validada, e há histórico de Node desatualizado nos servidores deles (post de 2020).
- Proposta:
  1. Primeiro, APKs assinados via GitHub Releases, que já servem o Obtainium.
  2. Depois, um spike da receita para o F-Droid.

---

## 3. Fases revisadas

| Fase                           | Conteúdo                                                                                                                                                                   | Servidor?                           | Depende de                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------- |
| **MVP**                        | **Terço** (porta do Korvo, PT + LA) e **Exame de consciência** (base do Korvo + rascunhos aprovados), mais a publicação web                                                | Não                                 | Acesso ao GitHub (push e CI); aprovação editorial |
| _Trilha Android_               | Tauri 2 → APK no GitHub Releases (Obtainium) → F-Droid                                                                                                                     | Não                                 | MVP web publicado                                 |
| **Fase 2 — Estudo**            | Matriz de direitos → leitura de documentos (CDC, Denzinger, concílios, Suma, catecismos, só nas edições "verdes") → busca → comparação em painéis → sinopse dos Evangelhos | Não (índice estático; ADR de busca) | Matriz de direitos                                |
| **Fase 3 — Loja**              | Missais e breviários próprios (Typst, impressão), primeiro por pré-venda/encomenda com contato ou pagamento externo; depois, vitrines de outros vendedores                 | Talvez (pedidos)                    | Edição de referência; entidade jurídica e fiscal  |
| **Fase 4 — Conexões externas** | Pedidos de oração (exibição passiva do canal), novenas, demais ideias                                                                                                      | Talvez                              | Consentimentos; bot                               |

---

## 4. MVP em detalhe

### 4.1 Terço (porta do `terco-diario`, commit `e4cbfd6`)

**Escopo**

- Terço do dia e rosário inteiro (15 ou 20 mistérios, conforme o Korvo).
- Seletor de séries e esquemas de dias "2002" e "Montfort".
- Orações iniciais e finais configuráveis (padrão de Montfort) e jaculatórias configuráveis (9).
- Por dezena: anúncio, fruto, perícope, oferecimento, intenção do Pai-Nosso, 10 Ave-Marias e fecho.
- Aviso nos luminosos.
- Alternância PT/LA.
- Toggles: meditações de Montfort, rosário das cláusulas, texto completo, atalhos Vim.
- Progresso do dia e preferências salvos no aparelho, com botão "limpar". **Intenções particulares só em memória**, a menos que o usuário peça para lembrar.

**Mudanças sobre o Korvo, que precisam de aprovação**

- "Método abreviado" vira **"rosário das cláusulas"**.
- Cláusulas como regra nos luminosos, conforme a orientação de vocês.
- **Rotação diária de perícopes:**
  - o modelo aceita N perícopes por mistério;
  - o MVP sai com a perícope atual do Korvo;
  - a rotação liga quando vocês cadastrarem mais.
- Revisão das jaculatórias finais.
- Vim com alternância, por causa da WCAG 2.1.4. O Korvo já usa `j`/`k` sempre ligados.
- Animação discreta das contas, desligada com `prefers-reduced-motion`.
- Layout horizontal em telas grandes.

**Conteúdo**

- Extração **estática** dos dados do `index.html` do Korvo: um parser de JS, sem executar o arquivo, usado uma única vez e fora das dependências do projeto.
- Destino: `content/terco/{oracoes,misterios,jaculatorias,esquemas,clausulas}.ts`, com `pt` e `la` (o latim vem da tabela `TRAD_DADOS`).
- `SOURCES.md` registra o commit de origem e a autorização (Q5).
- O inglês fica para depois.

**Rotas**

- `/terco`: menu e "terço de hoje", calculado no cliente.
- `/terco/[serie]`: 4 páginas pré-renderizadas.
- `/terco/rosario`.
- O conteúdo de cada série e de cada idioma é carregado sob demanda.

**Fora do MVP:** Via Sacra, Seleta, outros terços, Ladainha, imagens sacras (o Korvo não tem; entram com procedência numa CHG própria) e intenções do Telegram.

**Identidade visual:** a do Korvo.

- Cormorant Garamond auto-hospedada. Se o texto corrido ficar pouco legível, avalio uma serifada de leitura.
- Acento de cor por série.
- Logo do corvo em **SVG**. Peço o vetor original ao Korvo; os PNGs atuais somam ~210 KB.

### 4.2 Exame de consciência

**Base aprovada:** o exame simples do Korvo.

- 9 seções (8 grupos de mandamentos e "Omissões"), 37 itens.
- Cada item tem pergunta, frase de acusação, nota pastoral opcional e marcação "pode ser matéria grave".
- Um ato de contrição.
- Atos adicionais virão das orações de "Penitência e confissão" da Seleta do Korvo, que são autorizadas.

**Expansão por rascunho assistido, como você decidiu**

1. **Matriz de lacunas** (`docs/editorial/exame-matriz.md`): só tópicos e estrutura dos PDFs que o Korvo não cobre. **Sem frases dos PDFs.** Exemplos:
   - perguntas iniciais (tempo desde a última confissão, confissão mal feita, estado de vida);
   - 5 preceitos da Igreja;
   - pecados capitais;
   - itens por estado de vida (casados, pais, namorados e noivos, trabalho);
   - roteiro do confessionário;
   - condições do pecado mortal;
   - modo "exame breve" (pensamentos, palavras, obras).
2. **Rascunhos meus**, com redação própria no estilo dos itens do Korvo:
   - campos `status: 'em-revisao'` e `origem: 'rascunho-assistido'`;
   - marcação de gravidade como **proposta**, a validar.
   - **Não redijo** orações, atos de contrição, citações nem atribuições. Esses textos vêm só de fontes tradicionais com procedência.
3. **Aprovação item a item** por `garamogger` ou `williamdasilvazoia8-blip` no PR. A porta editorial impede publicar item não aprovado.
4. Pendências editoriais novas:
   - **E15:** disciplina vigente;
   - **E16:** itens de posição política;
   - **E17:** orientação para escrupulosos;
   - **E18:** linguagem dos itens do 6º e 9º mandamentos, com discrição e uso possível por adolescentes.

**Funcionalidades**

- Itens organizados pelos Dez Mandamentos, mais preceitos e capitais quando aprovados.
- Para cada item, uma caixa de seleção e campos opcionais: número de vezes, descrição e circunstâncias.
- Dados opcionais para o confessor: estado de vida, vocação, tempo desde a última confissão.
- Filtro por estado de vida.
- Atos de contrição selecionáveis.
- Resumo para imprimir, gerado localmente (graves primeiro, como o Korvo já faz).
- Avisos pastorais.

**Privacidade:** a arquitetura da rev. 1 (§3.5), com **ADR-0004** e uma suíte de testes própria.

- Nada é salvo nem enviado, e a CSP da página tem `connect-src 'none'`.
- Lint proíbe APIs de rede e de armazenamento no módulo.
- Campos com `autocomplete`, `spellcheck` e `translate` desligados.
- Estado apagado no `pagehide` e botão "Apagar tudo".
- Impressão via `@media print`.
- Teste E2E: zero requisições depois do carregamento e armazenamento **inalterado** antes e depois do uso.

---

## 5. Roadmap e próximas changes

| Change                                          | Escopo                                                                                                                                                                                                                                                                                                                                            | Critério de conclusão                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **CHG-0001b** — fechar a fundação               | Commit das correções da revisão já validadas, mais documentos atualizados: ADR-0001 aceito (tudo GPL, distribuição), emenda ao ADR-0003, pendências (responsáveis, base do Korvo, E15–E18), `proposta-arquitetura.md` com a rev. 2, README (fases), CONTRIBUTING (REUSE no CI, responsáveis), CHG-0001 (revisão, contagens), `budgets.md` (50 KB) | `pnpm verify` + `reuse lint` verdes em clone limpo, Node 22 e Node 26         |
| **CHG-0002** — importação do conteúdo do Terço  | `content/terco/*` (PT + LA), `SOURCES.md`, anotação REUSE, testes de integridade (5 dezenas por série, 10 pontos onde houver, todo texto com PT; LA onde o Korvo tem)                                                                                                                                                                             | Conferência de amostras com o original; aprovação no PR                       |
| **CHG-0003** — domínio do Terço                 | `src/lib/modules/terco/domain/` puro: sequência, navegação, esquema por data, perícope do dia, mapa de teclas                                                                                                                                                                                                                                     | Testes unitários cobrindo todos os toggles e esquemas                         |
| **CHG-0004** — interface do Terço               | `state/`, `ui/`, rotas, preferências, atalhos com alternância, acessibilidade, identidade visual                                                                                                                                                                                                                                                  | E2E (teclado, toque, leitor de tela via axe), orçamento de JS ≤ 50 KB na rota |
| **CHG-0005** — conteúdo do Exame                | Importação dos 37 itens do Korvo + matriz de lacunas + rascunhos `em-revisao`                                                                                                                                                                                                                                                                     | Itens publicados = só os aprovados                                            |
| **CHG-0006** — interface e privacidade do Exame | UI, impressão, ADR-0004, suíte de privacidade                                                                                                                                                                                                                                                                                                     | Suíte verde em Chromium, Firefox e WebKit + checklist manual                  |
| **CHG-0007** — publicação web                   | Host (recomendo GitHub Pages, onde o Korvo já está), domínio, PWA mínimo (offline do Terço e do Exame)                                                                                                                                                                                                                                            | Deploy **só com sua aprovação**                                               |

Depois do MVP vêm a trilha Android (spike Tauri → GitHub Releases → F-Droid) e a Fase 2, começando pela matriz de direitos.

## 6. Bloqueios

- **Push e CI:** reconectar o GitHub em https://claude.ai/connect-github. Se o app do Claude não estiver instalado na organização `catoolicas`, um administrador precisa instalá-lo.
  - Até lá, os commits existem só neste contêiner e se perdem se a sessão for encerrada.
- **Vetor do logo e confirmação da "fonte única":** com o Korvo, antes da CHG-0004.

## Verificação

- **Em cada change:**
  - `pnpm verify` (tipos, lint, unitários, build, orçamento, licenças, E2E no servidor estático estrito) e `reuse lint`;
  - clone limpo com `--frozen-lockfile`;
  - Node 22 e 26;
  - os resultados medidos ficam registrados na CHG.
- **Terço:**
  - conferência de amostras do conteúdo importado contra o `index.html` original;
  - E2E rezando um terço completo só com teclado e só com toque;
  - axe nos temas claro e escuro;
  - orçamento por rota.
- **Exame:**
  - suíte de privacidade (rede, armazenamento, CSP com `fetch` forçado, atributos dos campos);
  - teste de mutação provando que a suíte falha quando deve;
  - checklist manual em Firefox e Safari.
- **Firefox e WebKit:** só depois que o CI rodar, o que depende do acesso ao GitHub.

## Fontes

- Lei 9.610/98 (direitos autorais, art. 41): https://www.planalto.gov.br/ccivil_03/leis/l9610.htm
- LEV (direitos sobre textos pontifícios): https://www.vatican.va/roman_curia/institutions_connected/lev/docs_lev/copyright_po.htm
- Denzinger, edições antigas: https://onlinebooks.library.upenn.edu/webbin/who/Denzinger%2c%20Heinrich%2c%201819%2d1883
- F-Droid (build a partir do código-fonte): https://f-droid.org/en/docs/ · Node em apps no F-Droid (2020): https://f-droid.org/ar/2020/10/14/adding-react-native-app-to-f-droid.html
- Referência: https://github.com/garamogger/terco-diario
