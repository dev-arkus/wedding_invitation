/**
 * Las fotos de la invitación.
 *
 * Van en el repo y no en la pestaña `Config`: son binarios que se ponen una vez
 * y no se vuelven a tocar, y aquí `next/image` los optimiza en el build. Una URL
 * suelta en el Sheet se saltaría toda esa optimización y llegaría pesada.
 *
 * ── Cómo agregar una foto ────────────────────────────────────────────────────
 *   1. Deja el archivo en `public/fotos/`.
 *   2. Descomenta su entrada aquí abajo y ajusta el `alt`.
 *
 * Mientras una entrada esté en `null`, su sección simplemente no se renderiza.
 * No queda un hueco ni un marco vacío: la invitación se ve terminada en todo
 * momento, así que pueden ir agregándolas a su ritmo.
 *
 * ── Formato ──────────────────────────────────────────────────────────────────
 * JPG o PNG tal como salen de la cámara. NO hay que convertirlas ni tonificarlas
 * a mano: `next/image` las reescala y las sirve en AVIF o WebP según lo que
 * soporte el navegador, y el viraje de color se aplica por CSS.
 *
 * Manden la resolución alta (1600–2500px de ancho está bien). Next genera los
 * tamaños pequeños solo; partir de algo grande da mejor resultado que de algo ya
 * comprimido.
 *
 * ── Presupuesto ──────────────────────────────────────────────────────────────
 * Las tres van por debajo del pliegue y cargan diferidas, así que no cuentan en
 * la primera pintada. Lo que Next termina sirviendo debería quedar cerca de:
 *
 *   pareja    ≤ 80 KB   duotono navy → ámbar, a sangre, sin marco
 *   iglesia   ≤ 50 KB   3:2 horizontal, virada apenas, enmarcada
 *   salón     ≤ 50 KB   3:2 horizontal, virada apenas, enmarcada
 */

export interface Photo {
  src: string;
  alt: string;
}

/**
 * A sangre, sin marco: pertenece a la noche. Es la bisagra entre lo emocional y
 * lo práctico, y va antes de la misa.
 *
 * El duotono se aplica por CSS, no hay que preparar la imagen. Se deja el JPG
 * original y ya.
 */
//export const couplePhoto: Photo | null = { src: '/fotos/pareja.jpg', alt: 'Dayona y Javier' };
export const couplePhoto: Photo | null = {
   src: '/fotos/pareja.jpg',
   alt: 'Dayona y Javier',
};

/**
 * Contenida y enmarcada con filete: es referencia, no sentimiento. Se vira solo
 * un poco a propósito — un duotono fuerte volvería la fachada irreconocible, y
 * el punto entero de esta foto es que la reconozcan al llegar.
 */
//export const churchPhoto: Photo | null = { src: '/fotos/iglesia.jpg', alt: 'Fachada de la parroquia' };
export const churchPhoto: Photo | null = {
   src: '/fotos/iglesia.jpg',
   alt: 'Fachada de la parroquia',
};

//export const venuePhoto: Photo | null = { src: '/fotos/salon.jpg', alt: 'Salón de la recepción' };
export const venuePhoto: Photo | null = {
   src: '/fotos/salon.jpg',
   alt: 'Salón de la recepción',
 };

/**
 * Fotos de referencia del dress code.
 *
 * Se muestran dentro del desplegable «¿Qué me pongo?». Si la lista está vacía,
 * ese desplegable no aparece: una sección plegable con una sola línea de texto
 * dentro no vale el clic.
 *
 * Van en `public/fotos/` igual que las demás, en vertical.
 *
 * Para agregar o quitar una, se edita esta lista — no hay que descomentar nada.
 * Y conviene cambiar los `alt` por lo que se ve de verdad en cada foto
 * («vestido largo azul», «traje oscuro con corbatín»): es lo único que oye
 * alguien que use lector de pantalla.
 */
export const dressCodeRefs: Photo[] = [
  { src: '/fotos/dress-1.jpg', alt: 'Referencia de vestuario 1' },
  { src: '/fotos/dress-2.jpg', alt: 'Referencia de vestuario 2' },
  { src: '/fotos/dress-3.jpg', alt: 'Referencia de vestuario 3' },
];

/**
 * Música de fondo. `null` = no se muestra el botón.
 *
 * Si la canción es comercial y se aloja aquí, es técnicamente una infracción.
 * En una invitación privada de 70 personas nadie va a reclamar, pero que sea
 * una decisión consciente y no un descuido.
 */
export const backgroundMusic: string | null = null;
// export const backgroundMusic: string | null = '/audio/cancion.mp3';
