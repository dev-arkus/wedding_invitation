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
    glosa: 'Vestido largo y traje.',
    /**
     * El aviso de color va PEGADO a cada silueta, no en una frase aparte.
     *
     * Antes era una línea suelta que hablaba de los dos colores a la vez, y
     * obligaba al invitado a decidir cuál le tocaba. Puesto debajo de su propia
     * figura, cada quien lee solo lo suyo.
     */
    ellos: {
      titulo: 'Ellos',
      texto: 'Esmoquin o traje, con corbata o corbatín.',
      aviso: 'Evitar color verde oliva.',
    },
    ellas: {
      titulo: 'Ellas',
      texto: 'Vestido largo, en el tono que prefieras.',
      aviso: 'Evitar color blanco o tonos que se asemejen.',
    },
    referencias: {
      titulo: 'Algunas ideas',
      nota: 'Son solo ideas para orientarte. Si ya tienes algo que te encanta, ese es el vestuario correcto.',
    },
  },

  rsvp: {
    title: '¿Nos acompañas?',
    /** Epígrafe sobre el conteo de pases. */
    epigrafe: 'Tu invitación incluye',
    /**
     * El titular es el número de pases, no el nombre del grupo.
     *
     * Es la pieza de copy que más trabajo hace de toda la invitación: dice de
     * entrada cuántos lugares hay, así que la regla —los nombres vienen puestos
     * y no se puede sumar gente— queda dicha sin tener que explicarla.
     */
    pases: (n: number) => (n === 1 ? '1 pase' : `${n} pases`),
    ayuda: (n: number) =>
      n === 1
        ? 'Marca si puedes acompañarnos el sábado 7 de noviembre.'
        : 'Marca quién puede acompañarnos el sábado 7 de noviembre.',
    /** El servidor sabe cuántos son; el texto se ajusta solo. */
    intro: (guestCount: number) =>
      guestCount === 1 ? 'Apartamos un lugar para ti.' : 'Apartamos estos lugares para ti.',
    instruction: (guestCount: number) =>
      guestCount === 1 ? 'Marca si puedes venir.' : 'Marca quién puede venir.',
    submit: 'Guardar mi respuesta',
    /**
     * Resumen del pie. Solo aparece cuando ya no falta nadie por marcar:
     * contar a medias distrae más de lo que informa.
     */
    resumenNinguno: 'Ninguno podrá asistir',
    resumenTodos: (total: number) => (total === 1 ? 'Confirmado' : `Asisten los ${total}`),
    resumenParcial: (van: number, total: number) => `Asisten ${van} de ${total}`,
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
