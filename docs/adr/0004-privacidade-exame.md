# ADR-0004 — Privacidade do Exame de consciência

- **Status:** Aceito (plano aprovado em 26/11/2026; implementado na CHG-0006)
- **Data:** 26/11/2026
- **Requisito de origem (pedido dos responsáveis):** "Nenhuma informação inserida ou selecionada no exame poderá ser transmitida ao servidor, registrada em logs, enviada a serviços analíticos ou persistida automaticamente. A funcionalidade deverá operar localmente na memória do navegador durante a sessão. Não utilizar localStorage, sessionStorage, IndexedDB, cookies ou bancos remotos para armazenar o conteúdo do exame. A impressão deverá ser gerada localmente."

## Contexto

O exame lida com o dado mais sensível do projeto: pecados que a pessoa reconhece. Pela LGPD, convicção religiosa é dado sensível (art. 5º, II). O site é estático (ADR-0002), sem servidor próprio nem análise de audiência. Mesmo assim, um dado pode escapar da memória da página por vários caminhos.

## Modelo de ameaças

| Caminho por onde o dado poderia sair                                      | Quem causaria                           | Barreira                                                                                                                                 |
| ------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Rede: fetch, XMLHttpRequest, WebSocket, EventSource, sendBeacon           | código do projeto ou de uma dependência | CSP própria da página (`connect-src 'none'`), regras de lint, E2E "nenhuma requisição"                                                   |
| Requisição à própria origem (imagem, navegação com dados na URL)          | código do projeto                       | lint (`Image`, `location`, `open` proibidos); E2E "nenhuma requisição". A CSP não bloqueia, porque o ícone do site usa `img-src 'self'`. |
| Armazenamento: localStorage, sessionStorage, IndexedDB, Cache, cookies    | código do projeto                       | lint; E2E compara tudo antes e depois                                                                                                    |
| Histórico, URL, título, `window.name`                                     | código (por exemplo, roteamento raso)   | lint (`history`, `$app/navigation` proibidos); E2E compara URL, título, `history.length`, `history.state` e `window.name`                |
| Console e logs                                                            | código do projeto                       | lint (`no-console`)                                                                                                                      |
| Restauração de formulário pelo navegador (recarregar, voltar)             | o navegador                             | `autocomplete="off"` em todo campo; valores de mão única (o estado manda no campo na hidratação); E2E simula a restauração               |
| Cache de navegação (bfcache) guardando a página com as marcações          | o navegador                             | `pagehide` e `pageshow` (persisted) zeram o estado; entrada e saída do exame com carga completa da página                                |
| Autopreenchimento, corretor, sugestões de escrita, gerenciadores de senha | navegador, teclado, extensões           | atributos de "não use" em todo campo (`campos.ts`), sem `name` e sem `<form>`. **São pedidos, não garantias.**                           |
| Tradução automática                                                       | navegador                               | `translate="no"` nos campos e na "Minha lista". **Pedido, não garantia.**                                                                |
| Rascunhos em revisão publicados por engano                                | processo editorial                      | o build de produção nem inclui `rascunhos.ts` (só `rascunhos-aprovados.ts`, gerado); E2E procura os textos em revisão no HTML e no JS    |

**Fora do alcance da página, e dito no aviso de privacidade:** extensões instaladas (leem qualquer página), teclados que ignoram os pedidos, o que for impresso ou salvo em PDF, o histórico registrar que a página foi aberta, o registro de acesso do GitHub Pages (IP e endereço da página, nunca o conteúdo) e quem estiver com o aparelho.

## Decisão

1. **Estado só na memória da página.**
   - `EstadoExame` (`state/exame.svelte.ts`) é criado pelo componente da página, nunca como singleton de módulo.
   - Nada vai para armazenamento, URL, título, histórico ou rede.
   - `limpar()` volta tudo ao início. É chamado pelo botão "Apagar tudo agora" (sem confirmação: serve para apagar na hora), no `pagehide` e no `pageshow` vindo do cache de navegação.
2. **CSP adicional na página** (`csp.ts`), numa segunda `<meta>`:
   - `connect-src 'none'; form-action 'none'; frame-src 'none'; worker-src 'none'; media-src 'none'; manifest-src 'none'`;
   - vale somada à global, por isso só restringe; scripts e estilos continuam autorizados pelos hashes da global.
3. **Carga completa ao entrar e ao sair** (`data-sveltekit-reload`):
   - ao entrar, a página começa do zero e já com a CSP própria no HTML;
   - ao sair, a memória do exame é descartada inteira, e a CSP restritiva não continua valendo em outra página;
   - links com recarga não são pré-carregados pelo SvelteKit.
4. **Campos** (`CaixaPrivada`, `TextoPrivado` e o seletor do ato):
   - atributos literais: `autocomplete="off"`, `spellcheck="false"`, `autocorrect="off"`, `autocapitalize="off"`, `writingsuggestions="false"`, `translate="no"` e as marcações documentadas por 1Password, LastPass, Bitwarden, Dashlane, Grammarly e LanguageTool;
   - escritos no HTML pré-renderizado, isto é, antes de qualquer restauração do navegador;
   - **valores de mão única** (`checked={...}`, `value={...}`, sem `bind:`): na hidratação, `bind:value` e `bind:checked` adotariam um valor restaurado pelo navegador, enquanto o valor de mão única é sobrescrito pelo estado. O seletor do ato é sincronizado por um `$effect`.
5. **Regras de lint** em `src/lib/modules/exame/**` e `src/routes/exame/**` (`scripts/eslint-privacidade.ts`):
   - globais e propriedades de rede, armazenamento, histórico e outras janelas proibidas;
   - `no-console` e `eval`;
   - `bind:` (exceto `bind:this`), `<form>` e atributo `name`;
   - import dinâmico só de `#content/exame/`;
   - **lista do que pode ser importado** (`svelte`, `$app/environment|paths|state`, o próprio módulo e o seu conteúdo): qualquer dependência nova passa por revisão e muda esta regra explicitamente.
   - Ficam de fora os testes unitários (rodam no Node).
   - As regras são uma barreira contra descuidos, não uma caixa de areia: código feito para burlá-las ainda é possível. Por isso há a CSP e a suíte E2E, que mede o comportamento real.
6. **Impressão** por `@media print`: a página esconde tudo menos o título e a lista. Sem iframe, sem biblioteca, sem gerar arquivo.
7. **O exame não é a confissão:** a página diz isso e não dá "aconselhamento" automático. A lista só reúne o que a pessoa marcou, com os textos aprovados.

## Consequências

- **Mais garantias verificáveis:** cada barreira tem teste, e cada teste foi validado por mutação (CHG-0006).
- **Desenvolvimento:** na página do exame, o recarregamento automático do Vite (HMR) não funciona, porque a CSP bloqueia o WebSocket dele. É preciso recarregar a página à mão.
- **Peso:** os atributos literais (em vez de `{...CAMPO_PRIVADO}`) e o seletor sem `value` evitam o código genérico de atributos do Svelte, que acrescentaria ~2,5 KB ao JS **de todas as páginas interativas** (medido).
- **Dependências:** qualquer biblioteca no exame exige mudar a lista do lint. É de propósito.
- **Limites:** o que depende do navegador, do teclado ou de extensões não pode ser garantido. Está no aviso e no checklist manual (`docs/privacy/exame-checklist.md`).
