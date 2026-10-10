import type { MetadataRoute } from 'next';

/** Private Seite: Suchmaschinen bitte draußen bleiben. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', disallow: '/' } };
}
