'use client';

import { useState } from 'react';
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
 * Se exige marcar a TODOS antes de enviar. Es lo que permite distinguir "no
 * viene" de "no respondió" — sin eso, una invitación a medias es indistinguible
 * de una que nadie abrió, y la planner no sabría a quién llamar.
 *
 * Esa regla se valida aquí para dar una respuesta inmediata y se vuelve a
 * validar en el servidor, que es el que manda.
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

  const pending = guests.filter((g) => answers[g.id] !== 'si' && answers[g.id] !== 'no');

  function choose(id: string, status: 'si' | 'no') {
    setAnswers((prev) => ({ ...prev, [id]: status }));
    setError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (pending.length > 0) {
      setShowMissing(true);
      setError(copy.errors.incomplete(joinNames(pending.map((g) => g.name))));
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
    return <Confirmed attending={attending} total={guests.length} />;
  }

  const saving = phase === 'saving';

  return (
    <form onSubmit={submit} noValidate>
      <p className="font-body text-base font-light leading-relaxed text-hueso/80">
        {copy.rsvp.intro(guests.length)}
      </p>
      <p className="mt-1 font-body text-base font-light leading-relaxed text-hueso/80">
        {copy.rsvp.instruction(guests.length)}
      </p>

      <div className="mt-8">
        {guests.map((guest) => (
          <GuestChoice
            key={guest.id}
            id={guest.id}
            name={guest.name}
            value={answers[guest.id] ?? 'pendiente'}
            onChange={choose}
            missing={showMissing && pending.some((g) => g.id === guest.id)}
            disabled={saving}
          />
        ))}
      </div>

      {/* `aria-live` para que un lector de pantalla anuncie el fallo sin que el
          invitado tenga que ir a buscarlo. */}
      <p role="status" aria-live="polite" className="mt-6 min-h-[1.5rem] font-body text-sm text-luz">
        {error}
      </p>

      <button
        type="submit"
        disabled={saving}
        className="mt-2 min-h-[44px] w-full border border-oro px-6 py-3 font-body text-sm tracking-eyebrow text-hueso transition-colors hover:border-luz hover:text-luz disabled:opacity-50"
      >
        {saving ? 'Guardando…' : copy.rsvp.submit}
      </button>

      <p className="mt-6 font-body text-xs font-light leading-relaxed text-hueso/60">
        {copy.rsvp.editable}
      </p>
    </form>
  );
}

/**
 * Resultado.
 *
 * Nombra a quienes asisten y nunca a quienes no: en una boda esa lista se lee en
 * voz alta y de a varios.
 */
function Confirmed({ attending, total }: { attending: string[]; total: number }) {
  const message =
    attending.length === 0
      ? copy.results.none
      : attending.length === total
        ? copy.results.all
        : copy.results.partial(attending);

  return (
    <div role="status" aria-live="polite">
      {attending.length > 0 && <StarSpark />}

      <p className="mt-6 font-display text-[clamp(1.5rem,7vw,2rem)] leading-snug">{message}</p>

      <p className="mt-6 font-body text-xs font-light leading-relaxed text-hueso/60">
        {copy.rsvp.editable}
      </p>
    </div>
  );
}

/** Una estrella se enciende. Una sola vez, y se acabó. */
function StarSpark() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="motion-safe:animate-[spark_900ms_ease-out]"
    >
      <path
        d="M16 2 Q17.4 14.6 30 16 Q17.4 17.4 16 30 Q14.6 17.4 2 16 Q14.6 14.6 16 2 Z"
        fill="var(--luz)"
      />
    </svg>
  );
}
