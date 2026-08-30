/**
 * El hero.
 *
 * Sigue el `hero-firma.html` que pasó la pareja: los nombres en caligráfica, la
 * fecha arriba en versalitas espaciadas, y «NOS CASAMOS» abajo entre dos filetes.
 *
 * El cambio de fondo respecto al lockup anterior: los nombres dejan de ser
 * capitales talladas y pasan a ser una **firma**. Eso reordena la jerarquía —
 * antes mandaba la fecha en romanos, ahora mandan ellos dos.
 *
 * La entrada escalonada (fecha → nombres → filetes → cuenta) sale del mismo
 * archivo y encaja con la aparición de las estrellas: el cielo se llena mientras
 * el texto sube.
 */
export function Hero({ daysAway }: { daysAway: number }) {
  return (
    <div className="text-center" data-sky-guard>
      <p
        className="font-body text-[0.6rem] font-light uppercase tracking-[0.4em] text-luz motion-safe:animate-[sube_900ms_cubic-bezier(.25,.8,.3,1)_both]"
      >
        7 de noviembre de 2026
      </p>

      <h1
        className="mb-1.5 mt-[0.4em] font-script text-[clamp(3rem,13vw,5.4rem)] leading-[1.05] text-luz motion-safe:animate-[sube_900ms_cubic-bezier(.25,.8,.3,1)_150ms_both]"
        style={{ textShadow: '0 0 34px rgba(255, 201, 122, 0.28)' }}
      >
        <span className="sr-only">Dayona y Javier</span>
        <span aria-hidden="true">
          Dayona
          <br />y Javier
        </span>
      </h1>

      <p
        aria-hidden="true"
        className="mt-7 flex items-center justify-center gap-3.5 font-body text-[0.62rem] font-light tracking-[0.34em] text-hueso/60 motion-safe:animate-[sube_900ms_cubic-bezier(.25,.8,.3,1)_450ms_both]"
      >
        <i className="block h-px w-9 bg-oro/60" />
        NOS CASAMOS
        <i className="block h-px w-9 bg-oro/60" />
      </p>

      <p className="mt-8 font-display text-lg tracking-wide text-hueso/60 motion-safe:animate-[sube_900ms_cubic-bezier(.25,.8,.3,1)_650ms_both]">
        {daysAway > 1
          ? `Faltan ${daysAway} días`
          : daysAway === 1
            ? 'Falta 1 día'
            : daysAway === 0
              ? 'Es hoy'
              : 'Gracias por acompañarnos'}
      </p>
    </div>
  );
}
