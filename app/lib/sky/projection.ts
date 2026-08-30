/**
 * Proyección del cielo.
 *
 * Puerto directo del spike (`openspec/changes/.../spike/project.py`), validado
 * contra una carta celeste: la altitud de Polaris sale igual a la latitud del
 * observador, y la rotación entre la misa y la recepción da 30.08° de ascensión
 * recta.
 *
 * Sin dependencias y sin `server-only`: el navegador lo usa para el hero y el
 * canvas del recuerdo.
 */

/** San Cristóbal, Táchira. */
export const LATITUDE = 7.77;
export const LONGITUDE = -72.22;

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const MS_PER_DAY = 86_400_000;
const JD_UNIX_EPOCH = 2_440_587.5;

/** `[ascensión recta °, declinación °, magnitud]`. Formato del catálogo. */
export type StarTuple = [number, number, number];

export interface ProjectedStar {
  x: number;
  y: number;
  mag: number;
  /** Altitud sobre el horizonte, en grados. Útil para depurar. */
  alt: number;
}

export function julianDay(epochMs: number): number {
  return epochMs / MS_PER_DAY + JD_UNIX_EPOCH;
}

/** Tiempo sidéreo medio de Greenwich, en grados. */
export function gmstDegrees(jd: number): number {
  const t = (jd - 2451545.0) / 36525.0;
  const g =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000.0;
  return ((g % 360) + 360) % 360;
}

/** Tiempo sidéreo local, en grados, para un instante y una longitud. */
export function localSiderealDegrees(epochMs: number, longitude = LONGITUDE): number {
  return ((gmstDegrees(julianDay(epochMs)) + longitude) % 360 + 360) % 360;
}

/** Ecuatoriales a horizontales. Azimut medido desde el norte hacia el este. */
export function altAz(
  raDegrees: number,
  decDegrees: number,
  lstDegrees: number,
  latitude = LATITUDE,
): { alt: number; az: number } {
  const h = (lstDegrees - raDegrees) * D2R;
  const dec = decDegrees * D2R;
  const lat = latitude * D2R;

  const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(h);
  const alt = Math.asin(Math.min(1, Math.max(-1, sinAlt)));

  const az = Math.atan2(
    -Math.sin(h) * Math.cos(dec),
    Math.cos(lat) * Math.sin(dec) - Math.sin(lat) * Math.cos(dec) * Math.cos(h),
  );

  return { alt: alt * R2D, az: ((az * R2D) % 360 + 360) % 360 };
}

export interface ProjectOptions {
  width: number;
  height: number;
  lstDegrees: number;
  latitude?: number;
  /**
   * Radio del horizonte como múltiplo de la media diagonal del viewport.
   *
   * Atarlo a la DIAGONAL y no al ancho o al alto es lo que hace que el marco
   * quede cubierto de borde a borde en cualquier proporción de pantalla, sin
   * esquinas muertas. El spike descartó valores mayores: con 1.5 entran 181
   * estrellas y el campo se ve vacío, cuando las fotos de la decoración tienen
   * cientos de luces.
   */
  coverage?: number;
  /** Margen en px fuera del marco. Evita que las estrellas del borde parpadeen al rotar. */
  margin?: number;
}

/**
 * Proyección estereográfica centrada en el cenit.
 *
 *   z = 90° − altitud
 *   r = R · tan(z / 2)
 *
 * Solo devuelve estrellas sobre el horizonte y dentro del marco.
 */
export function projectSky(stars: readonly StarTuple[], options: ProjectOptions): ProjectedStar[] {
  const { width, height, lstDegrees, latitude = LATITUDE, coverage = 1, margin = 48 } = options;

  const radius = Math.hypot(width / 2, height / 2) * coverage;
  const cx = width / 2;
  const cy = height / 2;

  const out: ProjectedStar[] = [];

  for (const [ra, dec, mag] of stars) {
    const { alt, az } = altAz(ra, dec, lstDegrees, latitude);
    if (alt <= 0) continue;

    const r = radius * Math.tan(((90 - alt) * D2R) / 2);
    const a = az * D2R;
    const x = cx + r * Math.sin(a);
    const y = cy - r * Math.cos(a);

    if (x < -margin || x > width + margin || y < -margin || y > height + margin) continue;

    out.push({ x, y, mag, alt });
  }

  return out;
}

/**
 * Brillo normalizado de una estrella, en [0, 1].
 *
 * Los exponentes de radio y opacidad (ver abajo) están altos a propósito:
 * comprimen las tenues en un rumor de fondo y dejan que las cuatro brillantes
 * anclen la composición. Con una curva lineal el campo se ve plano.
 */
export function brightness(mag: number): number {
  return Math.min(1, Math.max(0, (4.6 - mag) / 6.1));
}

export function starRadius(mag: number): number {
  return 1 + Math.pow(brightness(mag), 2.5) * 7;
}

export function starAlpha(mag: number): number {
  return 0.22 + Math.pow(brightness(mag), 1.4) * 0.78;
}

/**
 * Umbral de destello. A la hora de la misa son exactamente cuatro estrellas:
 * Vega, Altair, Deneb y Fomalhaut — el Triángulo de Verano más Fomalhaut.
 *
 * No es adorno de más: los globos de vidrio de la decoración también destellan.
 */
export const SPIKE_MAGNITUDE = 1.3;
