'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { ArrowLeft } from 'lucide-react';
import { useProgram } from '../../../hooks/useProgram';
import { useUserPosition } from '../../../hooks/useUserPosition';
import type { MarketData } from '../../../components/MarketCard';
import { PROGRAM_ID, formatSol, lamportsToSol, LAMPORTS_PER_SOL } from '../../../utils/constants';
import './page.css';

export default function MarketDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { program } = useProgram();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [market, setMarket] = useState<MarketData | null>(null);
  const [amount, setAmount] = useState('');
  const [betLoading, setBetLoading] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [txError, setTxError] = useState('');

  const { position, refetch: refetchPosition } = useUserPosition(market?.publicKey ?? null);

  // ── Fetch market ──────────────────────────────────────────────────────────
  const fetchMarket = async () => {
    if (!program || !id) return;
    try {
      const accounts = await (program as any).account.market.all();
      const match = accounts.find((a: any) => a.account.marketId.toString() === id);
      if (match) {
        setMarket({
          publicKey: match.publicKey.toString(),
          account: {
            marketId: match.account.marketId.toString(),
            question: match.account.question,
            yesPool: match.account.yesPool.toString(),
            noPool: match.account.noPool.toString(),
            resolved: match.account.resolved,
            outcome: match.account.outcome,
            resolutionTime: match.account.resolutionTime.toString(),
            creator: match.account.creator.toString(),
          },
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMarket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, id]);

  const refresh = () => {
    fetchMarket();
    refetchPosition();
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const amountLamports = () => Math.round(Number(amount) * LAMPORTS_PER_SOL);

  // ── Place bet ─────────────────────────────────────────────────────────────
  const placeBet = async (isYes: boolean) => {
    if (!program || !publicKey || !market || !amount || isNaN(Number(amount))) return;
    setTxError('');
    try {
      setBetLoading(true);
      const marketPubkey = new PublicKey(market.publicKey);
      const [userPositionPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('position'), marketPubkey.toBuffer(), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const ix = await program.methods
        .placeBet(new BN(amountLamports()), isYes)
        .accounts({
          user: publicKey,
          market: marketPubkey,
          userPosition: userPositionPda,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const { Transaction } = await import('@solana/web3.js');
      const sig = await sendTransaction(new Transaction().add(ix), connection);
      await connection.confirmTransaction(sig, 'processed');
      setAmount('');
      refresh();
    } catch (e: any) {
      console.error(e);
      setTxError(e?.message ?? 'Transaction failed.');
    } finally {
      setBetLoading(false);
    }
  };

  // ── Resolve market ────────────────────────────────────────────────────────
  const resolveMarket = async (outcome: boolean) => {
    if (!program || !publicKey || !market) return;
    setTxError('');
    try {
      setResolveLoading(true);
      const ix = await program.methods
        .resolveMarket(outcome)
        .accounts({
          creator: publicKey,
          market: new PublicKey(market.publicKey),
        })
        .instruction();

      const { Transaction } = await import('@solana/web3.js');
      const sig = await sendTransaction(new Transaction().add(ix), connection);
      await connection.confirmTransaction(sig, 'processed');
      refresh();
    } catch (e: any) {
      console.error(e);
      setTxError(e?.message ?? 'Resolve failed. Check console.');
    } finally {
      setResolveLoading(false);
    }
  };

  // ── Claim winnings ────────────────────────────────────────────────────────
  const claimWinnings = async () => {
    if (!program || !publicKey || !market) return;
    setTxError('');
    try {
      setClaimLoading(true);
      const marketPubkey = new PublicKey(market.publicKey);
      const [userPositionPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('position'), marketPubkey.toBuffer(), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const ix = await program.methods
        .claimWinnings()
        .accounts({
          user: publicKey,
          market: marketPubkey,
          userPosition: userPositionPda,
        })
        .instruction();

      const { Transaction } = await import('@solana/web3.js');
      const sig = await sendTransaction(new Transaction().add(ix), connection);
      await connection.confirmTransaction(sig, 'processed');
      refresh();
    } catch (e: any) {
      console.error(e);
      setTxError(e?.message ?? 'Claim failed. Check console.');
    } finally {
      setClaimLoading(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  if (!market) {
    return (
      <div className="market-detail-page animate-fade-in">
        <div className="state-msg">Loading market…</div>
      </div>
    );
  }

  const { question, yesPool, noPool, resolved, outcome, resolutionTime, creator } = market.account;
  const yes = Number(yesPool);
  const no = Number(noPool);
  const resolutionDate = new Date(Number(resolutionTime) * 1000).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isCreator = publicKey && creator === publicKey.toString();
  const pastResolution = Date.now() / 1000 > Number(resolutionTime);

  // Estimated payout calculation (mirrors on-chain logic)
  const calcPayout = (winningBet: number, totalWinningPool: number, totalLosingPool: number): number => {
    if (totalWinningPool === 0) return 0;
    const winnings = Math.floor((winningBet * totalLosingPool) / totalWinningPool);
    return winningBet + winnings;
  };

  const userYes = position?.yesAmount ?? 0;
  const userNo = position?.noAmount ?? 0;

  let estimatedPayout = 0;
  if (resolved && outcome !== null) {
    if (outcome && userYes > 0) estimatedPayout = calcPayout(userYes, yes, no);
    if (!outcome && userNo > 0) estimatedPayout = calcPayout(userNo, no, yes);
  }

  const hasWinningPosition =
    resolved && outcome !== null &&
    ((outcome && userYes > 0) || (!outcome && userNo > 0));

  const canClaim = hasWinningPosition && position && !position.claimed;

  return (
    <div className="market-detail-page animate-fade-in">
      <Link href="/" className="back-link">
        <ArrowLeft size={16} />
        Back
      </Link>

      <div className="detail-card glass-panel">
        {/* ── Question ──────────────────────────────────────── */}
        <h1 className="detail-question">{question}</h1>

        {/* ── Pool stats ────────────────────────────────────── */}
        <div className="pool-stats">
          <div className="pool-stat yes-stat">
            <span className="stat-label">YES Pool</span>
            <span className="stat-value yes-value">{formatSol(yes)}</span>
          </div>
          <div className="pool-stat no-stat">
            <span className="stat-label">NO Pool</span>
            <span className="stat-value no-value">{formatSol(no)}</span>
          </div>
          <div className="pool-stat">
            <span className="stat-label">Resolution</span>
            <span className="stat-value">{resolutionDate}</span>
          </div>
        </div>

        <div className="divider" />

        {/* ── Resolved state ────────────────────────────────── */}
        {resolved ? (
          <div className="resolved-section">
            <div className="resolved-badge">
              Market Resolved &nbsp; {outcome ? '✅ YES' : '❌ NO'}
            </div>

            {publicKey && (userYes > 0 || userNo > 0) && (
              <div className="your-position">
                <h3>Your Position</h3>
                {userYes > 0 && <p>YES: <strong>{formatSol(userYes)}</strong></p>}
                {userNo > 0 && <p>NO: <strong>{formatSol(userNo)}</strong></p>}

                {hasWinningPosition && (
                  <p className="payout-estimate">
                    Estimated payout: <strong className="yes-value">{lamportsToSol(estimatedPayout).toFixed(4)} SOL</strong>
                  </p>
                )}

                {canClaim && (
                  <button
                    id="claim-winnings-btn"
                    className="action-btn yes-action"
                    onClick={claimWinnings}
                    disabled={claimLoading}
                  >
                    {claimLoading ? 'Claiming…' : 'Claim Winnings'}
                  </button>
                )}

                {position?.claimed && (
                  <p className="claimed-msg">✅ Winnings claimed</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ── User position (active market) ─────────────── */}
            {publicKey && (userYes > 0 || userNo > 0) && (
              <div className="your-position">
                <h3>Your Position</h3>
                <div className="position-row">
                  <span>YES: <strong className="yes-value">{formatSol(userYes)}</strong></span>
                  <span>NO: <strong className="no-value">{formatSol(userNo)}</strong></span>
                </div>
              </div>
            )}

            {/* ── Bet form ──────────────────────────────────── */}
            <div className="bet-section">
              <h3>Place a Bet</h3>
              <div className="amount-row">
                <label htmlFor="bet-amount">Amount</label>
                <div className="amount-input-wrap">
                  <input
                    id="bet-amount"
                    type="number"
                    placeholder="0.5"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.1"
                  />
                  <span className="sol-suffix">SOL</span>
                </div>
              </div>

              <div className="bet-buttons">
                <button
                  id="bet-yes-btn"
                  className="action-btn yes-action"
                  onClick={() => placeBet(true)}
                  disabled={betLoading || !publicKey || !amount || pastResolution}
                >
                  {betLoading ? '…' : !publicKey ? 'Connect Wallet' : 'Bet YES'}
                </button>
                <button
                  id="bet-no-btn"
                  className="action-btn no-action"
                  onClick={() => placeBet(false)}
                  disabled={betLoading || !publicKey || !amount || pastResolution}
                >
                  {betLoading ? '…' : 'Bet NO'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Creator resolve (only shown to creator after resolution time) ── */}
        {isCreator && pastResolution && !resolved && (
          <>
            <div className="divider" />
            <div className="resolve-section">
              <h3>Resolve Market</h3>
              <p className="resolve-hint">You are the creator. Choose the outcome:</p>
              <div className="bet-buttons">
                <button
                  id="resolve-yes-btn"
                  className="action-btn yes-action"
                  onClick={() => resolveMarket(true)}
                  disabled={resolveLoading}
                >
                  {resolveLoading ? '…' : 'Resolve YES'}
                </button>
                <button
                  id="resolve-no-btn"
                  className="action-btn no-action"
                  onClick={() => resolveMarket(false)}
                  disabled={resolveLoading}
                >
                  {resolveLoading ? '…' : 'Resolve NO'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Error display ─────────────────────────────────── */}
        {txError && <p className="tx-error">{txError}</p>}
      </div>
    </div>
  );
}
