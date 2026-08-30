/**
 * Tiempo.
 *
 * Regla única: los instantes se guardan y comparan en UTC absoluto; la zona
 * `America/Caracas` se usa solo para leer o mostrar horas de pared.
 *
 * Venezuela es UTC−4 sin horario de verano, pero movió su huso dos veces en
 * veinte años (−4 → −4:30 en 2007 → −4 en 2016). Por eso nunca se escribe un
 * `-4` en duro: se usa la zona IANA y `Intl` resuelve las reglas vigentes.
 */

export const TIMEZONE = 'America/Caracas';

/**
 * Desfase de la zona respecto a UTC, en milisegundos, para un instante dado.
 * Positivo al este de Greenwich.
 */
function zoneOffsetMs(instantMs: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts: Record<string, number> = {};
  for (const { type, value } of dtf.formatToParts(new Date(instantMs))) {
    if (type !== 'literal') parts[type] = Number(value);
  }

  // `hour` puede venir como 24 para la medianoche en el ciclo h23/h24.
  const asIfUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour % 24,
    parts.minute,
    parts.second,
  );

  return asIfUtc - instantMs;
}

/**
 * Convierte una hora de pared de Caracas (`YYYY-MM-DD HH:mm`, con `T` o espacio)
 * al instante absoluto correspondiente. Devuelve `null` si no parsea.
 *
 * Dos pasadas: se estima el desfase con una primera aproximación y se corrige.
 * Con una zona sin horario de verano converge de una, pero la segunda pasada
 * sale gratis y mantiene el cálculo correcto si las reglas llegaran a cambiar.
 */
export function parseWallTime(input: string, timeZone: string = TIMEZONE): number | null {
  const m = /^\s*(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/.exec(input);
  if (!m) return null;

  const [, y, mo, d, h, mi, s] = m;
  const naive = Date.UTC(+y, +mo - 1, +d, +h, +mi, s ? +s : 0);
  if (Number.isNaN(naive)) return null;

  let instant = naive - zoneOffsetMs(naive, timeZone);
  instant = naive - zoneOffsetMs(instant, timeZone);
  return instant;
}

/** Partes de la hora de pared en Caracas para un instante dado. */
export function wallParts(instantMs: number, timeZone: string = TIMEZONE) {
  const dtf = new Intl.DateTimeFormat('es-VE', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const parts: Record<string, string> = {};
  for (const { type, value } of dtf.formatToParts(new Date(instantMs))) {
    if (type !== 'literal') parts[type] = value;
  }

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
  };
}

const ROMAN: ReadonlyArray<readonly [number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n <= 0) return '';
  let rest = n;
  let out = '';
  for (const [value, symbol] of ROMAN) {
    while (rest >= value) {
      out += symbol;
      rest -= value;
    }
  }
  return out;
}

/**
 * Marcador estructural de sección: la hora del evento en numeral romano.
 * Las 18:00 de Caracas se leen `VI · 00`; las 20:00, `VIII · 00`.
 */
export function hourMarker(instantMs: number): string {
  const { hour, minute } = wallParts(instantMs);
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${toRoman(h12)} · ${String(minute).padStart(2, '0')}`;
}
/**
 * Hora de pared en formato `6:00 PM`.
 *
 * `es-VE` produce `6:00 p. m.`, con puntos y un espacio fino. Se arma a mano en
 * vez de dejar que el locale decida: la tipografía de la invitación pide `PM`
 * limpio, y el resultado no debe cambiar si cambia la versión de ICU.
 */
export function formatTime(instantMs: number): string {
  const { hour, minute } = wallParts(instantMs);
  const suffix = hour < 12 ? 'AM' : 'PM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${suffix}`;
}
