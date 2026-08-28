import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/constants';
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
  };
}

export function MarketCard({ market }: { market: MarketData }) {
  const { question, yesPool, noPool, resolved, outcome } = market.account;
  const yes = Number(yesPool);
  const no = Number(noPool);
  const total = yes + no;
  
  const yesProb = total > 0 ? Math.round((yes / total) * 100) : 50;
  const noProb = total > 0 ? Math.round((no / total) * 100) : 50;

  return (
    <Link to={`/market/${market.account.marketId}`} className="market-card glass-panel animate-fade-in">
      <div className="market-header">
        <h3 className="market-question">{question}</h3>
      </div>
      
      <div className="market-stats">
        <div className="stat-item">
          <span className="stat-label">Vol</span>
          <span className="stat-value">{formatCurrency(total)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Status</span>
          <span className={`stat-value ${resolved ? 'resolved' : 'active'}`}>
            {resolved ? (outcome ? 'Resolved YES' : 'Resolved NO') : 'Active'}
          </span>
        </div>
      </div>

      <div className="market-probabilities">
        <div className="prob-bar yes-bar" style={{ width: `${yesProb}%` }}></div>
        <div className="prob-bar no-bar" style={{ width: `${noProb}%` }}></div>
      </div>

      <div className="market-actions">
        <button className="bet-btn yes-btn">
          <span>Yes</span>
          <span className="prob-text">{yesProb}%</span>
        </button>
        <button className="bet-btn no-btn">
          <span>No</span>
          <span className="prob-text">{noProb}%</span>
        </button>
      </div>
    </Link>
  );
}
