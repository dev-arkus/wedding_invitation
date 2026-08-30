import { formatTime, hourMarker } from '../lib/time';
import { PlaceBlock, type PlaceBlockProps } from './PlaceBlock';
import { Panel, Rule, Eyebrow } from './Panel';
import type { PlaceConfig } from '../lib/registry';

export interface EventSectionProps {
  /** `La misa` o `La recepción`. */
  title: string;
  /** Instante del evento. De aquí salen el marcador romano y la hora. */
  at: number;
  place: PlaceConfig;
  body: string;
  photo?: PlaceBlockProps['photo'];
}

/**
 * Una de las dos secciones de la noche.
 *
 * El marcador es la HORA en numeral romano (`VI · 00`, `VIII · 00`), no
 * `01 / 02`. Las secciones no son una lista numerada: son una noche en dos
 * actos, a dos horas concretas. El marcador carga información real — y ahora,
 * con una tipografía lapidaria, además se ve en su sitio.
 *
 * Todo sale del instante del evento, así que cambiar la hora en la pestaña
 * `Config` mueve a la vez el marcador, la hora mostrada y el conteo regresivo.
 */
export function EventSection({ title, at, place, body, photo }: EventSectionProps) {
  return (
    <div className="px-5 py-8">
      <Panel>
        <div className="flex items-baseline justify-between gap-4">
          <Eyebrow>{hourMarker(at)}</Eyebrow>
          <p className="font-body text-xs font-light tracking-eyebrow text-hueso/60">
            {formatTime(at)}
          </p>
        </div>

        <h2 className="mt-5 font-display text-[clamp(2rem,10vw,2.75rem)] leading-tight">
          {title}
        </h2>

        <Rule className="mt-5" />

        <p className="mt-6 font-body text-base font-light leading-relaxed text-hueso/85">{body}</p>

        {place.place && <p className="mt-7 font-display text-xl leading-snug">{place.place}</p>}
        {place.address && (
          <p className="mt-1.5 font-body text-sm font-light leading-relaxed text-hueso/60">
            {place.address}
          </p>
        )}

        <PlaceBlock
          label={place.place || title}
          mapEmbed={place.mapEmbed}
          coords={place.coords}
          photo={photo}
        />
      </Panel>
    </div>
  );
}
