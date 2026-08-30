import 'server-only';
import { getRanges, batchUpdateValues, type RangeUpdate } from './google/sheets';
import { misaAt, recepcionAt, rsvpCutoffAt } from './env';
import { parseWallTime } from './time';

/**
 * Capa de dominio sobre el Google Sheet.
 *
 * El Sheet es la fuente de verdad y la pareja y la planner lo editan a mano en
 * paralelo con la aplicación. De ahí las dos reglas que gobiernan este archivo:
 *
 *  1. Se lee por NOMBRE de columna, nunca por letra. Si alguien reordena
 *     columnas o inserta una nueva, nada se rompe.
 *  2. Se escribe buscando por `id` y resolviendo la fila en la misma petición.
 *     Los índices de fila jamás se cachean: la planner puede insertar filas
 *     entre que leemos y escribimos, y una posición vieja escribiría sobre la
 *     persona equivocada.
 */

export const TAB_GUESTS = 'Invitados';
export const TAB_INVITATIONS = 'Invitaciones';
export const TAB_CONFIG = 'Config';

// Rangos anchos a propósito: columnas de más no molestan, columnas de menos sí.
const RANGE_GUESTS = `${TAB_GUESTS}!A1:Z`;
const RANGE_INVITATIONS = `${TAB_INVITATIONS}!A1:Z`;
const RANGE_CONFIG = `${TAB_CONFIG}!A1:B`;

export type GuestStatus = 'pendiente' | 'si' | 'no';
export type GuestKind = 'adulto' | 'nino';

export interface Guest {
  id: string;
  token: string;
  name: string;
  kind: GuestKind;
  status: GuestStatus;
}

export interface Invitation {
  token: string;
  /** Nombre del grupo, p. ej. "Familia Bastidas". Vacío si no está definido. */
  group: string;
  guests: Guest[];
}

/** Normaliza para comparar: sin acentos, sin espacios de sobra, en minúsculas. */
function norm(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // marcas combinantes: acentos y la tilde de la ñ
    .trim()
    .toLowerCase();
}

