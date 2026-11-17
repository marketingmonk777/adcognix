import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Toaster } from '@/components/Toast';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const metadata: Metadata = {
  metadataBase: new URL('https://marketingmonk777.github.io'),
  title: 'AdCognix · Ads that think ahead',
  description: 'Plan, create and run Facebook, Instagram and Google ads for your business from one place, with lead tracking built in.',
  icons: { icon: base + '/favicon.svg', apple: base + '/apple-touch-icon.png' },
  manifest: base + '/manifest.webmanifest',
  openGraph: { title: 'AdCognix', description: 'Ads that think ahead.', images: [base + '/og.png'] },
};
export const viewport: Viewport = { themeColor: '#0B1B3F', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}<Toaster /></body></html>);
}
