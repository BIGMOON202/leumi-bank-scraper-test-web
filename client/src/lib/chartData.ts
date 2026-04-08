import type { AccountRow } from '../types';

/** Daily sum of chargedAmount (net movement per calendar day). */
export function dailyNetFlow(accounts: AccountRow[]): { date: string; net: number }[] {
  const map = new Map<string, number>();
  for (const acc of accounts) {
    for (const t of acc.txns) {
      const d = t.date.slice(0, 10);
      map.set(d, (map.get(d) ?? 0) + t.chargedAmount);
    }
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, net]) => ({ date, net }));
}

export function transactionDateRange(accounts: AccountRow[]): { start: string; end: string } | null {
  let min = '';
  let max = '';
  for (const acc of accounts) {
    for (const t of acc.txns) {
      const d = t.date.slice(0, 10);
      if (!min || d < min) {
        min = d;
      }
      if (!max || d > max) {
        max = d;
      }
    }
  }
  if (!min) {
    return null;
  }
  return { start: min, end: max };
}

/** Running sum of daily net — typical “finance report” cumulative line. */
export function dailyCumulativeNet(accounts: AccountRow[]): { date: string; shortLabel: string; cum: number }[] {
  const daily = dailyNetFlow(accounts);
  let cum = 0;
  return daily.map((d) => {
    cum += d.net;
    return {
      date: d.date,
      shortLabel: d.date.slice(5).replace('-', '/'),
      cum,
    };
  });
}
