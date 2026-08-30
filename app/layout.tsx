import type { Metadata, Viewport } from 'next';
import { fontVariables } from './fonts';
import { DuotoneFilter } from './components/DuotoneFilter';
import './globals.css';

/**
 * Metadatos genéricos e IDÉNTICOS para toda invitación.
 *
 * Al pegar un enlace en WhatsApp, el rastreador de Meta visita la URL para
 * armar la tarjeta de vista previa. Si esa tarjeta llevara los nombres de los
 * invitados, quedarían en un servidor ajeno y los vería cualquiera a quien le
 * reenviaran el enlace. Genérico es más simple y más privado.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wedding-dayo-javi.vercel.app'),
  title: 'Dayona & Javier',
  description: 'Nos casamos el 7 de noviembre de 2026.',
  openGraph: {
    title: 'Dayona & Javier',
    description: 'Nos casamos el 7 de noviembre de 2026.',
    type: 'website',
    locale: 'es_VE',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0d1226',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fontVariables}>
      <body>
        <DuotoneFilter />
        {children}
      </body>
    </html>
  );
}
