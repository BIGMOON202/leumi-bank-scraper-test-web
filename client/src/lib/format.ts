import type { AccountRow } from '../types';

export function defaultStartDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return d.toISOString().slice(0, 10);
}

export function formatMoney(n: number, currency: string): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: currency === 'ILS' ? 'ILS' : currency,
    minimumFractionDigits: 2,
  }).format(n);
}

export function summarizeAccounts(accounts: AccountRow[]) {
  let totalTxns = 0;
  let sumCharges = 0;
  let income = 0;
  let expense = 0;
  for (const a of accounts) {
    totalTxns += a.txns.length;
    for (const t of a.txns) {
      sumCharges += t.chargedAmount;
      if (t.chargedAmount >= 0) {
        income += t.chargedAmount;
      } else {
        expense += t.chargedAmount;
      }
    }
  }
  return { totalTxns, sumCharges, accountCount: accounts.length, income, expense };
}

export function todayLabel(): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());
}

export function formatSyncTime(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}
