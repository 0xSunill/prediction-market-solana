import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useProgram } from '../hooks/useProgram';
import type { MarketData } from './MarketCard';
import { PROGRAM_ID } from '../utils/constants';
import './BettingPanel.css';

export function BettingPanel({ market, onBetPlaced }: { market: MarketData, onBetPlaced: () => void }) {
  const { program } = useProgram();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [betSide, setBetSide] = useState<'YES' | 'NO'>('YES');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBet = async () => {
    if (!program || !publicKey || !amount || isNaN(Number(amount))) return;
    
    try {
      setLoading(true);
      
      const marketPubkey = new PublicKey(market.publicKey);
      const [userPositionPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('position'), marketPubkey.toBuffer(), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const amountLamports = new BN(Number(amount) * 1_000_000_000);
      const isYes = betSide === 'YES';

      const ix = await program.methods
        .placeBet(amountLamports, isYes)
        .accounts({
          user: publicKey,
          market: marketPubkey,
          userPosition: userPositionPda,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const tx = new (await import('@solana/web3.js')).Transaction().add(ix);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'processed');
      
      setAmount('');
      onBetPlaced();
    } catch (e) {
      console.error('Failed to place bet', e);
      alert('Transaction failed. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  const { resolved, outcome } = market.account;

  if (resolved) {
    return (
      <div className="betting-panel glass-panel resolved-panel">
        <h3>Market Resolved</h3>
        <p className="outcome-text">Outcome: <strong>{outcome ? 'YES' : 'NO'}</strong></p>
        <p className="subtext">Check your Portfolio to claim winnings.</p>
      </div>
    );
  }

  return (
    <div className="betting-panel glass-panel">
      <div className="side-selector">
        <button 
          className={`side-btn yes-side ${betSide === 'YES' ? 'active' : ''}`}
          onClick={() => setBetSide('YES')}
        >
          Buy Yes
        </button>
        <button 
          className={`side-btn no-side ${betSide === 'NO' ? 'active' : ''}`}
          onClick={() => setBetSide('NO')}
        >
          Buy No
        </button>
      </div>

      <div className="input-group">
        <label>Amount (SOL)</label>
        <div className="input-wrapper">
          <input 
            type="number" 
            placeholder="0.00" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          <span className="currency-suffix">◎</span>
        </div>
      </div>

      <button 
        className={`submit-bet-btn ${betSide.toLowerCase()}-active`}
        onClick={handleBet}
        disabled={loading || !publicKey || !amount}
      >
        {loading ? 'Confirming...' : !publicKey ? 'Connect Wallet' : `Place ${betSide} Bet`}
      </button>
    </div>
  );
}
