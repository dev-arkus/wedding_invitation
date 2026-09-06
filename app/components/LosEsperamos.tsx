import Image from 'next/image';
import type { Photo } from '../lib/photos';

/**
 * Cierre: «Los esperamos».
 *
 * Sigue el `seccion-los-esperamos.html` de la pareja: un disco detrás, ellos dos
 * delante con las cabezas sobresaliendo por arriba, y la frase en caligráfica.
 *
 * ── Por qué cierra bien la página ────────────────────────────────────────────
 * El hero abre con sus nombres en Parisienne. Esta sección los repite en la
 * misma letra, ahora con una frase. Es el único otro sitio donde aparece esa
 * tipografía, así que funciona como cierre de paréntesis, no como repetición.
 *
 * Y el disco, sobre el campo de estrellas, se lee como una luna. No estaba
 * buscado en el ejemplo original —que iba sobre fondo liso— pero encaja con la
 * tesis de la invitación entera.
 *
 * ── El recorte de la foto ────────────────────────────────────────────────────
 * El diseño original asume una foto de cuerpo entero con los pies apoyados en el
 * borde inferior del disco. La foto real está cortada a media pierna, así que no
 * hay pies que puedan apoyarse en nada.
 *
 * Primero se probó disolviendo el borde inferior. Se veía bien, pero dejaba
 * cuerpo colgando por debajo del disco. Ahora la foto se recorta CON el disco:
 * están dentro de él, asomándose por arriba, y por abajo no sobresale nada.
 */
/** Línea del ecuador del disco: donde el rectángulo cede el paso al círculo. */
const ECUADOR = 'calc(100% - var(--pie) - var(--disco) / 2)';

/**
 * Dos capas, ambas a tamaño completo para no tener que posicionarlas.
 * Se suman (`mask-composite: add`, que además es el valor por defecto).
 */
const MASCARA = [
  `linear-gradient(to bottom, #000 0 ${ECUADOR}, transparent ${ECUADOR})`,
  `radial-gradient(circle calc(var(--disco) / 2) at 50% ${ECUADOR}, #000 99%, transparent 100%)`,
].join(', ');

export function LosEsperamos({ photo }: { photo: Photo | null }) {
  if (!photo) return null;

  return (
    <section className="px-6 pb-24 pt-4 text-center">
      <div
        className="relative mx-auto flex items-end justify-center"
        style={
          {
            // Medidas del disco. Se tocan aquí y solo aquí; la máscara de la
            // foto se calcula a partir de ellas.
            '--disco': 'min(272px, 70vw)',
            '--pie': '56px',
            width: 'min(320px, 80vw)',
            height: 'min(420px, 92vw)',
          } as React.CSSProperties
        }
      >
        {/* El disco. Sobre el cielo se lee como una luna. */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            bottom: 'var(--pie)',
            width: 'var(--disco)',
            aspectRatio: '1',
            background:
              'radial-gradient(circle at 40% 32%, var(--azul-luz), var(--navy))',
            boxShadow:
              '0 0 0 1px rgb(var(--luz-rgb) / 0.55), 0 0 0 12px rgb(var(--luz-rgb) / 0.07)',
          }}
        />

        <div className="relative z-[2] h-full w-full">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 640px) 80vw, 320px"
            // `contain` y no `cover`: es un recorte con transparencia, y
            // recortarlo otra vez le cortaría la cabeza o los hombros.
            className="object-contain object-bottom"
            style={
              {
                /*
                 * La foto se recorta CON el disco.
                 *
                 * La máscara son dos capas que se suman:
                 *
                 *   1. un rectángulo desde arriba hasta el centro del disco
                 *      → las cabezas y el torso salen libres por encima
                 *   2. el propio círculo
                 *      → de la mitad del disco hacia abajo solo se ve lo que
                 *        cae dentro del arco
                 *
                 * El resultado es que están DENTRO del disco, asomándose por el
                 * borde de arriba, y nada cuelga por debajo.
                 */
                maskImage: MASCARA,
                WebkitMaskImage: MASCARA,
                maskComposite: 'add',
                WebkitMaskComposite: 'source-over',
                maskRepeat: 'no-repeat, no-repeat',
                WebkitMaskRepeat: 'no-repeat, no-repeat',
              } as React.CSSProperties
            }
          />
        </div>
      </div>

      <p className="relative z-[3] mt-7 font-script text-[clamp(2.4rem,10vw,3.6rem)] leading-tight text-luz">
        Los esperamos
      </p>

      <p className="mt-3 font-body text-[0.85rem] font-light tracking-[0.28em] text-hueso/55">
        07 · 11 · 2026
      </p>
    </section>
  );
}
