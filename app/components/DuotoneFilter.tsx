/**
 * Definiciones SVG globales: los dos filtros de color y el recorte en onda.
 *
 * ── Filtro duotono real: mapea la LUMINANCIA de la foto a la rampa navy → ámbar.
 *
 * El truco habitual de dos capas con `mix-blend-mode` (lighten con el color
 * oscuro, darken con el claro) solo toca los extremos: un gris medio se queda
 * gris, porque `lighten`/`darken` comparan canal por canal y en los medios no
 * gana ninguno. El resultado es una foto desaturada, no un duotono.
 *
 * `feComponentTransfer` con `tableValues` sí interpola: 0 va al color de sombra,
 * 1 al de luz, y todo lo de en medio cae en la recta entre ambos.
 *
 * Los valores son los tokens de la paleta divididos entre 255:
 *   --navy #1A2340 -> 0.102, 0.137, 0.251   (sombras)
 *   --luz  #FFC97A -> 1.000, 0.788, 0.478   (luces)
 */
export function DuotoneFilter() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
      <defs>
        <filter id="duotono" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.102 1.0" />
            <feFuncG type="table" tableValues="0.137 0.788" />
            <feFuncB type="table" tableValues="0.251 0.478" />
          </feComponentTransfer>
        </filter>

        {/*
          Versión suave para las fotos de los lugares.
          `saturate 0.12` deja un resto de color real y la rampa es mucho más
          corta: de un gris-navy oscuro a un crema tibio. La fachada se sigue
          reconociendo, que es todo el punto de esa foto, pero deja de pelear
          con una página nocturna.
        */}
        <filter id="duotono-suave" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0.12" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.13 0.96" />
            <feFuncG type="table" tableValues="0.16 0.90" />
            <feFuncB type="table" tableValues="0.26 0.78" />
          </feComponentTransfer>
        </filter>

        {/*
          Recorte en onda de la foto de la pareja.
          
          Se RECORTA la imagen en vez de tapar sus bordes con una forma rellena.
          Con relleno opaco, la onda apagaba las estrellas en esa franja y dejaba
          una costura contra el fondo transparente de las secciones vecinas.
          Recortando, el cielo se ve por encima y por debajo de la foto como en
          cualquier otro sitio, y la onda es el borde de verdad de la imagen.

          `objectBoundingBox` expresa el trazado en fracciones de 0 a 1, así que
          la misma curva sirve a cualquier tamaño sin recalcular nada.
        */}
        <clipPath id="onda-foto" clipPathUnits="objectBoundingBox">
          <path d="M0,0.075 C0.30,-0.02 0.70,0.115 1,0.022 L1,0.978 C0.70,1.02 0.30,0.885 0,0.925 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
