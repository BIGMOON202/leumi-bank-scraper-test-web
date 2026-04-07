import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AccountRow, TxnRow } from '../types';
import { useScrape } from '../context/ScrapeContext';
import { formatMoney, summarizeAccounts, todayLabel } from '../lib/format';
import { IconActivity, IconLayers, IconSearch, IconTrendDown, IconTrendUp } from '../components/Icons';

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

export function DashboardPage() {
  const { result } = useScrape();
  const [query, setQuery] = useState('');

  const summary = useMemo(() => {
    if (result?.success) {
      return summarizeAccounts(result.accounts);
    }
    return null;
  }, [result]);

  const filteredFlat = useMemo(() => {
    if (!result?.success) {
      return [];
    }
    const flat = flattenTxns(result.accounts);
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
  }, [result, query]);

  const hasData = result?.success === true;

  return (
    <>
      <header className="page-header">
        <div className="page-header-text">
          <h1>Financial overview</h1>
          <p>Track cash flow and recent movements from your Leumi accounts.</p>
        </div>
        <div className="topbar-meta">
          <span className="pill">{todayLabel()}</span>
          <span className="pill pill-live">API</span>
        </div>
      </header>

      <main className="content">
        {!hasData ? (
          <div className="empty-state">
            <h2>No data yet</h2>
            <p>Connect Leumi or load demo data from the sign-in screen to populate this dashboard.</p>
            <Link to="/login" className="btn btn-primary">
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            {summary ? (
              <section className="kpi-grid" aria-label="Key metrics">
                <article className="kpi-card accent-violet">
                  <div className="kpi-label">
                    Accounts
                    <span className="kpi-icon" aria-hidden>
                      <IconLayers />
                    </span>
                  </div>
                  <div className="kpi-value">{summary.accountCount}</div>
                  <div className="kpi-sub">In this response</div>
                </article>
                <article className="kpi-card">
                  <div className="kpi-label">
                    Transactions
                    <span className="kpi-icon" aria-hidden>
                      <IconActivity />
                    </span>
                  </div>
                  <div className="kpi-value">{summary.totalTxns}</div>
                  <div className="kpi-sub">In selected range</div>
                </article>
                <article className="kpi-card accent-mint">
                  <div className="kpi-label">
                    Inflow
                    <span className="kpi-icon" aria-hidden>
                      <IconTrendUp />
                    </span>
                  </div>
                  <div className="kpi-value">{formatMoney(summary.income, 'ILS')}</div>
                  <div className="kpi-sub">Credits</div>
                </article>
                <article className="kpi-card accent-coral">
                  <div className="kpi-label">
                    Outflow
                    <span className="kpi-icon" aria-hidden>
                      <IconTrendDown />
                    </span>
                  </div>
                  <div className="kpi-value">{formatMoney(summary.expense, 'ILS')}</div>
                  <div className="kpi-sub">Debits</div>
                </article>
              </section>
            ) : null}

            <section className="panel-glass search-panel">
              <div className="search-wrap">
                <span className="search-icon" aria-hidden>
                  <IconSearch />
                </span>
                <input
                  type="search"
                  className="search-input"
                  placeholder="Search transactions by description or account…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search transactions"
                />
              </div>
              <p className="search-hint">
                Showing <strong>{filteredFlat.length}</strong> of{' '}
                {result?.success ? flattenTxns(result.accounts).length : 0} rows
              </p>
            </section>

            <section className="mt-lg">
              <h2 className="section-title">
                <span>All activity</span>
              </h2>
              <div className="table-card">
                <div className="table-wrap">
                  <table>
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
                      {filteredFlat.map(({ accountNumber, txn }, i) => (
                        <TxnRowView key={`${accountNumber}-${txn.date}-${i}`} accountNumber={accountNumber} txn={txn} />
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredFlat.length === 0 ? (
                  <p className="table-empty">No transactions match your search.</p>
                ) : null}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}

function TxnRowView({ txn, accountNumber }: { txn: TxnRow; accountNumber: string }) {
  const inst =
    txn.installments != null ? ` (${txn.installments.number}/${txn.installments.total})` : '';
  const done = txn.status === 'completed';
  return (
    <tr>
      <td className="mono nowrap">{accountNumber}</td>
      <td className="nowrap">{txn.date.slice(0, 10)}</td>
      <td>
        {txn.description}
        {inst}
      </td>
      <td className={txn.chargedAmount < 0 ? 'neg' : 'pos'}>{formatMoney(txn.chargedAmount, txn.originalCurrency)}</td>
      <td>
        <span className={done ? 'badge badge-done' : 'badge'}>{txn.status}</span>
      </td>
      <td>
        <span className="badge">{txn.type}</span>
      </td>
    </tr>
  );
}
