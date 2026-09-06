import { notFound } from 'next/navigation';

import { NightSky } from '../../components/NightSky';
import { Hero } from '../../components/Hero';
import { Countdown } from '../../components/Countdown';
import { MisaSection } from '../../components/MisaSection';
import { RecepcionSection } from '../../components/RecepcionSection';
import { CouplePhoto } from '../../components/CouplePhoto';
import { MusicButton } from '../../components/MusicButton';
import { DataUnavailable } from '../../components/DataUnavailable';
import { DressCode } from '../../components/DressCode';
import { RsvpForm } from '../../components/RsvpForm';
import { RsvpReadOnly } from '../../components/RsvpReadOnly';

import { getConfig, getInvitation, checkScheduleCoherence } from '../../lib/registry';
import { SheetsError, explainSheetsError } from '../../lib/google/sheets';
import { backgroundMusic, churchPhoto, couplePhoto, venuePhoto } from '../../lib/photos';
import { serverNow, isRsvpClosed } from '../../lib/clock';
import { TIMEZONE } from '../../lib/time';
import { copy } from '../../lib/copy';

/**
 * La invitación.
 *
 * Siempre dinámica: lee el Sheet en cada visita, así una edición manual de la
 * planner se ve de inmediato. Con ~30 invitaciones abiertas unas pocas veces al
 * año no hay nada que valga la pena cachear.
 *
 * ── El ritmo de la página ────────────────────────────────────────────────────
 * Alternan tres tratamientos, y cada uno responde a lo que hace la sección:
 *
 *   franjas    contador y confirmación van a sangre, sin fondo y sin esquinas.
 *              Cortan la página y dejan ver el cielo entero.
 *   tarjetas   misa y recepción van en panel oscuro con filete. Son bloques de
 *              información que se consultan.
 *   crema      el dress code, y solo el dress code. Es la única sección que
 *              rompe la noche, y por eso destaca: es la que más gente va a
 *              buscar a propósito.
 */
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitationPage({ params }: PageProps) {
  const { token } = await params;

  checkScheduleCoherence();

  let invitation;
  let config;

  try {
    [invitation, config] = await Promise.all([getInvitation(token), getConfig()]);
  } catch (error) {
    // Un fallo de lectura NO es un 404: la invitación puede existir
    // perfectamente y ser el Sheet el que no responde.
    if (error instanceof SheetsError) {
      console.error(`[invitation] ${explainSheetsError(error.cause)}`);
      console.error('[invitation] detalle:', error.cause ?? error);
      return <DataUnavailable />;
    }
    throw error;
  }

  if (!invitation) notFound();

  const now = serverNow();
  // El corte lo decide el reloj del servidor, siempre. Aquí solo determina qué
  // se renderiza; el endpoint lo vuelve a comprobar antes de escribir.
  const closed = isRsvpClosed();

  const remaining = config.misaAt - now;
  const daysAway = Math.ceil(remaining / 86_400_000);

  // La fecha se formatea en servidor: así `Intl` no viaja al cliente y el texto
  // sale idéntico en todos los dispositivos, sin importar su configuración.
  const formattedDate = new Intl.DateTimeFormat('es-VE', {
    timeZone: TIMEZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(config.misaAt));

  return (
    <>
      <NightSky fromInstant={config.misaAt} toInstant={config.recepcionAt} />
      <MusicButton src={backgroundMusic ?? undefined} />

      <main className="relative">
        <section className="grid min-h-dvh place-items-center px-6">
          <Hero daysAway={daysAway} />
        </section>

        <CouplePhoto photo={couplePhoto} />

        {/* El contador va a sangre, sin esquinas y SIN FONDO: el cielo se ve a
            través. La legibilidad la sostiene el guardarraíl del propio bloque de
            texto, no un panel que tape las estrellas.

            Sin filete arriba: la foto de encima ya termina en onda, y una recta
            justo debajo de una curva delataba que son dos piezas distintas. */}
        <section className="border-b border-oro/25 px-5 py-16">
          <Countdown
            target={config.misaAt}
            initialRemaining={remaining}
            formattedDate={formattedDate}
            closingMessage={config.closingMessage}
          />
        </section>

        <MisaSection
          title={copy.misa.title}
          at={config.misaAt}
          venue={config.misa}
          body={copy.misa.body(config.misa.place)}
          photo={churchPhoto}
        />

        <RecepcionSection
          title={copy.recepcion.title}
          at={config.recepcionAt}
          venue={config.recepcion}
          body={copy.recepcion.body(config.recepcion.place)}
          photo={venuePhoto}
        />

        {/* Sin dress code definido la sección desaparece entera. */}
        <DressCode
          nivel={config.dressCode || copy.dressCode.nivelPorDefecto}
          glosa={config.dressCodeGlosa}
          reserva={config.dressCodeReserva}
        />

        {/* La confirmación va a sangre y sin fondo, igual que el contador: el
            cielo se ve a través. El `data-sky-guard` se acota al bloque de
            contenido —no a la sección entera— para que las estrellas solo se
            atenúen detrás del texto y no queden apagadas de lado a lado.

            Es la sección más exigente en legibilidad de toda la invitación:
            aquí no se lee, se decide. */}
        <section className="border-t border-oro/25 px-5 pb-28 pt-16">
          <div data-sky-guard className="mx-auto max-w-md">
            {closed ? (
              <RsvpReadOnly guests={invitation.guests} />
            ) : (
              <RsvpForm token={invitation.token} guests={invitation.guests} />
            )}
          </div>
        </section>
      </main>
    </>
  );
}
