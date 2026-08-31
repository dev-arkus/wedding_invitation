'use client';

import { useState } from 'react';
import { ZoomablePhoto } from './ZoomablePhoto';
import type { Photo } from '../lib/photos';

/**
 * El desplegable «¿Qué me pongo?» con las referencias de vestuario.
 *
 * Las imágenes se montan SOLO cuando el desplegable está abierto, y ese detalle
 * arregla un fallo real: con las imágenes siempre en el DOM y `loading="lazy"`,
 * el navegador evaluaba su visibilidad mientras el `<details>` estaba cerrado,
 * concluía que no hacían falta y **no volvía a intentarlo al abrirlo**. El
 * invitado tocaba el desplegable y encontraba tres huecos.
 *
 * Montarlas al abrir lo resuelve por partida doble: cargan justo cuando se ven,
 * y no se descargan nunca si nadie abre la sección — que en datos móviles
 * venezolanos es lo que hará la mayoría.
 */
export function DressCodeRefs({
  refs,
  titulo,
  nota,
}: {
  refs: Photo[];
  titulo: string;
  nota: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <details
      className="group border-y border-oro-tinta/30 text-left"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 py-4 font-body text-[1.05rem] font-normal text-navy marker:content-none">
        {titulo}
        <span
          aria-hidden="true"
          className="font-display text-2xl leading-none text-oro-tinta transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <div className="pb-6">
        {open && (
          <ul className="grid grid-cols-3 gap-2.5">
            {refs.map((ref) => (
              <li key={ref.src} className="relative aspect-[2/3] overflow-hidden rounded-lg">
                <ZoomablePhoto
                  photo={ref}
                  className="h-full"
                  sizes="(max-width: 640px) 33vw, 160px"
                  eager
                  // Sin viraje de color: para juzgar un vestido hay que ver su
                  // color real, al revés que las fotos de los lugares.
                  imageClassName="bg-navy object-cover"
                />
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 font-body text-[0.95rem] font-normal leading-relaxed text-navy/85">
          {nota}
        </p>
      </div>
    </details>
  );
}
