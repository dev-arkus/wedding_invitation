/**
 * Marco de arco.
 *
 * Tomado de la referencia, y no es adorno: **un arco es la forma de una puerta
 * de iglesia y de un vitral.** Encierra las fotos en la silueta del lugar donde
 * empieza la boda, que es exactamente el tipo de estructura que debe cargar
 * información en vez de decorar.
 *
 * El degradado inferior a `--noche` es el difuminado que ya tenía la foto de la
 * pareja, extendido a todas: la imagen no termina en un borde, se disuelve.
 */
export function ArchFrame({
  children,
  className = '',
  bordered = false,
}: {
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={
        'relative overflow-hidden ' +
        // Radio horizontal del 50% del ancho y vertical del 26% del alto: un
        // arco de medio punto peraltado, no un semicírculo aplastado.
        '[border-radius:50%_50%_0_0/26%_26%_0_0] ' +
        (bordered ? 'border border-oro/30 ' : '') +
        className
      }
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-noche to-transparent"
      />
    </div>
  );
}
