import { Monogram } from './Monogram';

/**
 * La hoja no respondió.
 *
 * Se distingue del 404 a propósito: el enlace puede estar perfectamente bien.
 * No se muestran trazas, mensajes de la API de Google ni identificadores
 * internos — eso queda solo en los logs del servidor.
 */
export function DataUnavailable() {
  return (
    <main className="grid min-h-dvh place-items-center p-8 text-center">
      <div className="max-w-sm">
        <Monogram className="text-[clamp(2rem,11vw,3.5rem)]" />
        <p className="mt-8 font-body text-base font-light leading-relaxed text-hueso/80">
          No pudimos cargar la invitación.
        </p>
        <p className="mt-2 font-body text-sm font-light leading-relaxed text-hueso/60">
          Revisa tu conexión y vuelve a intentarlo en un momento.
        </p>
      </div>
    </main>
  );
}
