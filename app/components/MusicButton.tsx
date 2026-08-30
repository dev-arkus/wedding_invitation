'use client';

import { useEffect, useRef, useState } from 'react';

export interface MusicButtonProps {
  /** Ruta del audio. Si no hay, el botón no se renderiza. */
  src?: string;
}

/**
 * Música de fondo, siempre bajo control del invitado.
 *
 * Nunca autoplay: los navegadores lo bloquean de todas formas y es agresivo.
 *
 * `preload="none"` es la decisión que más pesa. Un MP3 de tres minutos son unos
 * 3 MB; en datos móviles venezolanos eso es dinero de alguien, y la mayoría no
 * va a tocar el botón. El archivo no se pide hasta la primera pulsación.
 */
export function MusicButton({ src }: MusicButtonProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Si el invitado se va a otra pestaña o app, la música se calla.
    function onVisibility() {
      if (document.hidden) audioRef.current?.pause();
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  if (!src) return null;

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        // iOS exige un gesto del usuario para arrancar audio. La pulsación de
        // este botón lo es, así que aquí sí arranca.
        await audio.play();
      } catch {
        setPlaying(false);
        return;
      }
    } else {
      audio.pause();
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        className="fixed bottom-5 right-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-oro/50 bg-noche/85 backdrop-blur transition-colors hover:border-luz"
      >
        <span className="sr-only">{playing ? 'Pausar la música' : 'Reproducir la música'}</span>

        {playing ? (
          <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true" fill="currentColor" className="text-luz">
            <rect x="0" y="0" width="4" height="14" />
            <rect x="8" y="0" width="4" height="14" />
          </svg>
        ) : (
          <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true" fill="currentColor" className="text-luz">
            <path d="M0 0 L12 7 L0 14 Z" />
          </svg>
        )}
      </button>
    </>
  );
}
