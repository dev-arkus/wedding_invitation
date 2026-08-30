'use client';

import type { GuestStatus } from '../lib/registry';

export interface GuestChoiceProps {
  id: string;
  name: string;
  value: GuestStatus;
  onChange: (id: string, status: 'si' | 'no') => void;
  /** Marca visible y accesible cuando falta responder por esta persona. */
  missing?: boolean;
  disabled?: boolean;
}

/**
 * El control Sí / No de una persona.
 *
 * Es el elemento que más se toca de toda la invitación. Nada de checkbox, ni
 * toggle, ni radios con su punto: dos palabras, y la elegida gana un filete
 * dorado que se dibuja en 200 ms.
 *
 * Debajo siguen siendo radios nativos dentro de un `fieldset`, solo reemplazados
 * visualmente. Eso da navegación con flechas, anuncio correcto del nombre como
 * etiqueta del grupo, y el estado sin trucos de ARIA.
 *
 * El estado NO se distingue solo por color: el filete es una forma. En escala de
 * grises se sigue viendo cuál está elegida.
 */
export function GuestChoice({ id, name, value, onChange, missing, disabled }: GuestChoiceProps) {
  return (
    <fieldset
      className="border-b border-navy/15 py-4"
      aria-invalid={missing || undefined}
    >
      <legend className="sr-only">{name}</legend>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <span
          aria-hidden="true"
          className={`font-body text-[1.05rem] font-normal leading-snug ${missing ? 'text-oro-tinta' : ''}`}
        >
          {name}
        </span>

        <div className="flex items-center gap-2">
          {(['si', 'no'] as const).map((option) => {
            const checked = value === option;
            return (
              <label
                key={option}
                // 44px de alto mínimo: es un objetivo táctil, no una palabra
                // suelta. `px-4` le da ancho para el pulgar.
                className="relative grid min-h-[44px] min-w-[3.5rem] cursor-pointer place-items-center px-4"
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
                    'relative font-body text-base transition-colors duration-200 ' +
                    'peer-focus-visible:outline peer-focus-visible:outline-2 ' +
                    'peer-focus-visible:outline-offset-8 peer-focus-visible:outline-oro-tinta ' +
                    // El filete se dibuja de izquierda a derecha al elegir.
                    "after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-px " +
                    'after:origin-left after:scale-x-0 after:bg-oro-tinta ' +
                    'after:transition-transform after:duration-200 after:content-[""] ' +
                    'peer-checked:after:scale-x-100 ' +
                    (checked ? 'text-navy' : 'text-navy/55')
                  }
                >
                  {option === 'si' ? 'Sí' : 'No'}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}
