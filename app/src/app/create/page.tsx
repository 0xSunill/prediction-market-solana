'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useProgram } from '../../hooks/useProgram';
import { PROGRAM_ID } from '../../utils/constants';
import './page.css';

export default function CreateMarket() {
  const router = useRouter();
  const { program } = useProgram();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [question, setQuestion] = useState('');
  // Default resolution date: 90 days from today
  const defaultDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const [resolutionDate, setResolutionDate] = useState(defaultDate);
  const [marketId, setMarketId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!program || !publicKey) {
      setError('Connect your wallet first.');
      return;
    }
    if (!question.trim()) {
      setError('Question is required.');
      return;
    }
    if (!marketId || isNaN(Number(marketId)) || Number(marketId) <= 0) {
      setError('Enter a valid positive Market ID.');
      return;
    }

    const resolutionTimestamp = Math.floor(new Date(resolutionDate).getTime() / 1000);
    if (resolutionTimestamp <= Math.floor(Date.now() / 1000)) {
      setError('Resolution time must be in the future.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const marketIdBN = new BN(Number(marketId));
      const resolutionTimeBN = new BN(resolutionTimestamp);

      const [marketPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('market'),
          publicKey.toBuffer(),
          marketIdBN.toArrayLike(Buffer, 'le', 8),
        ],
        PROGRAM_ID
      );

      const ix = await program.methods
        .createMarket(marketIdBN, question.trim(), resolutionTimeBN)
        .accounts({
          creator: publicKey,
          market: marketPda,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const { Transaction } = await import('@solana/web3.js');
      const tx = new Transaction().add(ix);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'processed');

      router.push('/');
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Transaction failed. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page animate-fade-in">
      <Link href="/" className="back-link">
        <ArrowLeft size={16} />
        Back
      </Link>

      <h1>Create Market</h1>

      <div className="create-form glass-panel">
        <div className="field-group">
          <label htmlFor="question">Question</label>
          <input
            id="question"
            type="text"
            placeholder="Will BTC be above $100k on Dec 31?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={300}
          />
        </div>

        <div className="field-group">
          <label htmlFor="resolution-time">Resolution Time</label>
          <input
            id="resolution-time"
            type="date"
            value={resolutionDate}
            onChange={(e) => setResolutionDate(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label htmlFor="market-id">Market ID</label>
          <input
            id="market-id"
            type="number"
            placeholder="1"
            value={marketId}
            min="1"
            step="1"
            onChange={(e) => setMarketId(e.target.value)}
          />
          <p className="field-hint">Must be unique per creator wallet.</p>
        </div>

        {error && <p className="create-error">{error}</p>}

        <p className="creator-note">
          The connected wallet becomes the creator.
        </p>

        <button
          id="submit-create-market"
          className="submit-btn"
          onClick={handleCreate}
          disabled={loading || !publicKey || !question.trim()}
        >
          {loading
            ? 'Creating…'
            : !publicKey
            ? 'Connect Wallet First'
            : 'Create Market'}
        </button>
      </div>
    </div>
  );
}
