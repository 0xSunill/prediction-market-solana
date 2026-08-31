import Link from 'next/link';
import { formatSol } from '../utils/constants';
import './MarketCard.css';

export interface MarketData {
  publicKey: string;
  account: {
    marketId: string;
    question: string;
    yesPool: string;
    noPool: string;
    resolved: boolean;
    outcome: boolean | null;
    resolutionTime: string;
    creator: string;
  };
}

export function MarketCard({ market }: { market: MarketData }) {
  const { question, yesPool, noPool, resolved, outcome, resolutionTime } = market.account;
  const resolveDate = new Date(Number(resolutionTime) * 1000);
  const resolveDateStr = resolveDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="market-card glass-panel animate-fade-in">
      <div className="market-card-body">
        <p className="market-question">{question}</p>
        <div className="market-pools">
          <span className="pool-yes">YES: {formatSol(yesPool)}</span>
          <span className="pool-sep">·</span>
          <span className="pool-no">NO: {formatSol(noPool)}</span>
        </div>
        <p className="market-resolves">
          {resolved
            ? `Resolved: ${outcome ? 'YES ✅' : 'NO ❌'}`
            : `Resolves: ${resolveDateStr}`}
        </p>
      </div>

      <div className="market-card-actions">
        <Link href={`/market/${market.account.marketId}`} className="bet-btn yes-btn">
          YES
        </Link>
        <Link href={`/market/${market.account.marketId}`} className="bet-btn no-btn">
          NO
        </Link>
      </div>
    </div>
  );
}
