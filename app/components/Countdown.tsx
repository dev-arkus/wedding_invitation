'use client';

import { useEffect, useRef, useState } from 'react';

export interface CountdownProps {
  /** Instante de la misa, epoch ms. */
  target: number;
  /**
   * Restante calculado en el SERVIDOR. El primer render del cliente usa este
   * mismo valor para que el HTML coincida y no haya aviso de hidratación; el
   * reloj propio arranca después de montar.
   */
  initialRemaining: number;
  /** Fecha ya formateada en servidor, para no arrastrar `Intl` al cliente. */
  formattedDate: string;
  closingMessage?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

function split(remaining: number) {
  const total = Math.max(0, Math.floor(remaining / 1000));
  return {
    d: pad(Math.floor(total / 86400)),
    h: pad(Math.floor(total / 3600) % 24),
    m: pad(Math.floor(total / 60) % 60),
    s: pad(total % 60),
  };
}

const UNITS = [
  { key: 'd', label: 'Días' },
  { key: 'h', label: 'Horas' },
  { key: 'm', label: 'Min' },
  { key: 's', label: 'Seg' },
] as const;

/**
 * Contador de tablero.
 *
 * Cuatro cartas con costura al medio, y solo gira la cifra que cambió — no las
 * cuatro cada segundo. Sale del `contador-tablero.html` que pasó la pareja.
 *
 * Dos cosas heredadas de ese archivo que valen:
 *   · el conteo se detiene cuando la pestaña se oculta, para no gastar batería
 *   · las cifras usan `tabular-nums`, así el tablero no cambia de ancho
 */
export function Countdown({ target, initialRemaining, formattedDate, closingMessage }: CountdownProps) {
  const [remaining, setRemaining] = useState(initialRemaining);
  const previous = useRef<Record<string, string>>({});
  const [spinning, setSpinning] = useState<Record<string, boolean>>({});

  useEffect(() => {
    function tick() {
      setRemaining(target - Date.now());
    }

    tick();
    let timer = window.setInterval(tick, 1000);

    function onVisibility() {
      window.clearInterval(timer);
      if (!document.hidden) {
        tick();
        timer = window.setInterval(tick, 1000);
      }
    }

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [target]);

  const values = split(remaining);

  // Marca solo las cifras que cambiaron, para que gire únicamente esa carta.
  useEffect(() => {
    const changed: Record<string, boolean> = {};
    for (const { key } of UNITS) {
      if (previous.current[key] !== undefined && previous.current[key] !== values[key]) {
        changed[key] = true;
      }
      previous.current[key] = values[key];
    }
    if (Object.keys(changed).length > 0) {
      setSpinning(changed);
      const id = window.setTimeout(() => setSpinning({}), 420);
      return () => window.clearTimeout(id);
    }
  }, [values.d, values.h, values.m, values.s]);

  if (remaining <= 0) {
    return (
      <div data-sky-guard className="mx-auto max-w-md text-center">
        <p className="font-display text-[clamp(1.6rem,6vw,2.4rem)] text-luz">
          {closingMessage || 'Hoy nos casamos'}
        </p>
      </div>
    );
  }

  return (
    /*
     * `data-sky-guard` va aquí y no en la sección: si cubriera todo el ancho se
     * vería una banda de estrellas apagadas de lado a lado. Acotado al bloque de
     * texto, el cielo sigue vivo alrededor y solo se atenúa lo justo detrás de
     * las cifras.
     */
    <div data-sky-guard className="mx-auto max-w-md text-center">
      <p className="font-body text-[1.05rem] font-normal uppercase tracking-[0.3em] text-luz">
        Faltan
      </p>

      <div
        className="mt-7 flex justify-center gap-2 sm:gap-4"
        role="timer"
        aria-label={`Faltan ${Number(values.d)} días y ${Number(values.h)} horas`}
      >
        {UNITS.map(({ key, label }) => (
          <div key={key} className="min-w-[clamp(3.9rem,15vw,5.75rem)]">
            <div className="relative overflow-hidden rounded-md border border-luz/35 bg-navy/45 px-2.5 pb-4 pt-4 backdrop-blur-[3px] shadow-[0_10px_24px_rgba(0,0,0,.35)]">
              {/* La costura del panel: es lo que lo hace leer como tablero. */}
              <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-noche/45" />
              <span
                className={
                  'block font-display text-[clamp(2rem,8vw,3rem)] leading-none text-luz tabular-nums ' +
                  '[transform-origin:center_top] [backface-visibility:hidden] ' +
                  (spinning[key] ? 'motion-safe:animate-[gira_420ms_ease-out]' : '')
                }
              >
                {values[key]}
              </span>
            </div>
            <p className="mt-2.5 font-body text-[0.56rem] font-light uppercase tracking-[0.24em] text-hueso/55">
              {label}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-9 font-body text-[0.95rem] font-light tracking-[0.1em] text-hueso/75">
        {formattedDate}
      </p>
    </div>
  );
}
