/** @type {import('next').NextConfig} */
// Sin `output: 'standalone'`: en Vercel con framework "nextjs" estorba.
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // La invitación no se indexa nunca. El meta `robots` del layout dice
          // lo mismo, pero el encabezado también cubre respuestas no HTML.
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
