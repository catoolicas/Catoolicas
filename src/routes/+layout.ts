// Toda rota é pré-renderizada (docs/adr/0002-estatico-primeiro.md).
// Não usar +page.server.ts / +layout.server.ts nas rotas do núcleo: quebraria a
// compatibilidade com hospedagem estática e com o futuro empacotamento em Tauri.
export const prerender = true;
