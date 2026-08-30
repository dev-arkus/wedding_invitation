/**
 * Monograma D & J.
 *
 * Tipográfico, no dibujado: es la misma Bodoni del lockup, así que hereda el
 * mismo carácter sin mantener un SVG aparte que se desincronice.
 *
 * Se usa en el 404 y al pie de la imagen recuerdo. Para el favicon NO sirve:
 * a 16px tres letras con filete son una mancha. Ahí va `app/icon.svg`.
 */
export function Monogram({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline font-display leading-none ${className}`}
      role="img"
      aria-label="Dayona y Javier"
    >
      <span aria-hidden="true">D</span>
      <span aria-hidden="true" className="mx-[0.28em] text-luz text-[0.62em]">
        &amp;
      </span>
      <span aria-hidden="true">J</span>
    </span>
  );
}
