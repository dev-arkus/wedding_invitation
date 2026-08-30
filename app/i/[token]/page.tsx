import { notFound } from 'next/navigation';

import { NightSky } from '../../components/NightSky';
import { Lockup } from '../../components/Lockup';
import { Countdown } from '../../components/Countdown';
import { EventSection } from '../../components/EventSection';
import { CouplePhoto } from '../../components/CouplePhoto';
import { MusicButton } from '../../components/MusicButton';
import { DataUnavailable } from '../../components/DataUnavailable';
import { DressCode } from '../../components/DressCode';
import { Panel, Rule } from '../../components/Panel';
import { RsvpForm } from '../../components/RsvpForm';
import { RsvpReadOnly } from '../../components/RsvpReadOnly';

import { getConfig, getInvitation, checkScheduleCoherence } from '../../lib/registry';
import { SheetsError, explainSheetsError } from '../../lib/google/sheets';
import { backgroundMusic, churchPhoto, couplePhoto, venuePhoto } from '../../lib/photos';
import { serverNow, isRsvpClosed } from '../../lib/clock';
import { copy } from '../../lib/copy';

/**
 * La invitación.
 *
 * Siempre dinámica: lee el Sheet en cada visita, así una edición manual de la
 * planner se ve de inmediato. Con ~30 invitaciones abiertas unas pocas veces al
 * año no hay nada que valga la pena cachear.
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
    // perfectamente y ser el Sheet el que no responde. Decirle a un invitado
    // real que su enlace no sirve sería peor que decirle que reintente.
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

  return (
    <>
      <NightSky fromInstant={config.misaAt} toInstant={config.recepcionAt} />
      <MusicButton src={backgroundMusic ?? undefined} />

      <main className="relative">
        <section className="grid min-h-dvh place-items-center px-6">
          <div>
            <p
              aria-hidden="true"
              className="mb-8 text-center font-body text-[0.7rem] font-light tracking-eyebrow text-hueso/60"
            >
              {copy.hero.eyebrow}
            </p>
            <Lockup />
          </div>
        </section>

        <div className="px-5 py-8">
          <Panel className="py-14">
            <Countdown
              target={config.misaAt}
              initialRemaining={config.misaAt - now}
              closingMessage={config.closingMessage}
            />
          </Panel>
        </div>

        <CouplePhoto photo={couplePhoto} />

        <EventSection
          title={copy.misa.title}
          at={config.misaAt}
          place={config.misa}
          body={copy.misa.body(config.misa.place)}
          photo={churchPhoto ?? undefined}
        />

        <EventSection
          title={copy.recepcion.title}
          at={config.recepcionAt}
          place={config.recepcion}
          body={copy.recepcion.body(config.recepcion.place)}
          photo={venuePhoto ?? undefined}
        />

        {/* Sin dress code definido la sección desaparece entera: ni título
            huérfano, ni "por confirmar", ni hueco. */}
        <DressCode value={config.dressCode} />

        {/* Los nombres viajan en el HTML inicial: sin destello de carga y sin
            que el navegador toque Google. */}
        <div className="px-5 pb-28 pt-8">
          <Panel>
            <h2 className="font-display text-[clamp(2rem,10vw,2.75rem)]">{copy.rsvp.title}</h2>
            <Rule className="mt-5" />

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
