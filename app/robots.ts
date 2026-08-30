import type { MetadataRoute } from 'next';

/**
 * Nada de esto se indexa. Sin sitemap: publicar uno filtraría los tokens.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: '/' },
  };
}
