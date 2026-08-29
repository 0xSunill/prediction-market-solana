import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../index.css';
import '../App.css';

import { Navbar } from '../components/Navbar';
import { Providers } from '../components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SivaSatta - Prediction Market',
  description: 'A decentralized prediction market on Solana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
