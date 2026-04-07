import type { AccountRow } from '../types';

export function accountsToCsv(accounts: AccountRow[]): string {
  const headers = [
    'account_number',
    'date',
    'description',
    'charged_amount',
    'currency',
    'status',
    'type',
    'memo',
  ];
  const rows: string[][] = [headers];
  for (const acc of accounts) {
    for (const t of acc.txns) {
      rows.push([
        acc.accountNumber,
        t.date.slice(0, 10),
        `"${(t.description + (t.memo ? ` ${t.memo}` : '')).replace(/"/g, '""')}"`,
        String(t.chargedAmount),
        t.originalCurrency,
        t.status,
        t.type,
        t.memo ?? '',
      ]);
    }
  }
  return rows.map((r) => r.join(',')).join('\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
