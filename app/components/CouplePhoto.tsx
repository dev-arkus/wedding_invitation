import Image from 'next/image';
import type { Photo } from '../lib/photos';
import { ArchFrame } from './ArchFrame';

/**
 * La foto de la pareja.
 *
 * A sangre y sin marco, al contrario de las de los lugares. La regla se lee
 * sola: **con marco es referencia, sin marco es mundo.**
 *
 * ── El duotono ───────────────────────────────────────────────────────────────
 * Se hace con CSS y no preparando el archivo. Es la receta clásica de dos capas:
 *
 * Se usa el filtro SVG `#duotono` (ver `DuotoneFilter`), que mapea la luminancia
 * a la rampa navy → ámbar. El truco de dos capas con `mix-blend-mode` deja los
 * tonos medios en gris; este no.
 *
 * El diseño original pedía tonificar la imagen en el build, en parte porque una
 * imagen de dos colores comprime mejor. Pero `next/image` ya reescala y
 * re-codifica a AVIF, así que la compresión está cubierta — y hacerlo por CSS
 * les quita de encima tener que instalar un editor. Sueltan el JPG y ya.
 */
export function CouplePhoto({ photo }: { photo: Photo | null }) {
  if (!photo) return null;

  return (
    <section className="relative px-5 py-8">
      <ArchFrame className="relative mx-auto aspect-[4/5] w-full max-w-md sm:aspect-[3/4]">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="100vw"
          // El marcador de posición por defecto es gris claro y da un destello
          // blanco sobre una página oscura. El navy hace que la foto emerja del
          // cielo en vez de golpear.
          className="bg-navy object-cover [filter:contrast(1.05)_url(#duotono)]"
          loading="lazy"
        />

      </ArchFrame>
    </section>
  );
}
