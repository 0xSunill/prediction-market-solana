import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProgram } from '../hooks/useProgram';
import { BettingPanel } from '../components/BettingPanel';
import type { MarketData } from '../components/MarketCard';
import { ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/constants';
import './MarketDetails.css';

// Mock chart data generation
const generateMockChartData = (currentYesProb: number) => {
  const data = [];
  let prob = 50;
  for (let i = 0; i < 30; i++) {
    prob += (Math.random() - 0.5) * 10;
    prob = Math.max(5, Math.min(95, prob));
    data.push({ time: i, prob });
  }
  data.push({ time: 30, prob: currentYesProb });
  return data;
};

export function MarketDetails() {
  const { id } = useParams<{ id: string }>();
  const { program } = useProgram();
  const [market, setMarket] = useState<MarketData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchMarket = async () => {
    if (!program || !id) return;
    try {
      const accounts = await (program as any).account.market.all();
      const match = accounts.find((a: any) => a.account.marketId.toString() === id);
      if (match) {
        const m = {
          publicKey: match.publicKey.toString(),
          account: {
            marketId: match.account.marketId.toString(),
            question: match.account.question,
            yesPool: match.account.yesPool.toString(),
            noPool: match.account.noPool.toString(),
            resolved: match.account.resolved,
            outcome: match.account.outcome,
            resolutionTime: match.account.resolutionTime.toString(),
          }
        };
        setMarket(m);
        
        const yes = Number(m.account.yesPool);
        const no = Number(m.account.noPool);
        const total = yes + no;
        const yesProb = total > 0 ? Math.round((yes / total) * 100) : 50;
        setChartData(generateMockChartData(yesProb));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMarket();
  }, [program, id]);

  if (!market) {
    return <div className="loading-state">Loading market details...</div>;
  }

  const { question, yesPool, noPool } = market.account;
  const yes = Number(yesPool);
  const no = Number(noPool);
  const total = yes + no;
  const yesProb = total > 0 ? Math.round((yes / total) * 100) : 50;

  return (
    <div className="market-details-page animate-fade-in">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Markets
      </Link>
      
      <div className="market-layout">
        <div className="market-main">
          <div className="market-header-full">
            <h1>{question}</h1>
            <div className="market-meta">
              <span className="meta-item">Vol: {formatCurrency(total)}</span>
              <span className="meta-item">Ends: {new Date(Number(market.account.resolutionTime) * 1000).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="chart-container glass-panel">
            <div className="chart-header">
              <h3>Probability over time</h3>
              <div className="current-prob">{yesProb}% YES</div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--yes-color)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--yes-color)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--yes-color)' }}
                    formatter={(val: any) => [`${Math.round(val)}%`, 'Probability']}
                  />
                  <Area type="monotone" dataKey="prob" stroke="var(--yes-color)" fillOpacity={1} fill="url(#colorProb)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="market-sidebar">
          <BettingPanel market={market} onBetPlaced={fetchMarket} />
        </div>
      </div>
    </div>
  );
}
