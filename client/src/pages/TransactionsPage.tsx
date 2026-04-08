import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AccountRow, TxnRow } from '../types';
import { useScrape } from '../context/ScrapeContext';
import { formatMoney } from '../lib/format';
import { comparisonWindows, type RangeKey } from '../lib/reportRange';

type FlatTxn = { accountNumber: string; txn: TxnRow };

function flattenTxns(accounts: AccountRow[]): FlatTxn[] {
  const out: FlatTxn[] = [];
  for (const acc of accounts) {
    for (const txn of acc.txns) {
      out.push({ accountNumber: acc.accountNumber, txn });
    }
  }
  return out.sort((a, b) => b.txn.date.localeCompare(a.txn.date));
}

export function TransactionsPage() {
  const { result } = useScrape();
  const [rangeKey, setRangeKey] = useState<RangeKey>('6m');
  const [query, setQuery] = useState('');

  const hasData = result?.success === true;
  const accounts = result?.success ? result.accounts : [];

  const rangeAccounts = useMemo(
    () => (hasData ? comparisonWindows(accounts, rangeKey).current : []),
    [accounts, rangeKey, hasData],
  );

  const flatFiltered = useMemo(() => {
    const flat = flattenTxns(rangeAccounts);
    const q = query.trim().toLowerCase();
    if (!q) {
      return flat;
    }
    return flat.filter(
      ({ txn, accountNumber }) =>
        txn.description.toLowerCase().includes(q) ||
        accountNumber.toLowerCase().includes(q) ||
        (txn.memo && txn.memo.toLowerCase().includes(q)),
    );
  }, [rangeAccounts, query]);

  if (!hasData) {
    return (
      <div className="bank-empty-dash">
        <h2>No transactions</h2>
        <p>Sync or sign in to load your ledger.</p>
        <Link to="/login" className="bank-btn-export">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="bank-dash-hero">
        <div className="bank-dash-greet">
          <h1>Transactions</h1>
          <p>Full ledger for the selected period.</p>
        </div>
        <div className="bank-dash-actions">
          <label htmlFor="tx-range" className="visually-hidden">
            Period
          </label>
          <select
            id="tx-range"
            className="bank-select"
            value={rangeKey}
            onChange={(e) => setRangeKey(e.target.value as RangeKey)}
          >
            <option value="6m">6 Month Ago</option>
            <option value="3m">3 Month Ago</option>
            <option value="1m">1 Month Ago</option>
            <option value="7d">7 Days Ago</option>
          </select>
          <Link to="/dashboard" className="bank-card-link">
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="bank-search">
        <input
          type="search"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search transactions"
        />
      </div>
      <div className="bank-table-card">
        <table className="bank-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {flatFiltered.map(({ accountNumber, txn }, i) => (
              <tr key={`${accountNumber}-${txn.date}-${i}`}>
                <td className="bank-mono">{accountNumber}</td>
                <td>{txn.date.slice(0, 10)}</td>
                <td>{txn.description}</td>
                <td className={txn.chargedAmount < 0 ? 'bank-amt-neg' : 'bank-amt-pos'}>
                  {formatMoney(txn.chargedAmount, txn.originalCurrency)}
                </td>
                <td>{txn.status}</td>
                <td>{txn.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {flatFiltered.length === 0 ? (
          <p style={{ padding: '1rem 1.25rem', color: '#64748b', margin: 0 }}>No matching rows.</p>
        ) : null}
      </div>
    </>
  );
}
