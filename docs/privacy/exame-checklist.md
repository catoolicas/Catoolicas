# Checklist manual de privacidade do Exame

O que a suíte automática (`tests/e2e/exame.e2e.ts`) **não alcança**: comportamentos de navegadores reais, teclados de celular e extensões. Fundamento em [ADR-0004](../adr/0004-privacidade-exame.md).

- **Como usar:** em cada verificação, marque um item grave e um leve, escreva "umas 3" em "quantas vezes" e "dois meses" em "tempo desde a última confissão". Depois faça o que a linha pede.
- **Como registrar:** data, navegador e versão, aparelho e sistema, resultado (**ok** ou **falhou**, com o que se viu).
- **Status inicial:** nenhuma linha foi executada. Tudo está **não verificado**. Não marque como verificado o que não foi feito.

## Restauração pelo navegador

| #   | Verificação                                                                                          | Esperado                                                           | Resultado          |
| --- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------ |
| R1  | Firefox (desktop): recarregar com F5 e com Ctrl+Shift+R                                              | nada marcado, campos vazios                                        | **não verificado** |
| R2  | Firefox: fechar a aba e reabrir com Ctrl+Shift+T                                                     | nada marcado, campos vazios                                        | **não verificado** |
| R3  | Firefox: encerrar à força e "restaurar sessão anterior"                                              | nada marcado, campos vazios                                        | **não verificado** |
| R4  | Chrome (desktop): fechar a aba e reabrir com Ctrl+Shift+T                                            | nada marcado, campos vazios                                        | **não verificado** |
| R5  | Safari (iOS): ir para "Sobre" e voltar com o gesto de voltar                                         | nada marcado, campos vazios                                        | **não verificado** |
| R6  | Chrome (Android): trocar de app, voltar depois de alguns minutos                                     | se a aba foi descartada e recarregada: vazio                       | **não verificado** |
| R7  | Firefox e Chrome: voltar e avançar pelo histórico várias vezes                                       | nada marcado, campos vazios                                        | **não verificado** |
| R8  | Firefox com JavaScript desligado (`javascript.enabled` = false) e Tor Browser no nível "Mais seguro" | aviso do `<noscript>` visível no topo; caixas e campos desativados | **não verificado** |

## Teclados, autopreenchimento e extensões

| #   | Verificação                                                               | Esperado                                                | Resultado          |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------ |
| T1  | Gboard (Android): digitar nos campos; depois, em outro app, ver sugestões | sem correção nem sugestão; a palavra não aparece depois | **não verificado** |
| T2  | Teclado Samsung: o mesmo de T1                                            | idem                                                    | **não verificado** |
| T3  | Teclado do iOS (texto preditivo ligado): o mesmo de T1                    | idem                                                    | **não verificado** |
| T4  | Chrome e Firefox: clicar nos campos de texto                              | nenhuma lista de preenchimento automático               | **não verificado** |
| T5  | 1Password, Bitwarden ou LastPass instalados: focar e digitar nos campos   | nenhum ícone e nenhuma oferta de salvar                 | **não verificado** |
| T6  | Grammarly ou LanguageTool instalados: digitar nos campos                  | nenhuma correção nem sublinhado                         | **não verificado** |
| T7  | Chrome: "Traduzir esta página" para o inglês                              | a "Minha lista" e os campos continuam em português      | **não verificado** |

## Impressão

| #   | Verificação                                                 | Esperado                                                             | Resultado          |
| --- | ----------------------------------------------------------- | -------------------------------------------------------------------- | ------------------ |
| I1  | Chrome, Firefox e Safari: "Imprimir", só a pré-visualização | só o título e a lista; sem cabeçalho, rodapé, aviso, itens ou botões | **não verificado** |
| I2  | Android: imprimir para PDF                                  | idem; o arquivo é salvo **por escolha da pessoa** (está no aviso)    | **não verificado** |

## Acessibilidade com leitor de tela

| #   | Verificação                                          | Esperado                                                  | Resultado          |
| --- | ---------------------------------------------------- | --------------------------------------------------------- | ------------------ |
| A1  | NVDA + Firefox: percorrer, marcar, preencher, apagar | perguntas lidas com a nota; "Tudo foi apagado." anunciado | **não verificado** |
| A2  | VoiceOver (iOS) e TalkBack (Android): o mesmo de A1  | idem                                                      | **não verificado** |

## Registro de execuções

| Data | Quem | Linhas executadas | Observações |
| ---- | ---- | ----------------- | ----------- |
| —    | —    | —                 | —           |
