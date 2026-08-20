import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CommandPalette } from '@/components/CommandPalette';
import { ToastContainer } from '@/components/ToastContainer';

export const metadata: Metadata = {
  title: 'Visitor Verification Platform | Zero-Knowledge Access Control & Midnight ZK-SNARKs',
  description: 'Privacy-Preserving Visitor Verification Platform on Midnight Network with Compact Zero-Knowledge circuits.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>
          <div className="bg-grid-pattern"></div>
          <Navbar />
          <main className="animated-entry">{children}</main>
          <Footer />
          <CommandPalette />
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
