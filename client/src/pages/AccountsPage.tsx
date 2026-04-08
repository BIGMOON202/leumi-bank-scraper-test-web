import { Link } from 'react-router-dom';
import { useScrape } from '../context/ScrapeContext';
import { formatMoney } from '../lib/format';

export function AccountsPage() {
  const { result } = useScrape();

  if (!result?.success) {
    return (
      <div className="bank-page-inner">
        <header className="bank-dash-hero">
          <div className="bank-dash-greet">
            <h1>Accounts</h1>
            <p>Balances and activity per account.</p>
          </div>
        </header>
        <div className="bank-empty-dash">
          <h2>No accounts</h2>
          <p>Sign in and sync to load data.</p>
          <Link to="/login" className="bank-btn-export">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-page-inner">
      <header className="bank-dash-hero">
        <div className="bank-dash-greet">
          <h1>Accounts</h1>
          <p>Snapshot of each account from the last sync.</p>
        </div>
        <Link to="/dashboard" className="bank-card-link">
          ← Dashboard
        </Link>
      </header>
      <div className="account-grid">
        {result.accounts.map((acc) => (
          <article key={acc.accountNumber} className="account-card">
            <div className="account-card-top">
              <span className="account-card-label">Account</span>
              <span className="account-card-number bank-mono">{acc.accountNumber}</span>
            </div>
            {acc.balance !== undefined ? (
              <div className="account-card-balance">{formatMoney(acc.balance, 'ILS')}</div>
            ) : (
              <div className="account-card-balance muted">Balance n/a</div>
            )}
            <div className="account-card-meta">
              <span>{acc.txns.length} transactions</span>
            </div>
            <Link to="/dashboard" className="account-card-link">
              View in overview →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
