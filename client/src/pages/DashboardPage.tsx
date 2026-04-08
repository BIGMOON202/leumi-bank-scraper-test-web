import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AccountRow, TxnRow } from '../types';
import { useScrape } from '../context/ScrapeContext';
import { formatMoney, summarizeAccounts } from '../lib/format';
import { accountsToCsv, downloadCsv } from '../lib/exportCsv';
import { comparisonWindows, type RangeKey } from '../lib/reportRange';
import { PocketDonut } from '../components/PocketDonut';

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

function totalBalance(accounts: AccountRow[]): number | null {
  const withBal = accounts.filter((a) => a.balance !== undefined);
  if (withBal.length === 0) {
    return null;
  }
  return withBal.reduce((s, a) => s + (a.balance as number), 0);
}

function cardMaskFromAccounts(accounts: AccountRow[]): string {
  const num = accounts[0]?.accountNumber?.replace(/\D/g, '') ?? '';
  const last4 = num.slice(-4).padStart(4, '0');
  return `**** ${last4.slice(-4)}`;
}

function txnLabel(txn: TxnRow): string {
  const d = txn.description.trim();
  if (d) {
    return d.length > 28 ? `${d.slice(0, 26)}…` : d;
  }
  return txn.type ?? 'Transaction';
}

export function DashboardPage() {
  const { result } = useScrape();
  const navigate = useNavigate();
  const [rangeKey, setRangeKey] = useState<RangeKey>('6m');
  const [query, setQuery] = useState('');
  const [balanceHidden, setBalanceHidden] = useState(false);

  const hasData = result?.success === true;
  const accounts = result?.success ? result.accounts : [];

  const { current: rangeAccounts, pctIncome, pctExpense } = useMemo(
    () => (hasData ? comparisonWindows(accounts, rangeKey) : { current: [], pctIncome: null, pctExpense: null }),
    [accounts, rangeKey, hasData],
  );

  const summary = useMemo(() => summarizeAccounts(rangeAccounts), [rangeAccounts]);

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

  const recentThree = useMemo(() => flatFiltered.slice(0, 3), [flatFiltered]);

  const balanceTotal = useMemo(() => (hasData ? totalBalance(accounts) : null), [accounts, hasData]);

  const maskedCard = useMemo(() => (hasData ? cardMaskFromAccounts(accounts) : '**** 9946'), [accounts, hasData]);

  function handleExportCsv() {
    if (!result?.success) {
      return;
    }
    const name = `fluxbank-export-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(name, accountsToCsv(result.accounts));
  }

  if (!hasData) {
    return (
      <div className="bank-empty-dash">
        <h2>No data yet</h2>
        <p>Sign in or load demo data to see your dashboard.</p>
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
          <h1>
            Hello <span aria-hidden>👋</span>, John!
          </h1>
          <p>
            Here&apos;s an update information of your financial <span aria-hidden>💰</span>
          </p>
        </div>
        <div className="bank-dash-actions">
          <label htmlFor="dash-range" className="visually-hidden">
            Report period
          </label>
          <select
            id="dash-range"
            className="bank-select"
            value={rangeKey}
            onChange={(e) => setRangeKey(e.target.value as RangeKey)}
          >
            <option value="6m">6 Month Ago</option>
            <option value="3m">3 Month Ago</option>
            <option value="1m">1 Month Ago</option>
            <option value="7d">7 Days Ago</option>
          </select>
          <button type="button" className="bank-btn-export" onClick={handleExportCsv}>
            <IconDownload />
            Export
          </button>
        </div>
      </header>

      <div className="bank-grid">
        <section className="bank-card" aria-labelledby="my-card-title">
          <div className="bank-card-head">
            <h2 id="my-card-title" className="bank-card-title">
              My Card
            </h2>
            <button type="button" className="bank-card-link">
              Add Card
            </button>
          </div>
          <div className="bank-card-visual">
            <div className="bank-card-chip" />
            <div className="bank-card-number">{maskedCard}</div>
            <div className="bank-card-footer-row">
              <span>CVC ···</span>
              <span>Exp 12/25</span>
              <span className="bank-card-brand">Mastercard</span>
            </div>
          </div>
          <ul className="bank-action-list">
            <li>Activate Card</li>
            <li>Replace Card</li>
            <li>Setting Limit</li>
          </ul>
          <div className="bank-withdraw-foot">
            <span aria-hidden>💵</span>
            <span>
              <strong>Withdrawals</strong> — You have unlimited free withdrawals this month.
            </span>
          </div>
        </section>

        <section className="bank-card" aria-labelledby="pocket-title">
          <div className="bank-card-head">
            <h2 id="pocket-title" className="bank-card-title">
              My Pocket
            </h2>
            <Link to="/transactions" className="bank-card-link">
              View All
            </Link>
          </div>
          <PocketDonut accounts={rangeAccounts} />
          <div className="bank-pocket-stats">
            <div className="bank-pocket-stat">
              <div className="bank-pocket-stat-head">
                <div className="bank-pocket-stat-label">Income</div>
                <Link to="/report" className="bank-pocket-viewall">
                  View All
                </Link>
              </div>
              <div className="bank-pocket-stat-value">{formatMoney(summary.income, 'ILS')}</div>
              {pctIncome != null ? (
                <span className={pctIncome >= 0 ? 'bank-pill-pos' : 'bank-pill-neg'}>
                  {pctIncome >= 0 ? '+' : ''}
                  {pctIncome}%
                </span>
              ) : null}
            </div>
            <div className="bank-pocket-stat">
              <div className="bank-pocket-stat-head">
                <div className="bank-pocket-stat-label">Outcome</div>
                <Link to="/report" className="bank-pocket-viewall">
                  View All
                </Link>
              </div>
              <div className="bank-pocket-stat-value">{formatMoney(Math.abs(summary.expense), 'ILS')}</div>
              {pctExpense != null ? (
                <span className={pctExpense <= 0 ? 'bank-pill-pos' : 'bank-pill-neg'}>
                  {pctExpense >= 0 ? '+' : ''}
                  {pctExpense}%
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <section className="bank-card" aria-labelledby="balance-title">
          <div className="bank-card-head">
            <h2 id="balance-title" className="bank-card-title">
              Total Balance
            </h2>
          </div>
          <div className="bank-balance-main">
            {balanceHidden ? (
              <span>••••••</span>
            ) : balanceTotal != null ? (
              formatMoney(balanceTotal, 'ILS')
            ) : (
              '—'
            )}
            <button
              type="button"
              className="bank-eye-btn"
              aria-label={balanceHidden ? 'Show balance' : 'Hide balance'}
              onClick={() => setBalanceHidden((h) => !h)}
            >
              {balanceHidden ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
          <div className="bank-quick-actions">
            <button type="button" className="bank-qaction">
              <span className="bank-qaction-circle">
                <IconWithdraw />
              </span>
              Withdraw
            </button>
            <button type="button" className="bank-qaction">
              <span className="bank-qaction-circle">
                <IconTransfer />
              </span>
              Transfer
            </button>
            <button type="button" className="bank-qaction">
              <span className="bank-qaction-circle">
                <IconTopUp />
              </span>
              Top Up
            </button>
            <button type="button" className="bank-qaction">
              <span className="bank-qaction-circle">
                <IconDeposit />
              </span>
              Deposit
            </button>
          </div>
          <h3 className="bank-card-title" style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>
            Recent Transactions
          </h3>
          <ul className="bank-tx-list">
            {recentThree.map(({ txn, accountNumber }, i) => (
              <li key={`${accountNumber}-${txn.date}-${i}`} className="bank-tx-item">
                <div>
                  <div className="bank-tx-title">{txnLabel(txn)}</div>
                  <div
                    className={
                      'bank-tx-status ' +
                      (isSuccessStatus(txn.status) ? 'ok' : isPendingStatus(txn.status) ? 'pending' : 'fail')
                    }
                  >
                    {isSuccessStatus(txn.status) ? 'Success' : isPendingStatus(txn.status) ? 'Pending' : 'Failed'}
                  </div>
                </div>
                <div className="bank-tx-amt">{formatMoney(txn.chargedAmount, txn.originalCurrency)}</div>
              </li>
            ))}
          </ul>
          {recentThree.length === 0 ? <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>No transactions in range.</p> : null}
          <div className="bank-promo">
            <p>Explore your financial report and see the highlights!</p>
            <button type="button" className="bank-promo-btn" onClick={() => navigate('/report')}>
              Learn More
            </button>
          </div>
        </section>
      </div>

      <section className="bank-table-section">
        <h2>Ledger</h2>
        <div className="bank-search">
          <input
            type="search"
            placeholder="Search transactions…"
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
                </tr>
              ))}
            </tbody>
          </table>
          {flatFiltered.length === 0 ? (
            <p style={{ padding: '1rem 1.25rem', color: '#64748b', margin: 0 }}>No rows match your search.</p>
          ) : null}
        </div>
      </section>

    </>
  );
}

function isSuccessStatus(s: string) {
  return s.toLowerCase() === 'completed';
}

function isPendingStatus(s: string) {
  return s.toLowerCase() === 'pending';
}

function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconWithdraw() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12M8 11l4 4 4-4M5 21h14" />
    </svg>
  );
}

function IconTransfer() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function IconTopUp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21V3M5 10l7-7 7 7" />
    </svg>
  );
}

function IconDeposit() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}
