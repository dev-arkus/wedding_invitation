'use client';

import { useState } from 'react';

/**
 * Piezas compartidas por las dos secciones de lugar.
 *
 * Las secciones tienen composiciones distintas —la misa apila, la recepción usa
 * una franja sobre la foto— pero los controles son los mismos, y deben
 * comportarse igual en ambas.
 */

export interface Venue {
  place: string;
  address: string;
  coords: string;
  /** Place ID de Google. Opcional; si está, el destino es exacto. */
  placeId?: string;
}

/** Acepta `7.81,-72.22` con o sin espacios; rechaza cualquier otra cosa. */
export function parseCoords(raw: string): { lat: number; lng: number } | null {
  const m = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/.exec(raw);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

/**
 * La dirección, tocable para copiarla.
 *
 * Sale del ejemplo de la pareja y es de las cosas más útiles que traía: el
 * invitado que va en taxi necesita el texto, no un mapa. Sin `navigator.clipboard`
 * —contexto no seguro, navegador viejo— se queda como texto normal en vez de
 * ofrecer un botón que no hace nada.
 */
export function CopyableAddress({ venue, className = '' }: { venue: Venue; className?: string }) {
  const [copied, setCopied] = useState(false);
  const [supported, setSupported] = useState(true);

  const full = [venue.place, venue.address.replace(/\s*\n\s*/g, ', ')].filter(Boolean).join(', ');

  async function copy() {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setSupported(false);
    }
  }

  if (!supported || typeof navigator === 'undefined' || !navigator.clipboard) {
    return <p className={`whitespace-pre-line ${className}`}>{venue.address}</p>;
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={`min-h-[44px] cursor-pointer whitespace-pre-line text-left transition-colors hover:text-luz ${className}`}
      >
        {venue.address}
        <span className="sr-only"> — toca para copiar la dirección</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Dirección copiada' : ''}
      </span>
      <span
        aria-hidden="true"
        className={`mt-2 block font-body text-[0.58rem] uppercase tracking-[0.24em] text-luz transition-opacity duration-300 ${
          copied ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Dirección copiada
      </span>
    </>
  );
}

/**
 * Cómo llegar.
 *
 * Solo Google Maps: la pareja quitó Waze. Cuando hay Place ID se manda también,
 * porque una parroquia se resuelve mejor por identificador que por un par de
 * coordenadas sueltas.
 */
export function DirectionsButton({
  venue,
  variant = 'oscuro',
}: {
  venue: Venue;
  variant?: 'oscuro' | 'claro';
}) {
  const point = parseCoords(venue.coords);
  if (!point) return null;

  const href =
    `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}` +
    (venue.placeId ? `&destination_place_id=${encodeURIComponent(venue.placeId)}` : '');

  const styles =
    variant === 'claro'
      ? 'border-oro-tinta text-oro-tinta hover:bg-oro-tinta hover:text-hueso'
      : 'border-luz text-luz hover:bg-luz hover:text-noche';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-[44px] items-center justify-center gap-2.5 rounded-sm border px-7 font-body text-[0.62rem] font-light uppercase tracking-[0.26em] transition-colors ${styles}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[15px] w-[15px] fill-none stroke-current stroke-[1.4]">
        <path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.6" />
      </svg>
      Cómo llegar
      <span className="sr-only"> a {venue.place}</span>
    </a>
  );
}
