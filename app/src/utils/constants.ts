import { PublicKey } from '@solana/web3.js';
import idl from '../idl/prediction_market.json';

export const PROGRAM_ID = new PublicKey(idl.address);

export const LAMPORTS_PER_SOL = 1_000_000_000;

export const lamportsToSol = (lamports: number | string | bigint): number =>
  Number(lamports) / LAMPORTS_PER_SOL;

export const formatSol = (lamports: number | string | bigint, decimals = 4): string =>
  `${lamportsToSol(lamports).toFixed(decimals)} SOL`;

export const formatCurrency = (lamports: number | string | bigint) => {
  const sol = lamportsToSol(lamports);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
  }).format(sol).replace('$', '◎'); // using ◎ for SOL
};
