import { PublicKey } from '@solana/web3.js';
import idl from '../idl/prediction_market.json';

export const PROGRAM_ID = new PublicKey(idl.address);

export const LAMPORTS_PER_SOL = 1_000_000_000;

export const lamportsToSol = (lamports: number | string | bigint): number =>
  Number(lamports) / LAMPORTS_PER_SOL;

export const formatSol = (lamports: number | string | bigint, decimals = 4): string =>
  `${lamportsToSol(lamports).toFixed(decimals)} SOL`;

export const formatDateTime = (unixSeconds: number | string): string => {
  const d = new Date(Number(unixSeconds) * 1000);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/** Returns a human-readable countdown string like "in 3 days", "in 4 hours", "expired" */
export const timeUntil = (unixSeconds: number | string): string => {
  const diffMs = Number(unixSeconds) * 1000 - Date.now();
  if (diffMs <= 0) return 'Expired';
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) return `in ${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `in ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `in ${diffDays}d`;
};

export const formatCurrency = (lamports: number | string | bigint) => {
  const sol = lamportsToSol(lamports);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
  }).format(sol).replace('$', '◎'); // using ◎ for SOL
};
