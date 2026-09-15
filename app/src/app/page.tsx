'use client';

import Link from 'next/link';
import { useMarkets } from '../hooks/useMarkets';
import { MarketCard } from '../components/MarketCard';
import './page.css';

export default function Home() {
  const { markets, loading } = useMarkets();

  const liveMarkets = markets.filter((m) => !m.account.resolved);
  const resolvedMarkets = markets.filter((m) => m.account.resolved);

  return (
    <div className="home-page animate-fade-in">
      <div className="markets-section">
        <h2 className="markets-heading">Live Markets</h2>

        {loading ? (
          <div className="state-box">Loading markets…</div>
        ) : liveMarkets.length === 0 ? (
          <div className="state-box">
            <p>No active markets found.</p>
            <Link href="/create" className="empty-create-link">Create the first market →</Link>
          </div>
        ) : (
          <div className="markets-list">
            {liveMarkets.map((market) => (
              <MarketCard key={market.publicKey} market={market} />
            ))}
          </div>
        )}
      </div>

      {resolvedMarkets.length > 0 && (
        <div className="markets-section">
          <h2 className="markets-heading">Resolved Markets</h2>
          <div className="markets-list">
            {resolvedMarkets.map((market) => (
              <MarketCard key={market.publicKey} market={market} />
            ))}
          </div>
        </div>
      )}

      <div className="home-footer">
        <Link href="/create" className="create-market-btn">
          + Create Market
        </Link>
      </div>
    </div>
  );
}
