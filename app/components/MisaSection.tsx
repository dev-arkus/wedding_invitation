import { formatTime } from '../lib/time';
import { CopyableAddress, DirectionsButton, type Venue } from './VenueParts';
import { ZoomablePhoto } from './ZoomablePhoto';
import type { Photo } from '../lib/photos';

/**
 * Misa · composición «duotono».
 *
 * La foto ocupa el ancho arriba y se funde por abajo con el fondo del panel, sin
 * borde: la imagen no termina, se disuelve. Debajo, todo centrado y en una sola
 * columna — eyebrow, lugar, dirección, hora, botón.
 *
 * Sale del `seccion-misa.html` de la pareja. Es deliberadamente distinta de la
 * recepción: dos actos de la misma noche, pero no el mismo momento.
 */
export function MisaSection({
  title,
  at,
  venue,
  body,
  photo,
}: {
  title: string;
  at: number;
  venue: Venue;
  body: string;
  photo?: Photo | null;
}) {
  return (
    <div className="px-5 py-8">
      <section
        data-sky-guard
        className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-oro/25 bg-navy/90 pb-12 text-center backdrop-blur-[6px]"
      >
        {photo && (
          <div className="relative h-[clamp(250px,52vw,340px)] w-full">
            <ZoomablePhoto
              photo={photo}
              className="h-full"
              sizes="(max-width: 640px) 100vw, 480px"
              imageClassName="bg-navy object-cover object-[center_45%] [filter:url(#duotono-suave)]"
            />
            {/* Funde la parte baja de la foto con el panel. `pointer-events-none`
                para que no se coma el toque que abre la foto en grande. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-[58%] to-navy"
            />
          </div>
        )}

        <div className="px-7 pt-9">
          <p className="font-body text-[0.6rem] font-light uppercase tracking-[0.4em] text-luz">
            {title}
          </p>

          {venue.place && (
            <h2 className="mb-4 mt-3.5 font-display text-[clamp(1.65rem,7vw,2.5rem)] leading-tight tracking-[0.03em]">
              {venue.place}
            </h2>
          )}

          {venue.address && (
            <div className="mx-auto max-w-[20rem]">
              <CopyableAddress
                venue={venue}
                className="mx-auto block w-full font-body text-[0.9rem] font-light leading-relaxed text-hueso/65"
              />
            </div>
          )}

          <p className="my-7 font-display text-[2rem] leading-none text-luz">{formatTime(at)}</p>

          <p className="mx-auto mb-8 max-w-[22rem] font-body text-[0.95rem] font-light leading-relaxed text-hueso/70">
            {body}
          </p>

          <DirectionsButton venue={venue} />
        </div>
      </section>
    </div>
  );
}