/** 0 -> A, 25 -> Z, 26 -> AA. */
export function columnLetter(index: number): string {
  let n = index;
  let out = '';
  do {
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

interface Table {
  /** Índice de columna por nombre normalizado. */
  columns: Map<string, number>;
  /** Filas de datos, con el número de fila real en la hoja (1-based). */
  rows: { sheetRow: number; cells: string[] }[];
}

function toTable(values: string[][]): Table {
  const [header = [], ...body] = values;
  const columns = new Map<string, number>();
  header.forEach((name, i) => {
    const key = norm(name);
    // La primera aparición gana: una columna duplicada no debe desplazar a la buena.
    if (key && !columns.has(key)) columns.set(key, i);
  });

  const rows = body.map((cells, i) => ({
    sheetRow: i + 2, // +1 por el encabezado, +1 porque las hojas son 1-based
    cells,
  }));

  return { columns, rows };
}

function cell(table: Table, row: { cells: string[] }, column: string): string {
  const index = table.columns.get(column);
  if (index === undefined) return '';
  return (row.cells[index] ?? '').trim();
}

function toStatus(raw: string): GuestStatus {
  const value = norm(raw);
  if (value === 'si') return 'si';
  if (value === 'no') return 'no';
  return 'pendiente';
}

function toKind(raw: string): GuestKind {
  // `norm` ya convirtió "niño" en "nino".
  return norm(raw) === 'nino' ? 'nino' : 'adulto';
}

function toGuest(table: Table, row: { cells: string[] }): Guest | null {
  const id = cell(table, row, 'id');
  const token = cell(table, row, 'token');
  const name = cell(table, row, 'nombre');
  // Sin id, token o nombre la fila no es un invitado: es una fila en blanco o
  // una nota que alguien dejó al final de la hoja.
  if (!id || !token || !name) return null;

  return {
    id,
    token,
    name,
    kind: toKind(cell(table, row, 'tipo')),
    status: toStatus(cell(table, row, 'estado')),
  };
}

/**
 * Lee la invitación de un token. Devuelve `null` si el token no existe o no
 * tiene invitados: desde fuera, ambos casos son indistinguibles y terminan en
 * el mismo 404.
 */
export async function getInvitation(token: string): Promise<Invitation | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const [guestValues, invitationValues] = await getRanges([RANGE_GUESTS, RANGE_INVITATIONS]);

  const guestTable = toTable(guestValues);
  const wanted = norm(trimmed);

  const guests = guestTable.rows
    .filter((row) => norm(cell(guestTable, row, 'token')) === wanted)
    .map((row) => toGuest(guestTable, row))
    .filter((guest): guest is Guest => guest !== null);

  if (guests.length === 0) return null;

  const invitationTable = toTable(invitationValues);
  const match = invitationTable.rows.find(
    (row) => norm(cell(invitationTable, row, 'token')) === wanted,
  );

  return {
    token: guests[0].token,
    group: match ? cell(invitationTable, match, 'grupo') : '',
    guests,
  };
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface WeddingConfig {
  /** Instantes resueltos. Nunca `null`: caen al valor de entorno si hace falta. */
  misaAt: number;
  recepcionAt: number;
  misa: PlaceConfig;
  recepcion: PlaceConfig;
  dressCode: string;
  closingMessage: string;
}

export interface PlaceConfig {
  place: string;
  address: string;
  /** `src` del iframe de maps/embed. Vacío = no se ofrece mapa. */
  mapEmbed: string;
  /** `lat,lng`. Vacío = no se ofrecen botones de navegación. */
  coords: string;
}

/**
 * Lee la pestaña `Config`.
 *
 * Ninguna clave ausente rompe nada: todo lo que falta queda en cadena vacía y
 * la sección correspondiente se omite al renderizar. Así la pareja puede ir
 * llenando el Sheet a su ritmo sin que la invitación se vea a medio hacer.
 */
export async function getConfig(): Promise<WeddingConfig> {
  let raw: string[][] = [];
  try {
    [raw] = await getRanges([RANGE_CONFIG]);
  } catch {
    // Config es opcional por diseño. Si la pestaña no existe todavía, se sigue
    // con los instantes de entorno y todas las secciones vacías.
    raw = [];
  }

  const map = new Map<string, string>();
  for (const [key, value] of raw) {
    if (key) map.set(norm(key), (value ?? '').trim());
  }

  const get = (key: string) => map.get(key) ?? '';

  return {
    misaAt: resolveInstant(get('misa_inicio'), misaAt(), 'misa_inicio'),
    recepcionAt: resolveInstant(get('recepcion_inicio'), recepcionAt(), 'recepcion_inicio'),
    misa: {
      place: get('misa_lugar'),
      address: get('misa_direccion'),
      mapEmbed: get('misa_maps'),
      coords: get('misa_coords'),
    },
    recepcion: {
      place: get('recepcion_lugar'),
      address: get('recepcion_direccion'),
      mapEmbed: get('recepcion_maps'),
      coords: get('recepcion_coords'),
    },
    dressCode: get('dress_code'),
    closingMessage: get('mensaje_cierre'),
  };
}

/**
 * Interpreta una hora de pared de la pestaña `Config` como hora de Caracas.
 *
 * Si la celda está vacía o no parsea, se usa el instante de entorno y se
 * registra una advertencia. El conteo regresivo nunca se cae por un dedazo.
 */
function resolveInstant(wall: string, fallback: number, key: string): number {
  if (!wall) return fallback;

  const parsed = parseWallTime(wall);
  if (parsed === null) {
    console.warn(
      `[config] ${key} = ${JSON.stringify(wall)} no es una hora válida ` +
        `(se espera "YYYY-MM-DD HH:mm"). Se usa el instante de entorno.`,
    );
    return fallback;
  }
  return parsed;
}

// ---------------------------------------------------------------------------
// Escritura del RSVP
// ---------------------------------------------------------------------------

export type RsvpAnswer = { id: string; status: Exclude<GuestStatus, 'pendiente'> };

export type SaveResult =
  | { ok: true; guests: Guest[] }
  | { ok: false; reason: 'not_found' | 'incomplete' };

/**
 * Guarda la respuesta de una invitación.
 *
 * Relee la hoja para resolver las filas por `id` justo antes de escribir, y
 * manda todos los cambios en un único `batchUpdate`. Solo toca las celdas
 * `estado` y `actualizado`: `nombre`, `tipo` y `notas` quedan intactas, incluso
 * si la planner acaba de escribir un comentario ahí.
 */
export async function saveRsvp(token: string, answers: RsvpAnswer[]): Promise<SaveResult> {
  const wanted = norm(token.trim());
  if (!wanted) return { ok: false, reason: 'not_found' };

  const [guestValues] = await getRanges([RANGE_GUESTS]);
  const table = toTable(guestValues);

  const statusColumn = table.columns.get('estado');
  const updatedColumn = table.columns.get('actualizado');
  if (statusColumn === undefined) {
    throw new Error(`La pestaña ${TAB_GUESTS} no tiene una columna "estado"`);
  }

  const rows = table.rows.filter((row) => norm(cell(table, row, 'token')) === wanted);
  const guests = rows
    .map((row) => ({ row, guest: toGuest(table, row) }))
    .filter((entry): entry is { row: typeof rows[number]; guest: Guest } => entry.guest !== null);

  if (guests.length === 0) return { ok: false, reason: 'not_found' };

  // Se exige una respuesta por cada invitado de la invitación. Así se distingue
  // "no viene" de "no respondió", y una petición armada a mano no puede dejar a
  // alguien en pendiente.
  const byId = new Map(answers.map((a) => [a.id, a.status]));
  if (byId.size !== guests.length || guests.some(({ guest }) => !byId.has(guest.id))) {
    return { ok: false, reason: 'incomplete' };
  }

  const timestamp = new Date().toISOString();
  const updates: RangeUpdate[] = [];

  for (const { row, guest } of guests) {
    const status = byId.get(guest.id)!;
    updates.push({
      range: `${TAB_GUESTS}!${columnLetter(statusColumn)}${row.sheetRow}`,
      values: [[status]],
    });
    if (updatedColumn !== undefined) {
      updates.push({
        range: `${TAB_GUESTS}!${columnLetter(updatedColumn)}${row.sheetRow}`,
        values: [[timestamp]],
      });
    }
  }

  await batchUpdateValues(updates);

  return {
    ok: true,
    guests: guests.map(({ guest }) => ({ ...guest, status: byId.get(guest.id)! })),
  };
}

// ---------------------------------------------------------------------------
// Comprobación de arranque
// ---------------------------------------------------------------------------

const WEEK_SECONDS = 604800;
let scheduleChecked = false;

/**
 * El corte es su propia constante y no se deriva de la hora de la misa: si se
 * derivara, mover la misa movería el corte en silencio. Da la casualidad de que
 * son exactamente 7 días, así que se verifica y se advierte si deja de serlo.
 */
export function checkScheduleCoherence(): void {
  if (scheduleChecked) return;
  scheduleChecked = true;

  const delta = (misaAt() - rsvpCutoffAt()) / 1000;
  if (delta !== WEEK_SECONDS) {
    console.warn(
      `[schedule] misa - corte = ${delta}s, se esperaban ${WEEK_SECONDS}s (7 días). ` +
        `El corte NO se movió: si el cambio fue intencional, actualiza RSVP_CUTOFF_AT.`,
    );
  }

  if (recepcionAt() <= misaAt()) {
    console.warn('[schedule] la recepción no queda después de la misa. Revisa los instantes.');
  }
}
