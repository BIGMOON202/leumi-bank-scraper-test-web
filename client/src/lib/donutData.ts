import type { AccountRow } from '../types';

const LABELS = ['Need Life', 'Lifestyle', 'Investment', 'Saving'] as const;
const COLORS = ['#635BFF', '#EC4899', '#A78BFA', '#3B82F6'] as const;

/** Split debit amounts into four buckets (by amount quartiles) for the donut chart. */
export function pocketDonutData(accounts: AccountRow[]): { name: string; value: number; color: string }[] {
  const debits: number[] = [];
  for (const acc of accounts) {
    for (const t of acc.txns) {
      if (t.chargedAmount < 0) {
        debits.push(Math.abs(t.chargedAmount));
      }
    }
  }
  if (debits.length === 0) {
    return LABELS.map((name, i) => ({ name, value: 1, color: COLORS[i] }));
  }
  debits.sort((a, b) => a - b);
  const n = debits.length;
  const slice = (q: number) => {
    const start = Math.floor((q * n) / 4);
    const end = Math.floor(((q + 1) * n) / 4);
    return debits.slice(start, end).reduce((s, x) => s + x, 0);
  };
  const sums = [0, 1, 2, 3].map((q) => slice(q));
  const total = sums.reduce((a, b) => a + b, 0) || 1;
  if (total === 0) {
    return LABELS.map((name, i) => ({ name, value: 1, color: COLORS[i] }));
  }
  return LABELS.map((name, i) => ({
    name,
    value: sums[i],
    color: COLORS[i],
  }));
}

export function donutTotal(data: { value: number }[]): number {
  return data.reduce((s, d) => s + d.value, 0) || 1;
}
