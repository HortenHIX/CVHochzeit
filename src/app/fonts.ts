import { Cormorant_Garamond, Figtree, Pinyon_Script } from 'next/font/google';

/**
 * Schriften werden beim Build heruntergeladen und selbst gehostet –
 * keine Verbindung zu Google beim Seitenaufruf.
 */
export const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

export const script = Pinyon_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
});

export const sans = Figtree({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
