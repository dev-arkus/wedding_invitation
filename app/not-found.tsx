import { Monogram } from './components/Monogram';

/**
 * 404.
 *
 * Idéntico para la raíz, un token inexistente y cualquier ruta desconocida: no
 * revela si un token existe o no. Y no explica nada — la pareja lo pidió así.
 */
export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-8 text-center">
      <div>
        <Monogram className="text-[clamp(2.5rem,14vw,4.5rem)]" />
        <p className="mt-8 font-body text-sm font-light tracking-eyebrow text-hueso/60">
          Esta invitación es privada
        </p>
      </div>
    </main>
  );
}
