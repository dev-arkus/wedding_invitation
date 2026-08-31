import { formatTime } from '../lib/time';
import { CopyableAddress, DirectionsButton, type Venue } from './VenueParts';
import { ZoomablePhoto } from './ZoomablePhoto';
import type { Photo } from '../lib/photos';

/**
 * Recepción · composición «franja».
 *
 * La contraparte de la misa: allá la foto se funde y el texto respira centrado;
 * aquí la foto manda y la información viaja en una banda.
 *
 * ── Por qué la banda ya no se monta sobre la foto ────────────────────────────
 * Antes iba posicionada ENCIMA. En pantalla angosta su contenido —epígrafe,
 * lugar, dirección, texto, hora y botón— crecía hasta tapar la foto entera:
 * quedaba un rectángulo de texto sin ninguna imagen.
 *
 * El primer arreglo fue apilar solo en móvil y conservar el montaje de `sm` en
 * adelante. Al medirlo, el escritorio tenía el mismo defecto más leve: la banda
 * ocupaba 334 de 416px y dejaba 82px de foto. La causa es que la sección está
 * limitada a 448px de ancho en CUALQUIER pantalla, así que el montaje nunca
 * tiene el aire que necesita.
 *
 * Se apila siempre. La foto se ve completa en todos los tamaños, y la sección
 * sigue distinguiéndose de la misa: allá todo va centrado en columna, aquí la
 * información va alineada a la izquierda con la hora y el botón en una fila.
 */
export function RecepcionSection({
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
        className="relative mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-oro/25"
      >
        {photo ? (
          <div className="relative aspect-[4/3] w-full">
            <ZoomablePhoto
              photo={photo}
              className="h-full"
              sizes="(max-width: 640px) 100vw, 480px"
              imageClassName="bg-navy object-cover object-[center_45%] [filter:url(#duotono-suave)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy/10 to-navy/55"
            />
          </div>
        ) : null}

        <div className="relative z-[2] w-full border-t border-luz/40 bg-navy/85 px-6 py-8 backdrop-blur-[6px] sm:px-8">
          <p className="font-body text-[0.6rem] font-light uppercase tracking-[0.4em] text-luz">
            {title}
          </p>

          {venue.place && (
            <h2 className="mb-2 mt-2.5 font-display text-[clamp(1.5rem,6vw,2rem)] leading-tight tracking-[0.03em]">
              {venue.place}
            </h2>
          )}

          {venue.address && (
            <CopyableAddress
              venue={venue}
              className="block font-body text-[0.85rem] font-light leading-relaxed text-hueso/65"
            />
          )}

          <p className="mt-4 font-body text-[0.9rem] font-light leading-relaxed text-hueso/75">
            {body}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
            <span className="font-display text-[1.85rem] leading-none text-luz">
              {formatTime(at)}
            </span>
            <DirectionsButton venue={venue} />
          </div>
        </div>
      </section>
    </div>
  );
}
