'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from '../../hooks/useProgram';
import { formatCurrency } from '../../utils/constants';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import './page.css';

export default function Portfolio() {
  const { program } = useProgram();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPositions = async () => {
    if (!program || !publicKey) return;
    try {
      setLoading(true);
      // Fetch all positions for the connected wallet
      // We can use memcmp in production, but for now we filter locally
      const allPositions = await (program as any).account.userPosition.all();
      const myPositions = allPositions.filter((p: any) => p.account.user.equals(publicKey));

      // We also need market details to show the name and status
      const markets = await (program as any).account.market.all();
      
      const enriched = myPositions.map((pos: any) => {
        const market = markets.find((m: any) => m.publicKey.equals(pos.account.market));
        return {
          publicKey: pos.publicKey,
          marketPubKey: pos.account.market,
          market: market?.account,
          yesAmount: Number(pos.account.yesAmount),
          noAmount: Number(pos.account.noAmount),
          claimed: pos.account.claimed
        };
      });

      setPositions(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [program, publicKey]);

  const claimWinnings = async (marketPubKey: PublicKey, positionPubKey: PublicKey) => {
    if (!program || !publicKey) return;
    try {
      const ix = await program.methods
        .claimWinnings()
        .accounts({
          user: publicKey,
          market: marketPubKey,
          userPosition: positionPubKey,
        })
        .instruction();
        
      const tx = new (await import('@solana/web3.js')).Transaction().add(ix);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'processed');
      fetchPositions();
    } catch (e) {
      console.error(e);
      alert('Failed to claim winnings.');
    }
  };

  if (!publicKey) {
    return <div className="loading-state">Connect your wallet to view your portfolio.</div>;
  }

  return (
    <div className="portfolio-page animate-fade-in">
      <Link href="/" className="back-link">
        <ArrowLeft size={16} /> Back to Markets
      </Link>
      
      <h1>Your Portfolio</h1>
      
      {loading ? (
        <div className="loading-state">Loading positions...</div>
      ) : positions.length === 0 ? (
        <div className="empty-state">No positions found. Start trading!</div>
      ) : (
        <div className="positions-list">
          {positions.map((pos) => {
            const isWinner = pos.market?.resolved && 
              ((pos.market.outcome && pos.yesAmount > 0) || (!pos.market.outcome && pos.noAmount > 0));
              
            return (
              <div key={pos.publicKey.toString()} className="position-card glass-panel">
                <div className="position-info">
                  <h3>{pos.market?.question || 'Unknown Market'}</h3>
                  <div className="position-amounts">
                    {pos.yesAmount > 0 && <span className="pos-yes">YES: {formatCurrency(pos.yesAmount)}</span>}
                    {pos.noAmount > 0 && <span className="pos-no">NO: {formatCurrency(pos.noAmount)}</span>}
                  </div>
                </div>
                
                <div className="position-status">
                  {!pos.market?.resolved ? (
                    <span className="status-badge active">Active</span>
                  ) : pos.claimed ? (
                    <span className="status-badge claimed">Claimed</span>
                  ) : isWinner ? (
                    <button 
                      className="claim-btn"
                      onClick={() => claimWinnings(pos.marketPubKey, pos.publicKey)}
                    >
                      Claim Winnings
                    </button>
                  ) : (
                    <span className="status-badge lost">Loss</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
