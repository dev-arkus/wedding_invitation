import 'server-only';
import { nowOverride, rsvpCutoffAt } from './env';

/**
 * El reloj del servidor.
 *
 * Es la ÚNICA autoridad sobre si el RSVP está abierto. El reloj del dispositivo
 * del invitado no decide nada: se puede atrasar en dos toques.
 */
export function serverNow(): number {
  return nowOverride() ?? Date.now();
}

/** ¿Ya cerró la lista? */
export function isRsvpClosed(): boolean {
  return serverNow() >= rsvpCutoffAt();
}
