/**
 * El lockup de nombres.
 *
 * DAYONA y JAVIER tienen exactamente 6 letras cada uno, así que con el mismo
 * tracking los dos bloques salen ópticamente idénticos sin ajustes a mano.
 *
 * Dos detalles que no son capricho:
 *
 * 1. `-me-[0.18em]`: `letter-spacing` agrega el espacio también DESPUÉS de la
 *    última letra, y eso corre el bloque a la izquierda del centro. Restar un
 *    tracking al final lo devuelve a su sitio.
 *
 * 2. La capa visual va `aria-hidden` y al lado viaja una versión hablada. Un
 *    lector de pantalla leería el numeral romano como "cero siete equis i eme
 *    eme equis equis vi". Lo que debe oírse es la fecha.
 */

// Compensa el tracking sobrante del último carácter.
const TRIM = '-me-[0.18em]';
const NAME = `block text-[clamp(2.25rem,12vw,5.5rem)] tracking-lockup ${TRIM}`;

export function Lockup({ className = '' }: { className?: string }) {
  return (
    <div className={`text-center ${className}`} data-sky-guard>
      <h1 className="font-display font-normal leading-[1.05]">
        <span className="sr-only">Dayona y Javier · 7 de noviembre de 2026</span>

        <span aria-hidden="true">
          <span className={NAME}>DAYONA</span>
          <span className="block text-luz text-[clamp(1.1rem,5vw,2.25rem)] leading-none my-[0.35em]">
            &amp;
          </span>
          <span className={NAME}>JAVIER</span>
        </span>
      </h1>

      <div aria-hidden="true">
        {/* Filete de tinta. Ancho en em para que escale con la tipografía. */}
        <div className="mx-auto mt-[1.1em] h-px w-[9em] bg-oro" />

        <p
          className={`mt-[1.1em] font-body text-[clamp(0.7rem,3vw,0.9rem)] font-light tracking-eyebrow text-hueso/60 ${TRIM}`}
        >
          07 · XI · MMXXVI
        </p>
      </div>
    </div>
  );
}
