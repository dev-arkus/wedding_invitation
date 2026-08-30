'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ArchFrame } from './ArchFrame';

export interface PlaceBlockProps {
  /** Nombre del lugar, para las etiquetas accesibles. */
  label: string;
  /** `src` del iframe de maps/embed. Vacío = no se ofrece mapa. */
  mapEmbed?: string;
  /** `lat,lng`. Vacío = no se ofrecen botones de navegación. */
  coords?: string;
  /** Foto del lugar. Ausente = la portada es un panel con filete. */
  photo?: { src: string; alt: string };
}

/** Acepta `7.76,-72.22` con o sin espacios; rechaza cualquier otra cosa. */
function parseCoords(raw: string): { lat: number; lng: number } | null {
  const m = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/.exec(raw);
  if (!m) return null;

  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  return { lat, lng };
}

/**
 * Portada del lugar y, al tocarla, el mapa.
 *
 * El iframe NO se inserta en la carga: aparece solo cuando el invitado lo pide.
 * No es solo peso — también evita que Google reciba una visita por cada persona
 * que abre la invitación sin mirar el mapa.
 *
 * Tres escalones, y cada uno es una página terminada, no una rota:
 *
 *   foto + mapa      la foto es la portada; se toca y sale el mapa
 *   solo mapa        panel con filete y el botón
 *   ni foto ni mapa  no se renderiza nada; queda la dirección en texto
 */
export function PlaceBlock({ label, mapEmbed, coords, photo }: PlaceBlockProps) {
  const [showMap, setShowMap] = useState(false);

  const point = coords ? parseCoords(coords) : null;
  const hasMap = Boolean(mapEmbed);

  if (!hasMap && !photo && !point) return null;

  return (
    <div className="mt-8">
      {(photo || hasMap) && (
        <ArchFrame bordered className="relative aspect-[4/3] w-full">
          {showMap && mapEmbed ? (
            <iframe
              src={mapEmbed}
              title={`Mapa de ${label}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen
            />
          ) : (
            <>
              {photo ? (
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 640px"
                  // Duotono suave: la fachada se reconoce, pero deja de ser una
                  // foto de día pegada en una página de noche.
                  className="bg-navy object-cover [filter:url(#duotono-suave)]"
                />
              ) : (
                // Sin foto no se inventa un mapa estático: Google los cobra con
                // API key, y aquí eso está fuera de alcance por decisión.
                <div className="absolute inset-0 bg-navy" />
              )}

              {hasMap && (
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="group absolute inset-0 flex items-end justify-center p-5"
                >
                  {/* Velo propio en la parte baja: el contraste del botón no
                      puede depender de qué haya en la foto detrás. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-noche via-noche/70 to-transparent"
                  />
                  <span className="relative rounded-full border border-luz bg-noche px-6 py-3 font-body text-xs font-light tracking-eyebrow text-luz transition-colors group-hover:bg-navy">
                    Ver mapa
                  </span>
                  <span className="sr-only">de {label}</span>
                </button>
              )}
            </>
          )}
        </ArchFrame>
      )}

      {point && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-full border border-oro/50 px-5 font-body text-xs font-light tracking-eyebrow text-luz transition-colors hover:border-luz"
          >
            Google Maps
            <span className="sr-only"> — cómo llegar a {label}</span>
          </a>
          <a
            href={`https://waze.com/ul?ll=${point.lat},${point.lng}&navigate=yes`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-full border border-oro/50 px-5 font-body text-xs font-light tracking-eyebrow text-luz transition-colors hover:border-luz"
          >
            Waze
            <span className="sr-only"> — cómo llegar a {label}</span>
          </a>
        </div>
      )}
    </div>
  );
}
