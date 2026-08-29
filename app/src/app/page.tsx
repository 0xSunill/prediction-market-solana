'use client';

import { useMarkets } from '../hooks/useMarkets';
import { MarketCard } from '../components/MarketCard';
import './page.css';

export default function Home() {
  const { markets, loading } = useMarkets();

  return (
    <div className="home-page animate-fade-in">
      <div className="hero-section">
        <h1 className="hero-title">Predict the Future.</h1>
        <p className="hero-subtitle">Trade on the world's most highly-anticipated events.</p>
      </div>

      <div className="markets-container">
        <div className="markets-header">
          <h2>Trending Markets</h2>
        </div>
        
        {loading ? (
          <div className="loading-state">Loading markets...</div>
        ) : markets.length === 0 ? (
          <div className="empty-state">No active markets found.</div>
        ) : (
          <div className="markets-grid">
            {markets.map((market) => (
              <MarketCard key={market.publicKey} market={market} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
