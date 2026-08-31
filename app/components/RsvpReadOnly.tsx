import { copy, joinNames } from '../lib/copy';
import type { Guest } from '../lib/registry';

/**
 * La invitación después del corte.
 *
 * La URL sigue viva y muestra la respuesta final, pero sin controles ni botón:
 * lo que no se puede cambiar no debe verse como si se pudiera. El servidor
 * rechazaría cualquier escritura de todas formas, pero ofrecer un control
 * muerto es peor que no ofrecerlo.
 */
export function RsvpReadOnly({ guests }: { guests: Guest[] }) {
  const attending = guests.filter((g) => g.status === 'si');
  const answered = guests.some((g) => g.status !== 'pendiente');

  return (
    <div>
      {answered ? (
        <p className="font-display text-[clamp(1.5rem,7vw,2rem)] leading-snug">
          {attending.length === 0
            ? copy.results.none
            : attending.length === guests.length
              ? copy.results.all
              : copy.results.partial(attending.map((g) => g.name))}
        </p>
      ) : (
        <p className="font-body text-base font-light leading-relaxed text-hueso/85">
          No alcanzamos a recibir tu respuesta.
        </p>
      )}

      <div aria-hidden="true" className="mt-8 h-px w-16 bg-oro" />

      <p className="mt-8 font-body text-sm font-light leading-relaxed text-hueso/65">
        {copy.frozen}
      </p>
    </div>
  );
}
