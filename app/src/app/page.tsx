'use client';

import Link from 'next/link';
import { useMarkets } from '../hooks/useMarkets';
import { MarketCard } from '../components/MarketCard';
import './page.css';

export default function Home() {
  const { markets, loading } = useMarkets();

  return (
    <div className="home-page animate-fade-in">
      <div className="markets-section">
        <h2 className="markets-heading">Markets</h2>

        {loading ? (
          <div className="state-box">Loading markets…</div>
        ) : markets.length === 0 ? (
          <div className="state-box">
            <p>No active markets found.</p>
            <Link href="/create" className="empty-create-link">Create the first market →</Link>
          </div>
        ) : (
          <div className="markets-list">
            {markets.map((market) => (
              <MarketCard key={market.publicKey} market={market} />
            ))}
          </div>
        )}
      </div>

      <div className="home-footer">
        <Link href="/create" className="create-market-btn">
          + Create Market
        </Link>
      </div>
    </div>
  );
}
