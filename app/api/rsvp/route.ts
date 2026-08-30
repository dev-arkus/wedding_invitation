import { NextResponse } from 'next/server';
import { saveRsvp, type RsvpAnswer } from '../../lib/registry';
import { SheetsError, explainSheetsError } from '../../lib/google/sheets';
import { isRsvpClosed } from '../../lib/clock';

export const dynamic = 'force-dynamic';

/**
 * Registrar la confirmación de una invitación.
 *
 * Todas las reglas se revalidan aquí, no en el cliente. El navegador puede
 * mentir sobre cualquier cosa: la hora de su reloj, qué invitados existen, o
 * cuántos hay. Este endpoint asume que la petición viene armada a mano.
 */

interface RsvpBody {
  token?: unknown;
  answers?: unknown;
}

/** Valida la forma sin confiar en nada. */
function parseAnswers(raw: unknown): RsvpAnswer[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 50) return null;

  const out: RsvpAnswer[] = [];
  const seen = new Set<string>();

  for (const entry of raw) {
    if (typeof entry !== 'object' || entry === null) return null;

    const { id, status } = entry as { id?: unknown; status?: unknown };
    if (typeof id !== 'string' || !id || id.length > 64) return null;
    if (status !== 'si' && status !== 'no') return null;

    // Un id repetido convertiría la respuesta en ambigua.
    if (seen.has(id)) return null;
    seen.add(id);

    out.push({ id, status });
  }

  return out;
}

export async function POST(request: Request) {
  let body: RsvpBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token.trim() : '';
  if (!token || token.length > 64) {
    return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 });
  }

  const answers = parseAnswers(body.answers);
  if (!answers) {
    return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 });
  }

  // El corte lo decide el reloj del SERVIDOR. Un invitado que atrase el reloj de
  // su teléfono llega igual aquí y se va con un rechazo. Se comprueba antes de
  // tocar la hoja: una escritura tardía no debe ni intentarse.
  if (isRsvpClosed()) {
    return NextResponse.json({ ok: false, reason: 'closed' }, { status: 403 });
  }

  try {
    const result = await saveRsvp(token, answers);

    if (!result.ok) {
      // `not_found` se responde como 404 e `incomplete` como 422. Ninguno de los
      // dos escribió nada en la hoja.
      const status = result.reason === 'not_found' ? 404 : 422;
      return NextResponse.json({ ok: false, reason: result.reason }, { status });
    }

    const attending = result.guests.filter((g) => g.status === 'si').map((g) => g.name);

    return NextResponse.json({
      ok: true,
      attending,
      total: result.guests.length,
    });
  } catch (error) {
    if (error instanceof SheetsError) {
      console.error(`[rsvp] ${explainSheetsError(error.cause)}`);
      console.error('[rsvp] detalle:', error.cause ?? error);
    } else {
      console.error('[rsvp] fallo inesperado', error);
    }
    // Al invitado nunca le llega el detalle técnico.
    return NextResponse.json({ ok: false, reason: 'save_failed' }, { status: 502 });
  }
}
