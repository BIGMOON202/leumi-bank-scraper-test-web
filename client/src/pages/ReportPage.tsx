import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrape } from '../context/ScrapeContext';
import { formatMoney, formatReportPeriod, summarizeAccounts } from '../lib/format';
import { accountsToCsv, downloadCsv } from '../lib/exportCsv';
import { transactionDateRange } from '../lib/chartData';
import { comparisonWindows, type RangeKey } from '../lib/reportRange';

export function ReportPage() {
  const { result } = useScrape();
  const [rangeKey, setRangeKey] = useState<RangeKey>('6m');

  const hasData = result?.success === true;
  const accounts = result?.success ? result.accounts : [];

  const { current: rangeAccounts, pctIncome, pctExpense } = useMemo(
    () => (hasData ? comparisonWindows(accounts, rangeKey) : { current: [], pctIncome: null, pctExpense: null }),
    [accounts, rangeKey, hasData],
  );

  const summary = useMemo(() => summarizeAccounts(rangeAccounts), [rangeAccounts]);

  const period = useMemo(() => (hasData ? transactionDateRange(accounts) : null), [accounts, hasData]);

  function handleExport() {
    if (!result?.success) {
      return;
    }
    downloadCsv(`report-${new Date().toISOString().slice(0, 10)}.csv`, accountsToCsv(result.accounts));
  }

  if (!hasData) {
    return (
      <div className="bank-empty-dash">
        <h2>No report</h2>
        <p>Load data first to see summaries and export.</p>
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
          <h1>Financial report</h1>
          <p>
            {period ? (
              <>
                Data span: <strong>{formatReportPeriod(period.start, period.end)}</strong>
              </>
            ) : (
              'Period from your last sync.'
            )}
          </p>
        </div>
        <div className="bank-dash-actions">
          <label htmlFor="rep-range" className="visually-hidden">
            Filter window
          </label>
          <select
            id="rep-range"
            className="bank-select"
            value={rangeKey}
            onChange={(e) => setRangeKey(e.target.value as RangeKey)}
          >
            <option value="6m">6 Month Ago</option>
            <option value="3m">3 Month Ago</option>
            <option value="1m">1 Month Ago</option>
            <option value="7d">7 Days Ago</option>
          </select>
          <button type="button" className="bank-btn-export" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </header>

      <div className="bank-grid" style={{ marginBottom: '1.5rem' }}>
        <section className="bank-card">
          <h2 className="bank-card-title">Accounts</h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', fontWeight: 800 }}>{summary.accountCount}</p>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>In selected window</p>
        </section>
        <section className="bank-card">
          <h2 className="bank-card-title">Transactions</h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', fontWeight: 800 }}>{summary.totalTxns}</p>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>Lines in window</p>
        </section>
        <section className="bank-card">
          <h2 className="bank-card-title">Net flow</h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', fontWeight: 800 }}>
            {formatMoney(summary.income + summary.expense, 'ILS')}
          </p>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>Income minus spending</p>
        </section>
      </div>

      <section className="bank-card" style={{ marginBottom: '1rem' }}>
        <h2 className="bank-card-title">Income &amp; spending (window)</h2>
        <div className="bank-pocket-stats" style={{ marginTop: '1rem' }}>
          <div className="bank-pocket-stat">
            <div className="bank-pocket-stat-label">Income</div>
            <div className="bank-pocket-stat-value">{formatMoney(summary.income, 'ILS')}</div>
            {pctIncome != null ? (
              <span className={pctIncome >= 0 ? 'bank-pill-pos' : 'bank-pill-neg'}>
                {pctIncome >= 0 ? '+' : ''}
                {pctIncome}%
              </span>
            ) : null}
          </div>
          <div className="bank-pocket-stat">
            <div className="bank-pocket-stat-label">Spending</div>
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

      <p style={{ margin: 0 }}>
        <Link to="/dashboard" className="bank-card-link">
          ← Back to dashboard
        </Link>
      </p>
    </>
  );
}
