import { Parisienne, Italiana, Jost } from 'next/font/google';

/**
 * Tres familias, cada una con un trabajo que no comparte con las otras.
 *
 * ── Parisienne · solo los nombres del hero ───────────────────────────────────
 * Caligráfica. Aparece UNA vez en toda la invitación, a tamaño grande. Esa
 * restricción es lo que la salva: una cursiva repartida por la página se lee a
 * plantilla, pero como firma única funciona — porque eso es, una firma.
 *
 * ── Italiana · títulos y nombres de lugar ────────────────────────────────────
 * Romana de trazo fino y aire art déco. Solo se usa de 24px para arriba; por
 * debajo de eso volvería el problema que tuvimos con Bodoni.
 *
 * ── Jost · todo lo demás ─────────────────────────────────────────────────────
 * Texto corrido, etiquetas, botones y las cifras del contador. Geométrica de
 * bajo contraste: es la que aguanta los tamaños chicos sobre fondo oscuro, y la
 * única que toca texto que alguien tiene que leer para decidir algo.
 */

export const script = Parisienne({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-script',
});

export const display = Italiana({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-display',
});

export const body = Jost({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

export const fontVariables = `${script.variable} ${display.variable} ${body.variable}`;
