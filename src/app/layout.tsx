import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { site } from '@/content/site';
import { metadataBaseUrl } from '@/lib/site-url';
import { display, sans, script } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  // Damit og:image (Link-Vorschau in WhatsApp & Co.) eine absolute Adresse bekommt.
  metadataBase: metadataBaseUrl(),
  title: site.meta.title,
  description: site.meta.description,
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  openGraph: {
    title: site.meta.title,
    description: site.meta.description,
    locale: 'de_DE',
    type: 'website',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#FAF7F2',
  colorScheme: 'light',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={`${display.variable} ${script.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
