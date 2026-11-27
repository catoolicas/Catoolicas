<script lang="ts">
	import { onMount } from 'svelte';
	import { registrarServiceWorker } from '#lib/sw/registrar.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Uso sem internet: a primeira visita ao Terço guarda o site no aparelho (ADR-0005).
	onMount(registrarServiceWorker);
</script>

{@render children()}
