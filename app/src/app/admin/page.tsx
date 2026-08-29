'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useProgram } from '../../hooks/useProgram';
import { useMarkets } from '../../hooks/useMarkets';
import { PROGRAM_ID } from '../../utils/constants';
import './page.css';

export default function AdminPanel() {
  const { program } = useProgram();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { markets, refetch } = useMarkets();
  
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateMarket = async () => {
    if (!program || !publicKey || !question) return;
    try {
      setLoading(true);
      const marketId = new BN(Date.now());
      // Set resolution time to 1 hour from now for testing
      const resolutionTime = new BN(Math.floor(Date.now() / 1000) + 3600);

      const [marketPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('market'),
          publicKey.toBuffer(),
          marketId.toArrayLike(Buffer, 'le', 8),
        ],
        PROGRAM_ID
      );

      const ix = await program.methods
        .createMarket(marketId, question, resolutionTime)
        .accounts({
          creator: publicKey,
          market: marketPda,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const tx = new (await import('@solana/web3.js')).Transaction().add(ix);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'processed');
      
      setQuestion('');
      refetch();
    } catch (e) {
      console.error(e);
      alert('Failed to create market');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveMarket = async (marketPubKey: string, outcome: boolean) => {
    if (!program || !publicKey) return;
    try {
      const pubkey = new PublicKey(marketPubKey);
      const ix = await program.methods
        .resolveMarket(outcome)
        .accounts({
          creator: publicKey,
          market: pubkey,
        })
        .instruction();
        
      const tx = new (await import('@solana/web3.js')).Transaction().add(ix);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'processed');
      refetch();
    } catch (e) {
      console.error(e);
      alert('Failed to resolve market. (You must be the creator and time must be past resolutionTime)');
    }
  };

  return (
    <div className="admin-page animate-fade-in">
      <h1>Admin Panel</h1>
      
      <div className="admin-card glass-panel">
        <h2>Create New Market</h2>
        <div className="input-group">
          <label>Question</label>
          <input 
            type="text" 
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="e.g. Will Solana reach $1000 by 2026?"
          />
        </div>
        <button 
          className="admin-btn"
          onClick={handleCreateMarket}
          disabled={loading || !question}
        >
          {loading ? 'Creating...' : 'Create Market'}
        </button>
      </div>

      <div className="admin-markets">
        <h2>Manage Markets</h2>
        <div className="markets-list">
          {markets.map(m => (
            <div key={m.publicKey} className="admin-market-item glass-panel">
              <p className="q-text">{m.account.question}</p>
              {!m.account.resolved ? (
                <div className="resolve-actions">
                  <button onClick={() => handleResolveMarket(m.publicKey, true)} className="resolve-btn yes">Resolve YES</button>
                  <button onClick={() => handleResolveMarket(m.publicKey, false)} className="resolve-btn no">Resolve NO</button>
                </div>
              ) : (
                <span className="resolved-status">Resolved {m.account.outcome ? 'YES' : 'NO'}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
