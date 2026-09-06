'use client';

import { useRef, useState } from 'react';
import { GuestChoice } from './GuestChoice';
import { copy, joinNames } from '../lib/copy';
import type { Guest, GuestStatus } from '../lib/registry';

export interface RsvpFormProps {
  token: string;
  guests: Guest[];
}

type Phase = 'editing' | 'saving' | 'saved';

/**
 * La confirmación.
 *
 * Estructura del `confirmacion-pases-final.html` de la pareja, con nuestros
 * colores: cada invitado es un pase numerado con talón perforado, y el titular
 * es cuántos pases trae la invitación.
 *
 * Se exige marcar a TODOS antes de enviar. Es lo que permite distinguir «no
 * viene» de «no respondió» — sin eso, una invitación a medias es indistinguible
 * de una que nadie abrió, y la planner no sabría a quién llamar. Se valida aquí
 * para responder al instante, y otra vez en el servidor, que es el que manda.
 */
export function RsvpForm({ token, guests }: RsvpFormProps) {
  const [answers, setAnswers] = useState<Record<string, GuestStatus>>(() =>
    // Arranca con lo que ya está en la hoja: si la planner marcó a alguien por
    // teléfono, el invitado lo ve reflejado al abrir.
    Object.fromEntries(guests.map((g) => [g.id, g.status])),
  );
  const [phase, setPhase] = useState<Phase>('editing');
  const [attending, setAttending] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showMissing, setShowMissing] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const pending = guests.filter((g) => answers[g.id] !== 'si' && answers[g.id] !== 'no');
  const going = guests.filter((g) => answers[g.id] === 'si');

  function choose(id: string, status: 'si' | 'no') {
    setAnswers((prev) => ({ ...prev, [id]: status }));
    setError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (pending.length > 0) {
      setShowMissing(true);
      setError(copy.errors.incomplete(joinNames(pending.map((g) => g.name))));
      // Además de decirlo, se lleva al invitado a la primera tarjeta que falta:
      // con varias personas, leer el aviso no basta para saber dónde mirar.
      listRef.current
        ?.querySelector(`[data-guest="${pending[0].id}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setPhase('saving');
    setError(null);

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          answers: guests.map((g) => ({ id: g.id, status: answers[g.id] })),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        // Se cerró la lista mientras tenía la página abierta.
        setError(data?.reason === 'closed' ? copy.frozen : copy.errors.save);
        setPhase('editing');
        return;
      }

      setAttending(data.attending ?? []);
      setPhase('saved');
    } catch {
      // Las selecciones se quedan en pantalla: no se pierde lo marcado y puede
      // reintentar sin volver a empezar.
      setError(copy.errors.save);
      setPhase('editing');
    }
  }

  if (phase === 'saved') {
    return (
      <Confirmed
        attending={attending}
        total={guests.length}
        onEdit={() => {
          setPhase('editing');
          setShowMissing(false);
        }}
      />
    );
  }

  const saving = phase === 'saving';

  return (
    <form onSubmit={submit} noValidate>
      <header className="text-center">
        <Ornamento />
        <p className="mt-4 font-body text-[0.68rem] font-normal uppercase tracking-[0.34em] text-luz">
          {copy.rsvp.epigrafe}
        </p>
        <p className="mt-2.5 font-display text-[clamp(1.75rem,7.5vw,2.4rem)] leading-tight tracking-[0.03em]">
          {copy.rsvp.pases(guests.length)}
        </p>
        <p className="mx-auto mt-3.5 max-w-[34ch] font-body text-[1rem] font-light leading-relaxed text-hueso/70">
          {copy.rsvp.ayuda(guests.length)}
        </p>
      </header>

      <div ref={listRef} className="mt-8 grid gap-4">
        {guests.map((guest, index) => (
          <div key={guest.id} data-guest={guest.id}>
            <GuestChoice
              id={guest.id}
              name={guest.name}
              kind={guest.kind}
              number={index + 1}
              value={answers[guest.id] ?? 'pendiente'}
              onChange={choose}
              missing={showMissing && pending.some((g) => g.id === guest.id)}
              disabled={saving}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        {/* El resumen solo aparece cuando ya no falta nadie: contar a medias
            distrae más de lo que informa. */}
        <p role="status" aria-live="polite" className="min-h-[1.75rem] font-body text-[0.95rem] text-hueso/70">
          {error ? <span className="text-luz">{error}</span> : summary(pending.length, going.length, guests.length)}
        </p>

        <button
          type="submit"
          disabled={saving}
          className="mt-3 min-h-[3.9rem] w-full rounded bg-luz px-6 font-body text-[1.1rem] font-medium text-noche transition-colors hover:bg-hueso disabled:opacity-50"
        >
          {saving ? 'Guardando…' : copy.rsvp.submit}
        </button>

        <p className="mt-5 font-body text-[0.85rem] font-light leading-relaxed text-hueso/60">
          {copy.rsvp.editable}
        </p>
      </div>
    </form>
  );
}

function summary(pending: number, going: number, total: number): string {
  if (pending > 0) return '';
  if (going === 0) return copy.rsvp.resumenNinguno;
  if (going === total) return copy.rsvp.resumenTodos(total);
  return copy.rsvp.resumenParcial(going, total);
}

/** Filete · rombo · filete. El mismo lenguaje de líneas finas del resto. */
function Ornamento() {
  return (
    <div aria-hidden="true" className="flex items-center justify-center gap-3">
      <i className="block h-px w-12 bg-oro/60" />
      <i className="block h-1.5 w-1.5 rotate-45 bg-oro" />
      <i className="block h-px w-12 bg-oro/60" />
    </div>
  );
}

/**
 * Resultado.
 *
 * Nombra a quienes asisten y nunca a quienes no: en una boda esa lista se lee
 * en voz alta y de a varios.
 *
 * «Cambiar mi respuesta» sale del ejemplo de la pareja y tapa un hueco real:
 * la spec dice que la respuesta es editable hasta el corte, pero antes de esto
 * no había forma de volver sin recargar la página.
 */
function Confirmed({
  attending,
  total,
  onEdit,
}: {
  attending: string[];
  total: number;
  onEdit: () => void;
}) {
  const message =
    attending.length === 0
      ? copy.results.none
      : attending.length === total
        ? copy.results.all
        : copy.results.partial(attending);

  return (
    <div role="status" aria-live="polite" className="py-6 text-center">
      {attending.length > 0 && (
        <span className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-oro">
          <StarSpark />
        </span>
      )}

      <p className="font-display text-[clamp(1.75rem,8vw,2.4rem)] leading-tight">¡Gracias!</p>

      <p className="mx-auto mt-4 max-w-[34ch] font-body text-[1rem] font-light leading-relaxed text-hueso/80">
        {message}
      </p>

      <button
        type="button"
        onClick={onEdit}
        className="mt-7 min-h-[3.25rem] rounded border-2 border-hueso/30 px-7 font-body text-[0.95rem] text-hueso/85 transition-colors hover:border-luz hover:text-luz"
      >
        Cambiar mi respuesta
      </button>

      <p className="mt-5 font-body text-[0.85rem] font-light leading-relaxed text-hueso/60">
        {copy.rsvp.editable}
      </p>
    </div>
  );
}

/** Una estrella se enciende. Una sola vez, y se acabó. */
function StarSpark() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="motion-safe:animate-[spark_900ms_ease-out]"
    >
      <path
        d="M16 2 Q17.4 14.6 30 16 Q17.4 17.4 16 30 Q14.6 17.4 2 16 Q14.6 14.6 16 2 Z"
        fill="var(--noche)"
      />
    </svg>
  );
}
