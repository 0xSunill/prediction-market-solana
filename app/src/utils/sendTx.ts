import type { Connection, Transaction } from '@solana/web3.js';
import type { WalletContextState } from '@solana/wallet-adapter-react';

/**
 * Fetches the latest blockhash, sets fee payer, then sends + confirms a transaction.
 * Extracts the real error message from WalletSendTransactionError / SendTransactionError.
 */
export async function sendTx(
  tx: Transaction,
  connection: Connection,
  publicKey: WalletContextState['publicKey'],
  sendTransaction: WalletContextState['sendTransaction']
): Promise<string> {
  if (!publicKey) throw new Error('Wallet not connected');

  // Fetch latest blockhash (prevents "Unexpected error" from stale/missing blockhash)
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;
  tx.feePayer = publicKey;

  const signature = await sendTransaction(tx, connection, {
    skipPreflight: false,
    preflightCommitment: 'processed',
  });

  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    'processed'
  );

  return signature;
}

/** Extracts a human-readable message from any wallet/RPC error */
export function extractErrorMessage(err: unknown): string {
  if (!err) return 'Unknown error';
  // WalletSendTransactionError wraps the real cause
  const e = err as any;
  const cause = e?.cause ?? e?.error ?? e;
  // Solana logs the real reason in cause.message or cause.logs
  const msg: string = cause?.message ?? e?.message ?? String(err);
  // Strip internal stack noise, keep just the first line
  return msg.split('\n')[0] ?? msg;
}
