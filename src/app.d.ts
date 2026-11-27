// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// O compilador do Svelte trata qualquer evento terminado em "capture" como ouvinte de captura,
// mas os tipos de <svelte:window> não listam este. O Exame o usa para isolar o roteador do
// SvelteKit (ADR-0004).
import type { EventHandler } from 'svelte/elements';

declare module 'svelte/elements' {
	interface SvelteWindowAttributes {
		onbeforeunloadcapture?: EventHandler<BeforeUnloadEvent, Window> | undefined | null;
	}
}

export {};
