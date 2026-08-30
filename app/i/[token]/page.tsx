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
import { Panel, Rule } from '../../components/Panel';

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
 * ── El ritmo claro/oscuro ────────────────────────────────────────────────────
 * Hero, contador, misa y recepción van oscuros: son la atmósfera, y el cielo
 * tiene que verse. Dress code y confirmación van claros: son donde el invitado
 * ACTÚA, y una superficie crema les da el mejor contraste de la página.
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
            texto, no un panel que tape las estrellas. */}
        <section className="border-y border-oro/25 px-5 py-16">
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
        <DressCode value={config.dressCode} />

        <div className="px-5 pb-28 pt-8">
          <Panel tone="claro">
            <h2 className="font-display text-[clamp(1.9rem,9vw,2.6rem)]">{copy.rsvp.title}</h2>
            <Rule tone="claro" className="mt-5" />

            <div className="mt-7">
              {closed ? (
                <RsvpReadOnly guests={invitation.guests} />
              ) : (
                <RsvpForm token={invitation.token} guests={invitation.guests} />
              )}
            </div>
          </Panel>
        </div>
      </main>
    </>
  );
}
