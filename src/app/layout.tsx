import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SANKET',
  description: 'Smart city hazard reporting and navigation platform.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SANKET',
  },
  keywords: ['civic', 'hazard', 'pothole', 'road safety', 'smart city', 'Raipur'],
  authors: [{ name: 'SANKET' }],
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
  openGraph: {
    title: 'Team LEAF — Report Hazards. Navigate Safe.',
    description: 'Report potholes, broken bridges, hanging wires and more. Help your city become safer.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#192625',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full font-sans antialiased">
        <div className="mobile-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
