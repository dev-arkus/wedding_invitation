'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Photo } from '../lib/photos';

export interface ZoomablePhotoProps {
  photo: Photo;
  /** Clases del contenedor de la miniatura. */
  className?: string;
  /** Clases de la imagen pequeña, incluido el viraje de color. */
  imageClassName?: string;
  sizes?: string;
  /**
   * Carga la miniatura de inmediato en vez de diferirla.
   *
   * Se usa donde la imagen se MONTA justo cuando hace falta —por ejemplo al
   * abrir el desplegable del dress code—. Ahí `lazy` no aporta nada, porque
   * antes de montar no existía, y en cambio deja la carga en manos de una
   * heurística de visibilidad que puede no dispararse: el invitado abre y ve
   * huecos. Con `eager` carga exactamente cuando se necesita.
   */
  eager?: boolean;
}

/**
 * La foto de un lugar, ampliable a pantalla completa y sin filtro.
 *
 * Resuelve una tensión del propio diseño: estas fotos van viradas para que no
 * peleen con la paleta nocturna, pero su único trabajo es que el invitado
 * **reconozca el sitio al llegar**. Al tocarlas se abren en grande y con los
 * colores originales, que es cuando de verdad sirven para eso.
 *
 * Se usa `<dialog>` nativo en vez de un div a mano: trae gratis el cierre con
 * Esc, el atrapado de foco, el fondo inerte y la devolución del foco al botón
 * que la abrió. Reimplementar eso a mano casi siempre sale peor.
 *
 * Se cierra de cuatro formas: tocando la imagen otra vez —que es lo que pidió
 * la pareja—, tocando fuera, con Esc, y con el botón de cerrar.
 */
export function ZoomablePhoto({
  photo,
  className = '',
  imageClassName = '',
  sizes,
  eager = false,
}: ZoomablePhotoProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  /**
   * Cerrar la foto. TODOS los caminos pasan por aquí.
   *
   * La versión anterior sincronizaba el estado y liberaba el scroll escuchando
   * el evento `close` del `<dialog>`. Al instrumentarlo resultó que ese evento
   * **no se dispara** en este entorno: el diálogo se cerraba, pero el
   * `overflow: hidden` se quedaba pegado en el body y la invitación no volvía a
   * desplazarse.
   *
   * Depender de un evento que no se puede garantizar era el error. Una sola
   * función que hace las tres cosas —cerrar, sincronizar estado y soltar el
   * scroll— no puede desincronizarse.
   */
  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpen(false);
    document.body.style.removeProperty('overflow');
  }, []);

  function openDialog() {
    dialogRef.current?.showModal();
    // `showModal` deja el fondo inerte pero no impide que la página siga
    // desplazándose detrás.
    document.body.style.overflow = 'hidden';
    setOpen(true);
  }

  useEffect(() => {
    // Al desmontar con la foto abierta, el scroll no puede quedarse bloqueado.
    return () => {
      document.body.style.removeProperty('overflow');
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={`group relative block w-full cursor-zoom-in ${className}`}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          loading={eager ? 'eager' : 'lazy'}
          className={imageClassName}
        />

        {/* Sin esto nadie sabría que la foto se puede tocar. */}
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-luz/50 bg-noche/70 text-luz backdrop-blur-sm transition-colors group-hover:border-luz"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.6]">
            <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
          </svg>
        </span>

        <span className="sr-only">Ver la foto de {photo.alt} en grande</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={`Foto de ${photo.alt}`}
        onCancel={(event) => {
          // Esc cierra el diálogo por su cuenta. Se intercepta para que también
          // pase por `close()` y libere el scroll.
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          // Un clic sobre el propio `<dialog>` es un clic en el fondo: el
          // contenido está en el div de adentro.
          if (event.target === dialogRef.current) close();
        }}
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-noche/95 backdrop:backdrop-blur-sm"
      >
        <div className="relative flex h-full w-full items-center justify-center p-4">
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar la foto"
            className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-luz/50 bg-noche/80 text-luz backdrop-blur-sm transition-colors hover:border-luz"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.6]">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          {/* Tocar la imagen la cierra, que es como lo pidieron. */}
          <button
            type="button"
            onClick={close}
            className="relative h-full w-full cursor-zoom-out"
            // El botón de cerrar de arriba ya cubre esta acción para lectores de
            // pantalla; anunciarla dos veces solo estorba.
            aria-hidden="true"
            tabIndex={-1}
          >
            {open && (
              <Image
                src={photo.src}
                alt=""
                fill
                sizes="100vw"
                quality={90}
                // Sin viraje: aquí se ve la foto tal cual.
                className="object-contain"
              />
            )}
          </button>
        </div>
      </dialog>
    </>
  );
}
