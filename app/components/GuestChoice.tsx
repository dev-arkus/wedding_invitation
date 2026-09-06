'use client';

import type { GuestKind, GuestStatus } from '../lib/registry';

export interface GuestChoiceProps {
  id: string;
  name: string;
  kind: GuestKind;
  /** Número de pase, empezando en 1. Va impreso en el talón. */
  number: number;
  value: GuestStatus;
  onChange: (id: string, status: 'si' | 'no') => void;
  /** Marca visible y accesible cuando falta responder por esta persona. */
  missing?: boolean;
  disabled?: boolean;
}

const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[19px] w-[19px] shrink-0 fill-none stroke-current stroke-[2.4]">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const Cross = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[19px] w-[19px] shrink-0 fill-none stroke-current stroke-[2.4]">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/**
 * Un pase.
 *
 * Estructura del `confirmacion-pases-final.html` de la pareja: cada invitado es
 * una entrada con su talón numerado a la izquierda, separado por una
 * perforación. Al marcar «Sí asiste», el talón se llena de dorado.
 *
 * La metáfora hace un trabajo que el texto no hacía: **un pase es intransferible
 * y va numerado**. Sin decir nada, la forma explica por qué los nombres vienen
 * puestos y no hay manera de sumar gente — que es la regla de negocio entera de
 * esta invitación.
 *
 * ── Detalles de la adaptación ────────────────────────────────────────────────
 * · La perforación se dibuja en `--noche`, no en el color de la tarjeta. Como la
 *   sección es transparente y deja ver el cielo, los huecos se leen como
 *   troquelados hasta la noche.
 * · Debajo siguen siendo radios nativos en un `fieldset`, no botones con
 *   `aria-pressed`. Se gana navegación con flechas y el nombre anunciado como
 *   etiqueta del grupo.
 * · El nombre va en Jost, no en la serif del ejemplo: es el dato que se lee para
 *   decidir, y ahí la claridad gana sobre el carácter.
 */
export function GuestChoice({
  id,
  name,
  kind,
  number,
  value,
  onChange,
  missing,
  disabled,
}: GuestChoiceProps) {
  const chosen = value === 'si' || value === 'no';

  return (
    <fieldset
      data-estado={value}
      data-aviso={missing || undefined}
      aria-invalid={missing || undefined}
      className={
        'overflow-hidden rounded-[5px] border bg-hueso/[0.06] backdrop-blur-[3px] ' +
        'transition-[opacity,border-color,box-shadow] duration-200 ' +
        'border-luz/25 ' +
        'data-[estado=si]:border-luz ' +
        'data-[estado=no]:opacity-60 ' +
        'data-[aviso]:shadow-[0_0_0_3px_rgb(var(--luz-rgb)/0.35)]'
      }
    >
      <legend className="sr-only">{name}</legend>

      <div className="grid grid-cols-[3.9rem_1fr] min-[27rem]:grid-cols-[4.6rem_1fr]">
        {/* ── el talón ── */}
        <div
          aria-hidden="true"
          className={
            'relative flex flex-col items-center justify-center gap-1 px-2 py-4 ' +
            'transition-colors duration-200 ' +
            (value === 'si' ? 'bg-luz text-noche' : 'bg-luz/[0.12] text-hueso')
          }
        >
          <span className="font-body text-[0.62rem] uppercase tracking-[0.18em] opacity-75">
            Pase
          </span>
          <strong className="font-display text-[1.5rem] font-normal leading-none min-[27rem]:text-[1.7rem]">
            {number}
          </strong>

          {/* La perforación: troquelada hasta la noche, no hasta la tarjeta. */}
          <span
            className="absolute inset-y-0 right-0 w-0.5"
            style={{
              backgroundImage:
                'repeating-linear-gradient(var(--noche) 0 6px, transparent 6px 12px)',
            }}
          />
        </div>

        {/* ── los datos ── */}
        <div className="min-w-0 px-4 py-5 min-[27rem]:px-5">
          <p aria-hidden="true" className="font-body text-[1.2rem] font-medium leading-snug">
            {name}
          </p>
          <p className="mt-0.5 font-body text-[0.85rem] font-light text-hueso/55">
            {kind === 'nino' ? 'Niño' : 'Adulto'}
          </p>

          <div className="mt-3.5 grid grid-cols-1 gap-2.5 min-[27rem]:grid-cols-2">
            {(['si', 'no'] as const).map((option) => {
              const checked = value === option;
              return (
                <label
                  key={option}
                  className="relative flex min-h-[3.4rem] cursor-pointer items-center justify-center"
                >
                  <input
                    type="radio"
                    name={`guest-${id}`}
                    value={option}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => onChange(id, option)}
                    className="peer sr-only"
                  />

                  <span
                    className={
                      'flex w-full items-center justify-center gap-2.5 rounded border-2 px-3 py-3.5 ' +
                      'font-body text-[1rem] font-medium transition-colors duration-200 ' +
                      'peer-focus-visible:outline peer-focus-visible:outline-2 ' +
                      'peer-focus-visible:outline-offset-2 peer-focus-visible:outline-luz ' +
                      (checked
                        ? option === 'si'
                          ? 'border-luz bg-luz text-noche'
                          : 'border-hueso/60 bg-hueso/20 text-hueso'
                        : 'border-luz/40 text-hueso/85 hover:border-luz')
                    }
                  >
                    <span className={checked ? 'opacity-100' : 'opacity-0'}>
                      {option === 'si' ? <Check /> : <Cross />}
                    </span>
                    {option === 'si' ? 'Sí asiste' : 'No podrá'}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Estado hablado, para que un lector de pantalla sepa qué falta. */}
      <p className="sr-only">{chosen ? '' : 'Falta responder por este pase.'}</p>
    </fieldset>
  );
}
