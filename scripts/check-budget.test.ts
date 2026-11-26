import { describe, expect, it } from 'vitest';
import { avaliar, extrairRecursos, limitesPara, type Orcamento } from './check-budget.ts';

describe('extrairRecursos', () => {
	it('encontra JS de modulepreload, <script src> e import() inline, e CSS de stylesheet, em qualquer ordem de atributos', () => {
		const html = `
			<link href="./_app/a.js" rel="modulepreload">
			<link rel="modulepreload" href="./_app/b.js">
			<link href="./_app/estilo.css" rel="stylesheet">
			<link rel="icon" href="./favicon.svg">
			<script type="module" src="./_app/c.js"></script>
			<script>Promise.all([import('./_app/d.js'), import("./_app/e.js")])</script>`;
		expect(extrairRecursos(html)).toEqual({
			js: ['./_app/a.js', './_app/b.js', './_app/c.js', './_app/d.js', './_app/e.js'],
			css: ['./_app/estilo.css']
		});
	});

	it('conta preload as=script e as=style, mas não outros preloads', () => {
		const html = `
			<link rel="preload" as="script" href="s.js">
			<link rel="preload" as="style" href="e.css">
			<link rel="preload" as="font" href="f.woff2">`;
		expect(extrairRecursos(html)).toEqual({ js: ['s.js'], css: ['e.css'] });
	});

	it('lê atributos com aspas simples ou sem aspas (HTML minificado)', () => {
		const html = `<link rel=modulepreload href=a.js><link rel='stylesheet' href='b.css'><script src=c.js></script>`;
		expect(extrairRecursos(html)).toEqual({ js: ['a.js', 'c.js'], css: ['b.css'] });
	});

	it('não conta o mesmo recurso duas vezes', () => {
		const html = '<link rel="modulepreload" href="x.js"><link href="x.js" rel="modulepreload">';
		expect(extrairRecursos(html).js).toEqual(['x.js']);
	});

	it('retorna listas vazias para página sem JS nem CSS', () => {
		expect(extrairRecursos('<html><body><p>oi</p></body></html>')).toEqual({ js: [], css: [] });
	});
});

describe('avaliar', () => {
	const orcamento: Orcamento = {
		padrao: { htmlGzip: 100, jsGzip: 200, cssGzip: 50 },
		paginas: { 'estatica.html': { jsGzip: 0 } }
	};

	it('aplica limites específicos da página sobre o padrão', () => {
		expect(limitesPara('estatica.html', orcamento)).toEqual({
			htmlGzip: 100,
			jsGzip: 0,
			cssGzip: 50
		});
		expect(limitesPara('outra.html', orcamento)).toEqual(orcamento.padrao);
	});

	it('aceita medições dentro do limite (inclusive iguais ao limite)', () => {
		expect(
			avaliar([{ pagina: 'outra.html', htmlGzip: 100, jsGzip: 200, cssGzip: 50 }], orcamento)
		).toEqual([]);
	});

	it('aponta cada métrica excedida', () => {
		expect(
			avaliar(
				[
					{ pagina: 'estatica.html', htmlGzip: 10, jsGzip: 1, cssGzip: 10 },
					{ pagina: 'outra.html', htmlGzip: 101, jsGzip: 10, cssGzip: 51 }
				],
				orcamento
			)
		).toEqual([
			{ pagina: 'estatica.html', metrica: 'jsGzip', medido: 1, limite: 0 },
			{ pagina: 'outra.html', metrica: 'htmlGzip', medido: 101, limite: 100 },
			{ pagina: 'outra.html', metrica: 'cssGzip', medido: 51, limite: 50 }
		]);
	});
});
