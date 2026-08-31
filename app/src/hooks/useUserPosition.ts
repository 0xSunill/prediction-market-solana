import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProgram } from './useProgram';
import { PROGRAM_ID } from '../utils/constants';

export interface UserPositionData {
  yesAmount: number; // lamports
  noAmount: number;  // lamports
  claimed: boolean;
}

export function useUserPosition(marketPubkey: string | null) {
  const { program } = useProgram();
  const { publicKey } = useWallet();
  const [position, setPosition] = useState<UserPositionData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPosition = async () => {
    if (!program || !publicKey || !marketPubkey) {
      setPosition(null);
      return;
    }
    try {
      setLoading(true);
      const marketKey = new PublicKey(marketPubkey);
      const [positionPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('position'), marketKey.toBuffer(), publicKey.toBuffer()],
        PROGRAM_ID
      );
      const posAccount = await (program as any).account.userPosition.fetchNullable(positionPda);
      if (posAccount) {
        setPosition({
          yesAmount: Number(posAccount.yesAmount),
          noAmount: Number(posAccount.noAmount),
          claimed: posAccount.claimed,
        });
      } else {
        setPosition(null);
      }
    } catch {
      setPosition(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, publicKey, marketPubkey]);

  return { position, loading, refetch: fetchPosition };
}
