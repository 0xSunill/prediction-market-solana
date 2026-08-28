import { PublicKey } from '@solana/web3.js';
import idl from '../idl/prediction_market.json';

export const PROGRAM_ID = new PublicKey(idl.address);

export const formatCurrency = (lamports: number | string | bigint) => {
  const sol = Number(lamports) / 1_000_000_000;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
  }).format(sol).replace('$', '◎'); // using ◎ for SOL
};
