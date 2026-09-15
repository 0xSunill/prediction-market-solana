import { useMemo } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';

import idl from '../idl/prediction_market.json';


export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const provider = useMemo(() => {
    const activeWallet = wallet || {
      publicKey: Keypair.generate().publicKey,
      signTransaction: async () => { throw new Error('Not connected'); },
      signAllTransactions: async () => { throw new Error('Not connected'); },
    };
    return new AnchorProvider(connection, activeWallet as any, {
      preflightCommitment: 'processed',
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    return new Program(idl as any, provider);
  }, [provider]);

  return { program, provider, connection };
}
