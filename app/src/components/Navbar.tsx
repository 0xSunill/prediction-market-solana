"use client";
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TrendingUp } from 'lucide-react';
import './Navbar.css';

export function Navbar() {
  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <Link href="/" className="logo">
          <TrendingUp className="logo-icon" />
          <span>Prediction Market</span>
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
