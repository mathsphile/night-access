import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/ToastContainer';

// Dynamically load non-critical client overlays to reduce main bundle size
const CommandPalette = dynamic(() => import('@/components/CommandPalette'));
const WalletModalWrapper = dynamic(() => import('@/components/WalletModalWrapper'));

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Night Access | Zero-Knowledge Access Control',
  description: 'Privacy-Preserving Access Control & Visitor Verification on Midnight Network with Compact Zero-Knowledge circuits.',
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
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AppProvider>
          <div className="bg-grid-subtle"></div>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CommandPalette />
          <ToastContainer />
          <WalletModalWrapper />
        </AppProvider>
      </body>
    </html>
  );
}

