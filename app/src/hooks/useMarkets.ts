import { useEffect, useState } from 'react';
import { useProgram } from './useProgram';
import type { MarketData } from '../components/MarketCard';

export function useMarkets() {
  const { program } = useProgram();
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarkets = async () => {
    if (!program) return;
    try {
      setLoading(true);
      const accounts = await (program as any).account.market.all();
      
      const formatted = accounts.map((acc: any) => ({
        publicKey: acc.publicKey.toString(),
        account: {
          marketId: acc.account.marketId.toString(),
          question: acc.account.question,
          yesPool: acc.account.yesPool.toString(),
          noPool: acc.account.noPool.toString(),
          resolved: acc.account.resolved,
          outcome: acc.account.outcome,
          resolutionTime: acc.account.resolutionTime.toString(),
          creator: acc.account.creator.toString(),
        }
      }));

      // Sort by newest first usually, or ID descending
      formatted.sort((a: any, b: any) => Number(b.account.marketId) - Number(a.account.marketId));
      setMarkets(formatted);
    } catch (e) {
      console.error("Failed to fetch markets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, [program]);

  return { markets, loading, refetch: fetchMarkets };
}
