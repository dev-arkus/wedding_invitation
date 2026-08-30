import { Marcellus, Jost } from 'next/font/google';

/**
 * Dos familias, subset latino.
 *
 * ── Por qué NO Bodoni Moda ───────────────────────────────────────────────────
 * Era la elección original, por el argumento de que sus trazos finos tienen el
 * grosor de los cables de luz del techo de la recepción. Se ve precioso a 88px.
 *
 * Pero una didone es una tipografía de DISPLAY: su contraste extremo entre
 * grueso y fino la vuelve difícil de leer en cuanto baja de tamaño, y sobre
 * fondo oscuro los pelos se comen directamente. Los nombres de los invitados a
 * 20px se leían mal. La legibilidad de un texto que la gente tiene que leer para
 * decidir algo vale más que una metáfora bonita.
 *
 * ── Por qué Marcellus ────────────────────────────────────────────────────────
 * Es capital romana de inscripción: la letra que se talla en piedra. Trazo
 * parejo, así que aguanta a cualquier tamaño y sobre cualquier fondo.
 *
 * Y encaja mejor con lo que ya había: los marcadores de sección son numerales
 * romanos (`VI · 00`, `VIII · 00`), y la misa es en una iglesia. Una letra
 * lapidaria pertenece a ese mundo mucho más que una didone de moda francesa.
 *
 * De paso pesa menos: es estática de un solo peso, no variable.
 *
 * Jost se queda para etiquetas, botones y texto corrido: geométrica de los años
 * treinta, y sobre fondo oscuro una sans de bajo contraste se lee mucho mejor
 * que una garalda, que a cuerpo pequeño titila.
 */

export const display = Marcellus({
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

export const fontVariables = `${display.variable} ${body.variable}`;
