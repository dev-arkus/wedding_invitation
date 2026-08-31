/**
 * Los textos de la invitación.
 *
 * Todo en «tú», dirigido a QUIEN RECIBE el enlace, no al grupo. Eso reduce el
 * problema de singular/plural a "un lugar" contra "estos lugares".
 *
 * Cálido pero correcto: hay mayores leyendo. Por eso «la recepción» y no «la
 * fiesta» — una palabra fija el registro de la página entera.
 *
 * Dos frases hacen trabajo de diseño y conviene no tocarlas a la ligera:
 *
 *   «Apartamos estos lugares para ti» explica sola por qué los nombres vienen
 *   puestos y no hay campo para agregar gente. Sin texto de ayuda, sin
 *   asteriscos, sin justificarse.
 *
 *   «Marca quién puede venir» nombra la acción igual que el sistema la ejecuta.
 */

export const copy = {
  hero: {
    eyebrow: 'NOS CASAMOS',
  },

  countdown: {
    eyebrow: 'FALTAN',
  },

  misa: {
    title: 'Misa',
    body: (place: string) =>
      place
        ? `Nos casamos en ${place}. Nos encantaría verte desde el principio.`
        : 'Nos encantaría verte desde el principio.',
  },

  recepcion: {
    title: 'Recepción',
    body: (place: string) =>
      place
        ? `Después seguimos en ${place}. Habrá comida, música y ganas de celebrar.`
        : 'Después seguimos con la recepción. Habrá comida, música y ganas de celebrar.',
  },

  dressCode: {
    title: 'Cómo vestirte',
    /** Se usa si `dress_code` está vacío en la pestaña Config. */
    nivelPorDefecto: 'Etiqueta formal',
    glosa: 'Vestido largo y traje oscuro. Es una boda de noche y queremos vernos así en las fotos.',
    ellos: { titulo: 'Ellos', texto: 'Esmoquin o traje oscuro, con corbata o corbatín.' },
    ellas: { titulo: 'Ellas', texto: 'Vestido largo, en el tono que prefieras.' },
    /**
     * La única restricción. Se dice qué evitar, no qué ponerse: es lo que el
     * invitado necesita saber, y es más corto que enumerar una paleta.
     */
    reserva: 'Solo dos colores quedan apartados: el blanco y el verde oliva son los nuestros esa noche.',
    referencias: {
      titulo: '¿Qué me pongo?',
      nota: 'Son solo ideas para orientarte. Si ya tienes algo que te encanta, ese es el vestuario correcto.',
    },
    practico: [
      'Ven con calzado con el que puedas bailar.',
      'Refresca de madrugada: un chal o un saco no sobra.',
    ],
  },

  rsvp: {
    title: '¿Nos acompañas?',
    /** El servidor sabe cuántos son; el texto se ajusta solo. */
    intro: (guestCount: number) =>
      guestCount === 1 ? 'Apartamos un lugar para ti.' : 'Apartamos estos lugares para ti.',
    instruction: (guestCount: number) =>
      guestCount === 1 ? 'Marca si puedes venir.' : 'Marca quién puede venir.',
    submit: 'Confirmar',
    editable: 'Puedes cambiar tu respuesta hasta el 31 de octubre.',
  },

  results: {
    all: 'Listo. Nos vemos el 7 de noviembre.',
    /** Nombra solo a quienes asisten. A los que no, nunca. */
    partial: (attending: string[]) => `Nos vemos con ${joinNames(attending)}.`,
    none: 'Gracias por avisarnos. Los vamos a extrañar.',
  },

  frozen: 'Cerramos la lista el 31 de octubre. Si algo cambió, escríbenos.',

  errors: {
    /** No se disculpa y dice qué hacer. */
    save: 'No pudimos guardar tu respuesta. Revisa tu conexión e inténtalo otra vez.',
    incomplete: (missing: string) => `Falta marcar a ${missing}.`,
    load: 'No pudimos cargar la invitación.',
    loadHint: 'Revisa tu conexión y vuelve a intentarlo en un momento.',
  },

  notFound: 'Esta invitación es privada',

  keepsake: {
    button: 'Descargar recuerdo',
    working: 'Generando…',
    error: 'No pudimos generar la imagen. Inténtalo otra vez.',
  },
} as const;

/** `Ana`, `Ana y Luis`, `Ana, Luis y Mateo`. */
export function joinNames(names: readonly string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}
