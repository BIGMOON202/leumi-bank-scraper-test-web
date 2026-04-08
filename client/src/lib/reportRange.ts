import type { AccountRow } from '../types';
import { summarizeAccounts } from './format';

export type RangeKey = '6m' | '3m' | '1m' | '7d';

export function startDateForRange(key: RangeKey): Date {
  const d = new Date();
  if (key === '7d') {
    d.setDate(d.getDate() - 7);
  } else if (key === '1m') {
    d.setMonth(d.getMonth() - 1);
  } else if (key === '3m') {
    d.setMonth(d.getMonth() - 3);
  } else {
    d.setMonth(d.getMonth() - 6);
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

export function filterAccountsByRange(accounts: AccountRow[], key: RangeKey): AccountRow[] {
  const start = startDateForRange(key);
  return accounts.map((acc) => ({
    ...acc,
    txns: acc.txns.filter((t) => {
      const dt = new Date(`${t.date.slice(0, 10)}T12:00:00`);
      return dt >= start;
    }),
  }));
}

function parseTxnDate(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T12:00:00`);
}

/** Transactions with date in [start, end) */
export function filterAccountsBetween(accounts: AccountRow[], start: Date, end: Date): AccountRow[] {
  return accounts.map((acc) => ({
    ...acc,
    txns: acc.txns.filter((t) => {
      const dt = parseTxnDate(t.date);
      return dt >= start && dt < end;
    }),
  }));
}

/** Latest transaction date in set, or null */
export function latestTxnDate(accounts: AccountRow[]): Date | null {
  let max: Date | null = null;
  for (const acc of accounts) {
    for (const t of acc.txns) {
      const d = parseTxnDate(t.date);
      if (!max || d > max) {
        max = d;
      }
    }
  }
  return max;
}

/**
 * Current range (from range key through latest data or today) vs same-length prior window; % change for income and spending.
 */
export function comparisonWindows(accounts: AccountRow[], key: RangeKey): {
  current: AccountRow[];
  previous: AccountRow[];
  pctIncome: number | null;
  pctExpense: number | null;
} {
  const rangeStart = startDateForRange(key);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const last = latestTxnDate(accounts);
  const effectiveEnd =
    last && last.getTime() < todayEnd.getTime()
      ? (() => {
          const x = new Date(last);
          x.setHours(23, 59, 59, 999);
          return x;
        })()
      : todayEnd;

  const endExclusive = new Date(effectiveEnd);
  endExclusive.setDate(endExclusive.getDate() + 1);
  endExclusive.setHours(0, 0, 0, 0);

  const durationMs = Math.max(endExclusive.getTime() - rangeStart.getTime(), 86_400_000);
  const prevEnd = new Date(rangeStart);
  const prevStart = new Date(prevEnd.getTime() - durationMs);

  const current = filterAccountsBetween(accounts, rangeStart, endExclusive);
  const previous = filterAccountsBetween(accounts, prevStart, prevEnd);

  const sCur = summarizeAccounts(current);
  const sPrev = summarizeAccounts(previous);
  const pctIncome =
    sPrev.income > 0 ? Math.round(((sCur.income - sPrev.income) / sPrev.income) * 100) : null;
  const expCur = Math.abs(sCur.expense);
  const expPrev = Math.abs(sPrev.expense);
  const pctExpense = expPrev > 0 ? Math.round(((expCur - expPrev) / expPrev) * 100) : null;

  return { current, previous, pctIncome, pctExpense };
}
