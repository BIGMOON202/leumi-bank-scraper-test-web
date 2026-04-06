import { useMemo, useState } from 'react';
import type { AccountRow, ScrapeResult, TxnRow } from './types';
import { fetchDemo, fetchScrape } from './api';

function defaultStartDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return d.toISOString().slice(0, 10);
}

function formatMoney(n: number, currency: string): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: currency === 'ILS' ? 'ILS' : currency,
    minimumFractionDigits: 2,
  }).format(n);
}

function summarizeAccounts(accounts: AccountRow[]) {
  let totalTxns = 0;
  let sumCharges = 0;
  for (const a of accounts) {
    totalTxns += a.txns.length;
    for (const t of a.txns) {
      sumCharges += t.chargedAmount;
    }
  }
  return { totalTxns, sumCharges, accountCount: accounts.length };
}

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [showBrowser, setShowBrowser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScrapeResult | null>(null);

  const summary = useMemo(() => {
    if (result?.success) {
      return summarizeAccounts(result.accounts);
    }
    return null;
  }, [result]);

  async function runDemo() {
    setError(null);
    setLoading(true);
    try {
      const r = await fetchDemo();
      setResult(r);
      if (!r.success) {
        setError(r.errorMessage ?? r.errorType);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function runScrape() {
    setError(null);
    if (!username.trim() || !password) {
      setError('Enter username and password.');
      return;
    }
    setLoading(true);
    try {
      const r = await fetchScrape({
        username: username.trim(),
        password,
        startDate,
        showBrowser,
      });
      setResult(r);
      if (!r.success) {
        setError(r.errorMessage ?? r.errorType);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Bank Leumi — activity reports</h1>
        <p className="tagline">
          Data comes from your <code>israeli-bank-scrapers</code> backend. Login details are <strong>not</strong>{' '}
          stored in a database or log file; they are used in memory on the server only for the scrape request.
        </p>
      </header>

      <section className="panel">
        <h2>Connect</h2>
        <div className="grid">
          <label>
            Username
            <input
              type="text"
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Leumi username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sent to API once per fetch"
            />
          </label>
          <label>
            Start date
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label className="checkbox">
            <input type="checkbox" checked={showBrowser} onChange={(e) => setShowBrowser(e.target.checked)} />
            Show browser (debug)
          </label>
        </div>
        <div className="actions">
          <button type="button" disabled={loading} onClick={runScrape}>
            {loading ? 'Working…' : 'Fetch from Leumi'}
          </button>
          <button type="button" className="secondary" disabled={loading} onClick={runDemo}>
            Load demo data
          </button>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>

      {result?.success ? (
        <>
          <section className="panel">
            <h2>Summary</h2>
            {summary ? (
              <ul className="summary-list">
                <li>
                  <strong>{summary.accountCount}</strong> accounts
                </li>
                <li>
                  <strong>{summary.totalTxns}</strong> transactions
                </li>
                <li>
                  Net charged sum (all txns): <strong>{formatMoney(summary.sumCharges, 'ILS')}</strong>
                </li>
              </ul>
            ) : null}
          </section>

          {result.accounts.map((acc) => (
            <AccountSection key={acc.accountNumber} account={acc} />
          ))}
        </>
      ) : null}
    </div>
  );
}

function AccountSection({ account }: { account: AccountRow }) {
  return (
    <section className="panel account">
      <h2>
        Account <span className="mono">{account.accountNumber}</span>
        {account.balance !== undefined ? (
          <span className="balance">Balance: {formatMoney(account.balance, 'ILS')}</span>
        ) : null}
      </h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {account.txns.map((t, i) => (
              <TxnRowView key={`${t.date}-${t.description}-${i}`} txn={t} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TxnRowView({ txn }: { txn: TxnRow }) {
  const inst =
    txn.installments != null ? ` (${txn.installments.number}/${txn.installments.total})` : '';
  return (
    <tr>
      <td className="nowrap">{txn.date.slice(0, 10)}</td>
      <td>
        {txn.description}
        {inst}
      </td>
      <td className={txn.chargedAmount < 0 ? 'neg' : 'pos'}>{formatMoney(txn.chargedAmount, txn.originalCurrency)}</td>
      <td>{txn.status}</td>
      <td>{txn.type}</td>
    </tr>
  );
}
