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
  tone = 'oscuro',
}: {
  children: React.ReactNode;
  className?: string;
  /**
   * `claro` invierte el panel a crema con texto navy.
   *
   * No es variedad por variedad: **lo que se lee va oscuro y atmosférico, lo que
   * se hace va claro y nítido.** El dress code y la confirmación son las dos
   * secciones donde el invitado actúa, y una superficie clara les da el mejor
   * contraste de toda la página.
   */
  tone?: 'oscuro' | 'claro';
}) {
  const surface =
    tone === 'claro'
      ? 'border-oro-tinta/30 bg-hueso text-navy shadow-[0_18px_40px_rgba(0,0,0,.35)]'
      : 'border-oro/25 bg-navy/80 text-hueso backdrop-blur-[6px]';

  return (
    <section
      data-sky-guard
      className={`relative mx-auto w-full max-w-md rounded-3xl border px-6 py-12 sm:px-8 ${surface} ${className}`}
    >
      {children}
    </section>
  );
}

/**
 * Filete corto de tinta. Separa el título de su contenido en todas las
 * secciones, y es lo único que se repite entre ellas.
 */
export function Rule({ className = '', tone = 'oscuro' }: { className?: string; tone?: 'oscuro' | 'claro' }) {
  return (
    <div
      aria-hidden="true"
      className={`h-px w-16 ${tone === 'claro' ? 'bg-oro-tinta' : 'bg-oro'} ${className}`}
    />
  );
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
