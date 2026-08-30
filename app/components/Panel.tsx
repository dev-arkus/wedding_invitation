/**
 * El panel: la unidad de composición de la invitación.
 *
 * Antes cada sección flotaba directamente sobre el campo de estrellas, y el
 * texto competía con él. Se parcheaba atenuando estrellas (`data-sky-guard`),
 * que funciona pero es defensivo.
 *
 * Un panel translúcido con desenfoque de fondo lo resuelve por diseño: el cielo
 * se sigue viendo detrás, apagado, y el texto se apoya en una superficie propia.
 * El `data-sky-guard` se queda como segunda red, para los navegadores sin
 * `backdrop-filter`.
 *
 * Los bordes van redondeados. El diseño original los quería a filo vivo, pero
 * las tarjetas de la referencia son suaves y tienen razón: una esquina dura, en
 * una invitación, se lee a formulario.
 */
export function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      data-sky-guard
      className={
        'relative mx-auto w-full max-w-md rounded-3xl border border-oro/25 ' +
        'bg-navy/80 px-6 py-12 backdrop-blur-[6px] sm:px-8 ' +
        className
      }
    >
      {children}
    </section>
  );
}

/**
 * Filete corto de tinta. Separa el título de su contenido en todas las
 * secciones, y es lo único que se repite entre ellas.
 */
export function Rule({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`h-px w-16 bg-oro ${className}`} />;
}

/**
 * Epígrafe en versalitas muy espaciadas. Etiqueta, nunca título.
 */
export function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-body text-[0.7rem] font-light tracking-eyebrow text-luz ${className}`}>
      {children}
    </p>
  );
}
