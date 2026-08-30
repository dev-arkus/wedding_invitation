import { Panel, Rule } from './Panel';
import { copy } from '../lib/copy';

/**
 * Cómo vestirte.
 *
 * Las muestras de color vienen de la referencia y son lo único que tomé de ella
 * sin dudarlo: **no son decoración, son instrucciones.** Alguien que lee
 * "Etiqueta" sigue sin saber de qué color ir; viendo la paleta, sí.
 *
 * Son los mismos tokens de la invitación, así que la página le está diciendo al
 * invitado de qué color va a ser el salón.
 */
const SWATCHES = [
  { token: 'bg-noche', label: 'azul noche' },
  { token: 'bg-navy', label: 'azul profundo' },
  { token: 'bg-azul-luz', label: 'azul acero' },
  { token: 'bg-oro', label: 'dorado' },
  { token: 'bg-luz', label: 'ámbar' },
  { token: 'bg-hueso', label: 'crema' },
];

export function DressCode({ value }: { value: string }) {
  if (!value) return null;

  return (
    <div className="px-5 py-8">
      <Panel tone="claro">
        <h2 className="font-display text-[clamp(1.75rem,8vw,2.25rem)]">{copy.dressCode.title}</h2>
        <Rule tone="claro" className="mt-5" />

        <p className="mt-6 font-display text-2xl leading-snug text-oro-tinta">{value}</p>

        <p className="mt-8 font-body text-xs font-light tracking-eyebrow text-navy/60">
          NUESTRA PALETA
        </p>
        <ul className="mt-4 flex flex-wrap gap-3">
          {SWATCHES.map((s) => (
            <li key={s.token}>
              <span
                className={`block h-9 w-9 rounded-full border border-navy/20 ${s.token}`}
                role="img"
                aria-label={s.label}
              />
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
