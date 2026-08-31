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
import { sendTx, extractErrorMessage } from '../../utils/sendTx';
import './page.css';

export default function CreateMarket() {
  const router = useRouter();
  const { program } = useProgram();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [question, setQuestion] = useState('');
  // Default resolution date: 90 days from today
  // Default: 90 days from now, rounded to nearest hour
  const defaultDateTime = (() => {
    const d = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    // datetime-local value format: "YYYY-MM-DDTHH:mm"
    return d.toISOString().slice(0, 16);
  })();
  const [resolutionDate, setResolutionDate] = useState(defaultDateTime);
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

    // Parse datetime-local value as local time
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
      await sendTx(new Transaction().add(ix), connection, publicKey, sendTransaction);

      router.push('/');
    } catch (e: any) {
      console.error(String(e));
      setError(extractErrorMessage(e));
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
            type="datetime-local"
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
