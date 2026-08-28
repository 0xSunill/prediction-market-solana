import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LayoutDashboard, TrendingUp } from 'lucide-react';
import './Navbar.css';

export function Navbar() {
  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <Link to="/" className="logo">
          <TrendingUp className="logo-icon" />
          <span>PolyX</span>
        </Link>
      </div>
      
      <div className="navbar-links">
        <Link to="/" className="nav-link">Markets</Link>
        <Link to="/portfolio" className="nav-link">
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
