import 'server-only';

/**
 * Variables de entorno.
 *
 * Todo lo que decide una regla de negocio vive aquí y no en la pestaña `Config`
 * del Sheet. La pareja y la planner editan el Sheet a mano: un dedazo en una
 * celda no puede poder abrir ni cerrar el RSVP.
 *
 * Los accesos son perezosos a propósito. Si se leyeran al importar el módulo,
 * `next build` fallaría en cualquier máquina sin credenciales cargadas.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

/** Un instante absoluto en ISO 8601 con zona (p. ej. `2026-11-07T22:00:00Z`). */
function instant(name: string): number {
  const raw = required(name);
  const ms = Date.parse(raw);
  if (Number.isNaN(ms)) {
    throw new Error(`${name} no es un instante ISO 8601 válido: ${raw}`);
  }
  return ms;
}

export const googleClientEmail = () => required('GOOGLE_CLIENT_EMAIL');

/**
 * En Vercel la clave privada se guarda con `\n` escapados. Hay que convertirlos
 * a saltos de línea reales o la firma JWT falla. Mismo arreglo que en djfinanzas.
 */
export const googlePrivateKey = () => required('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n');

export const sheetId = () => required('GOOGLE_SHEET_ID');

export const misaAt = () => instant('WEDDING_MISA_AT');
export const recepcionAt = () => instant('WEDDING_RECEPCION_AT');
export const rsvpCutoffAt = () => instant('RSVP_CUTOFF_AT');

/**
 * Override del reloj, solo para poder probar el estado congelado antes de
 * octubre de 2026. Se ignora en producción: sin esto, el modo lectura se
 * probaría el día en que ya no importa.
 */
export function nowOverride(): number | null {
  if (process.env.VERCEL_ENV === 'production') return null;
  const raw = process.env.DEV_NOW_OVERRIDE;
  if (!raw) return null;
  const ms = Date.parse(raw);
  return Number.isNaN(ms) ? null : ms;
}
