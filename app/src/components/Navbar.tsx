"use client";
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { TrendingUp } from 'lucide-react';
import './Navbar.css';

// WalletMultiButton must be client-only — it causes SSR hydration mismatch
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
);

export function Navbar() {
  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <Link href="/" className="logo">
          <TrendingUp className="logo-icon" />
          <span>Siva Satta 🚀</span>
        </Link>
      </div>

      <div className="navbar-actions">
        <Link href="/create" className="create-link">
          + Create Market
        </Link>
        <WalletMultiButton />
      </div>
    </nav>
  );
}
