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
/**
 * La URL pública del sitio.
 *
 * Hace falta ABSOLUTA: la vista previa de WhatsApp exige un `og:image` con
 * dominio completo, y una ruta relativa no le sirve.
 *
 * El orden importa. Antes había un dominio escrito a mano como respaldo, y eso
 * es una bomba de tiempo: si el proyecto en Vercel se llamara distinto, la
 * imagen apuntaría a un dominio inexistente y la vista previa saldría sin foto,
 * sin ningún error visible. `VERCEL_PROJECT_PRODUCTION_URL` la pone Vercel sola
 * con el dominio real de producción, así que acierta sin que haya que
 * configurar nada.
 */
function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'http://localhost:3000';
}

const TITULO = 'Dayona & Javier';
const DESCRIPCION = 'Nos casamos el 7 de noviembre de 2026.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: TITULO,
  description: DESCRIPCION,
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    type: 'website',
    locale: 'es_VE',
    /*
     * La portada es IGUAL para las ~30 invitaciones, sin nombres de invitados.
     *
     * Al pegar un enlace, el rastreador de Meta visita la URL y se queda con la
     * imagen. Si llevara los nombres del grupo, quedarían en un servidor ajeno y
     * los vería cualquiera a quien le reenviaran el enlace.
     */
    images: [
      {
        url: '/fotos/portada.jpg',
        width: 947,
        height: 620,
        alt: 'Dayona y Javier · 7 de noviembre de 2026',
      },
    ],
  },
  // Para los clientes que leen tarjetas de Twitter en vez de Open Graph.
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRIPCION,
    images: ['/fotos/portada.jpg'],
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
