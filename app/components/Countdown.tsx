'use client';

import { useEffect, useState } from 'react';

export interface CountdownProps {
  /** Instante de la misa, epoch ms. */
  target: number;
  /**
   * Restante calculado en el SERVIDOR. El primer render del cliente usa este
   * mismo valor para que el HTML coincida y no haya aviso de hidratación; el
   * reloj propio arranca después de montar.
   */
  initialRemaining: number;
  closingMessage?: string;
}

function split(remaining: number) {
  const total = Math.max(0, Math.floor(remaining / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Conteo regresivo hacia la misa.
 *
 * Los días son la cifra dominante porque es el único número que a alguien le
 * importa de verdad a meses de distancia; horas, minutos y segundos van en una
 * línea secundaria. Sin tarjetas ni cajas: la jerarquía la hace el tamaño.
 */
export function Countdown({ target, initialRemaining, closingMessage }: CountdownProps) {
  const [remaining, setRemaining] = useState(initialRemaining);

  useEffect(() => {
    // Al montar se recalcula con el reloj del dispositivo y se sigue cada
    // segundo. La diferencia con el servidor es de milisegundos y aquí no
    // decide nada: el corte del RSVP lo evalúa el servidor, siempre.
    const tick = () => setRemaining(target - Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (remaining <= 0) {
    return (
      <p className="text-center font-display text-[clamp(1.5rem,7vw,2.5rem)]">
        {closingMessage || 'Hoy nos casamos'}
      </p>
    );
  }

  const { days, hours, minutes, seconds } = split(remaining);

  return (
    <div className="text-center">
      <p className="font-body text-[0.7rem] font-light tracking-eyebrow text-hueso/60">FALTAN</p>

      <p
        // `tabular-nums` evita que el bloque cambie de ancho al pasar de 100 a
        // 99 días y empuje lo que tiene al lado.
        className="mt-4 font-display text-[clamp(3.5rem,20vw,7rem)] leading-none tabular-nums"
        aria-hidden="true"
      >
        {days}
      </p>
      <p className="mt-2 font-body text-sm font-light tracking-eyebrow text-hueso/60" aria-hidden="true">
        {days === 1 ? 'día' : 'días'}
      </p>

      <div aria-hidden="true" className="mx-auto mt-6 h-px w-[7em] bg-oro" />

      <p
        className="mt-5 font-body text-[0.8rem] font-light tracking-eyebrow text-hueso/60 tabular-nums"
        aria-hidden="true"
      >
        {pad(hours)} h · {pad(minutes)} m · {pad(seconds)} s
      </p>

      {/* Un lector de pantalla no debe recibir una actualización por segundo.
          Se anuncia una vez, en palabras, y sin `aria-live`. */}
      <p className="sr-only">
        Faltan {days} {days === 1 ? 'día' : 'días'} para la boda.
      </p>
    </div>
  );
}
