import 'server-only';
import { JWT } from 'google-auth-library';
import { googleClientEmail, googlePrivateKey, sheetId } from '../env';

/**
 * Cliente mínimo de Google Sheets sobre la API REST.
 *
 * Se usa `google-auth-library` en vez del paquete `googleapis` completo: solo
 * hacen falta dos llamadas (`values.get` y `values:batchUpdate`), y el envoltorio
 * pesa 103 MB contra 764 KB. Menos arranque en frío en Vercel y una cadena de
 * dependencias más corta. Ver D1b en design.md.
 */

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const API = 'https://sheets.googleapis.com/v4/spreadsheets';

let client: JWT | null = null;

function auth(): JWT {
  if (!client) {
    client = new JWT({
      email: googleClientEmail(),
      key: googlePrivateKey(),
      scopes: SCOPES,
    });
  }
  return client;
}

/** Error de la capa de datos. Nunca se muestra tal cual al invitado. */
export class SheetsError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'SheetsError';
  }
}

/**
 * Traduce el código HTTP de la API de Sheets a la causa real y su arreglo.
 *
 * Los tres fallos de configuración se parecen mucho en los logs crudos y se
 * confunden con facilidad. Distinguirlos ahorra una tarde entera:
 *
 *   401  la firma JWT no sirve      -> la clave privada llegó mal
 *   403  autenticó pero no ve nada  -> falta compartir la hoja
 *   404  autenticó y no existe      -> el ID de la hoja está mal
 */
export function explainSheetsError(error: unknown): string {
  const status = (error as { code?: number; status?: number } | null)?.code
    ?? (error as { status?: number } | null)?.status;

  switch (status) {
    case 401:
      return 'Google rechazó las credenciales. Revisa GOOGLE_PRIVATE_KEY: en Vercel debe ir en una línea con los \\n escapados.';
    case 403:
      return 'Las credenciales sirven, pero el service account no tiene acceso. Comparte el Sheet con GOOGLE_CLIENT_EMAIL como Editor.';
    case 404:
      return 'Las credenciales sirven, pero no existe ninguna hoja con ese ID. Revisa GOOGLE_SHEET_ID, o crea el Sheet (ver docs/google-sheet.md).';
    case 429:
      return 'Se superó la cuota de la API de Sheets. Reintenta en un minuto.';
    default:
      return 'Fallo inesperado hablando con Google Sheets.';
  }
}

/**
 * Lee un rango en notación A1 (p. ej. `Invitados!A:G`).
 * Las filas cortas de Sheets vienen truncadas: se rellenan a la longitud del
 * encabezado en la capa de arriba, no aquí.
 */
export async function getRange(range: string): Promise<string[][]> {
  const url =
    `${API}/${sheetId()}/values/${encodeURIComponent(range)}` +
    `?majorDimension=ROWS&valueRenderOption=UNFORMATTED_VALUE`;

  try {
    const res = await auth().request<{ values?: unknown[][] }>({ url });
    return (res.data.values ?? []).map((row) =>
      row.map((cell) => (cell == null ? '' : String(cell))),
    );
  } catch (error) {
    throw new SheetsError(`No se pudo leer el rango ${range}`, error);
  }
}

/** Lee varios rangos en una sola petición. Devuelve los valores en el mismo orden. */
export async function getRanges(ranges: string[]): Promise<string[][][]> {
  const query = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&');
  const url =
    `${API}/${sheetId()}/values:batchGet` +
    `?${query}&majorDimension=ROWS&valueRenderOption=UNFORMATTED_VALUE`;

  try {
    const res = await auth().request<{ valueRanges?: { values?: unknown[][] }[] }>({ url });
    const out = res.data.valueRanges ?? [];
    return ranges.map((_, i) =>
      (out[i]?.values ?? []).map((row) => row.map((cell) => (cell == null ? '' : String(cell)))),
    );
  } catch (error) {
    throw new SheetsError(`No se pudieron leer los rangos ${ranges.join(', ')}`, error);
  }
}

export interface RangeUpdate {
  /** Rango en notación A1, resuelto justo antes de escribir. */
  range: string;
  values: (string | number)[][];
}

/**
 * Escribe varios rangos en una sola operación atómica.
 *
 * `RAW` y no `USER_ENTERED`: los valores se guardan tal cual y Sheets no
 * reinterpreta nada. Un nombre que empiece por `=` o `+` no debe convertirse
 * en fórmula.
 */
export async function batchUpdateValues(updates: RangeUpdate[]): Promise<void> {
  if (updates.length === 0) return;

  const url = `${API}/${sheetId()}/values:batchUpdate`;

  try {
    await auth().request({
      url,
      method: 'POST',
      data: {
        valueInputOption: 'RAW',
        data: updates.map(({ range, values }) => ({ range, values })),
      },
    });
  } catch (error) {
    throw new SheetsError('No se pudo escribir en la hoja', error);
  }
}
