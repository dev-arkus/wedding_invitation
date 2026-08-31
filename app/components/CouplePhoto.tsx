import Image from 'next/image';
import type { Photo } from '../lib/photos';

/**
 * La foto de la pareja.
 *
 * A sangre y sin forma: ocupa la sección entera, de borde a borde. Es lo primero
 * después del hero, así que su trabajo es que el invitado los vea a ustedes
 * antes de ver ninguna logística.
 *
 * Sin arco, al contrario de las fotos de los lugares. La regla sigue en pie:
 * **con marco es referencia, sin marco es mundo.** Aquellas son documentos que
 * hay que reconocer al llegar; esta es la noche misma.
 *
 * ── El duotono ───────────────────────────────────────────────────────────────
 * Filtro SVG `#duotono` (ver `DuotoneFilter`), que mapea la luminancia a la
 * rampa navy → ámbar. El truco de dos capas con `mix-blend-mode` deja los tonos
 * medios en gris; este no.
 *
 * No hay que preparar la imagen: `next/image` la reescala y re-codifica, y el
 * color lo pone el filtro. Sueltan el JPG y ya.
 *
 * Arriba y abajo la recorta una onda, no un degradado. Y se RECORTA de verdad
 * (`clip-path`), no se tapa con una forma rellena: una forma opaca apagaba las
 * estrellas en esa franja y dejaba una costura contra las secciones vecinas,
 * que son transparentes. Recortando, el cielo se ve arriba y abajo como en
 * cualquier otro sitio.
 *
 * El alto va en `vh` y no en proporción fija a propósito: la foto de origen es
 * muy vertical (591×1280), y forzarla a un 16:10 apaisado la recortaría a una
 * franja. Con alto relativo al viewport y `object-cover`, la sección se llena
 * igual sea cual sea la proporción de la foto que pongan.
 */
export function CouplePhoto({ photo }: { photo: Photo | null }) {
  if (!photo) return null;

  return (
    <section className="relative h-[78vh] w-full [clip-path:url(#onda-foto)] sm:h-[88vh]">
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

    </section>
  );
}
