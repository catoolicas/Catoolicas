/**
 * Política de segurança de conteúdo **adicional** da página do exame (ADR-0004).
 *
 * Vai numa segunda `<meta http-equiv="Content-Security-Policy">` e vale **somada** à política
 * global (vite.config.ts): o navegador exige que as duas permitam cada pedido. Por isso só tem
 * diretivas que restringem mais; script-src e style-src continuam vindo da global, com os hashes.
 *
 * - connect-src 'none': fetch, XMLHttpRequest, WebSocket, EventSource e sendBeacon são bloqueados.
 * - form-action 'none': nenhum envio de formulário (a página também não tem <form>).
 * - frame-src, worker-src, media-src, manifest-src 'none': nada disso é usado.
 *
 * img-src e font-src continuam 'self' (o ícone do site e, no futuro, as fontes): a página não
 * carrega imagens nem fontes depois de aberta, o que a suíte de privacidade confere.
 */
export const CSP_DO_EXAME = [
	"connect-src 'none'",
	"form-action 'none'",
	"frame-src 'none'",
	"worker-src 'none'",
	"media-src 'none'",
	"manifest-src 'none'"
].join('; ');
