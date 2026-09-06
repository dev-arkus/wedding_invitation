import { Rule } from './Panel';
import { DressCodeRefs } from './DressCodeRefs';
import { copy } from '../lib/copy';
import { dressCodeRefs } from '../lib/photos';

/**
 * Cómo vestirte.
 *
 * Sigue el `dress-code-ficha-marino.html` que pasó la pareja. Es la sección con
 * más piezas de toda la invitación, y cada una responde una pregunta distinta
 * que el invitado se hace en orden:
 *
 *   1. ¿qué nivel es?        el titular
 *   2. ¿qué significa?       la glosa
 *   3. ¿y en concreto?       las dos siluetas
 *   4. ¿hay algo prohibido?  la reserva de colores
 *   5. ¿me das ejemplos?     el desplegable
 *
 * Lo que se cayó respecto a la versión anterior fueron las muestras de la
 * paleta. Decirle a alguien **qué evitar** —blanco y verde oliva— es lo que de
 * verdad necesita; enseñarle los seis colores de la boda no le dice qué
 * ponerse.
 */
export function DressCode({
  nivel,
  glosa,
  reserva,
}: {
  nivel: string;
  glosa?: string;
  reserva?: string;
}) {
  // Sin nivel definido la sección entera desaparece: sin título huérfano, sin
  // "por confirmar", sin hueco.
  if (!nivel) return null;

  const c = copy.dressCode;

  return (
    /*
     * A sangre y sin esquinas: la única sección clara de la invitación ocupa el
     * ancho completo. Siendo la que más gente va a buscar a propósito, cortar la
     * noche entera de lado a lado la vuelve imposible de pasar por alto.
     */
    <section className="bg-hueso px-6 py-16 text-center text-navy sm:py-20">
      <div className="mx-auto max-w-md">
        <p className="font-body text-[0.68rem] font-normal uppercase tracking-[0.4em] text-oro-tinta">
          {c.title}
        </p>

        <h2 className="mt-4 font-display text-[clamp(2rem,9vw,3rem)] leading-none">{nivel}</h2>

        <p className="mx-auto mt-5 max-w-[34ch] font-body text-[1.05rem] font-normal leading-relaxed text-navy/85">
          {glosa || c.glosa}
        </p>

        <Rule tone="claro" className="mx-auto mt-9" />

        <div className="mt-9 flex flex-wrap justify-center gap-x-[clamp(0.75rem,5vw,2.5rem)] gap-y-10">
          <Silueta titulo={c.ellos.titulo} texto={c.ellos.texto} tipo="traje" />
          <Silueta titulo={c.ellas.titulo} texto={c.ellas.texto} tipo="vestido" />
        </div>

        <p className="mx-auto mb-9 mt-11 max-w-[32ch] font-body text-[1rem] font-normal leading-relaxed text-oro-tinta">
          {reserva || c.reserva}
        </p>

        {dressCodeRefs.length > 0 && (
          <DressCodeRefs
            refs={dressCodeRefs}
            titulo={c.referencias.titulo}
            nota={c.referencias.nota}
          />
        )}

      </div>
    </section>
  );
}

/**
 * Silueta de línea.
 *
 * Dibujadas y no fotografiadas a propósito: una foto de un traje concreto se
 * lee como una instrucción de comprar ESE traje. Una línea comunica la forma y
 * deja la elección abierta, que es justo lo que dice el texto de abajo.
 */
function Silueta({ titulo, texto, tipo }: { titulo: string; texto: string; tipo: 'traje' | 'vestido' }) {
  return (
    <div className="w-[10rem]">
      <svg
        width="92"
        height="124"
        viewBox="0 0 120 160"
        role="img"
        aria-label={tipo === 'traje' ? 'Traje formal' : 'Vestido largo'}
        className="mx-auto mb-3.5 block fill-none stroke-oro-tinta stroke-[1.3] [stroke-linecap:round] [stroke-linejoin:round]"
      >
        {tipo === 'traje' ? (
          <>
            <path d="M22 150 L26 52 C28 36 40 24 54 20 L60 34 L66 20 C80 24 92 36 94 52 L98 150" />
            <path d="M54 20 L44 60 L60 88 L76 60 L66 20" />
            <path d="M60 27 L48 21 L48 33 Z M60 27 L72 21 L72 33 Z" />
            <circle cx="60" cy="27" r="2.4" />
          </>
        ) : (
          <>
            <path d="M46 26 L60 48 L74 26" />
            <path d="M46 26 L44 66 C30 92 22 120 18 150 L102 150 C98 120 90 92 76 66 L74 26" />
            <path d="M44 66 L76 66" />
            <path d="M56 74 C50 102 46 126 44 150" />
            <path d="M64 74 C70 102 74 126 76 150" />
          </>
        )}
      </svg>

      <h3 className="mb-2 font-display text-[1.65rem] leading-tight">{titulo}</h3>
      <p className="font-body text-[1rem] font-normal leading-relaxed text-navy/85">{texto}</p>
    </div>
  );
}
