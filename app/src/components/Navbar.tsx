"use client";
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LayoutDashboard, TrendingUp } from 'lucide-react';
import './Navbar.css';

export function Navbar() {
  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <Link href="/" className="logo">
          <TrendingUp className="logo-icon" />
          <span>SivaSatta</span>
        </Link>
      </div>
      
      <div className="navbar-links">
        <Link href="/" className="nav-link">Markets</Link>
        <Link href="/portfolio" className="nav-link">
          <LayoutDashboard size={18} />
          <span>Portfolio</span>
        </Link>
      </div>

      <div className="navbar-actions">
        <WalletMultiButton />
      </div>
    </nav>
  );
}
