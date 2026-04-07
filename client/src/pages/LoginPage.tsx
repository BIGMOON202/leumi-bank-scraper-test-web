import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchDemo, fetchScrape } from '../api';
import { defaultStartDate } from '../lib/format';
import { useTheme } from '../context/ThemeContext';
import { useScrape } from '../context/ScrapeContext';
import { IconMoon, IconSun } from '../components/Icons';

export function LoginPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { setScrapeResult } = useScrape();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [showBrowser, setShowBrowser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDemo() {
    setError(null);
    setLoading(true);
    try {
      const r = await fetchDemo();
      if (!r.success) {
        setError(r.errorMessage ?? r.errorType);
        return;
      }
      setScrapeResult(r, 'demo');
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
      if (!r.success) {
        setError(r.errorMessage ?? r.errorType);
        return;
      }
      setScrapeResult(r, 'live');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <button
        type="button"
        className="theme-toggle theme-toggle-floating"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? <IconSun /> : <IconMoon />}
      </button>

      <div className="login-split">
        <div className="login-hero">
          <div className="login-hero-inner">
            <div className="brand-mark login-hero-mark">F</div>
            <h1 className="login-hero-title">Welcome back</h1>
            <p className="login-hero-text">
              Connect Bank Leumi to see balances, cash flow, and movement in one calm dashboard.
            </p>
            <ul className="login-hero-list">
              <li>Secure sync via your API — credentials not stored in a database</li>
              <li>Demo mode to explore the UI without credentials</li>
            </ul>
          </div>
        </div>

        <div className="login-panel-wrap">
          <div className="login-panel">
            <div className="login-panel-head">
              <h2>Sign in to sync</h2>
              <p>Use your Leumi online banking username and password.</p>
            </div>

            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Username
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Leumi username"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>
              <label>
                Transactions from
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </label>
              <label className="checkbox-row">
                <input type="checkbox" checked={showBrowser} onChange={(e) => setShowBrowser(e.target.checked)} />
                Show browser (debug)
              </label>

              {error ? <div className="error-banner">{error}</div> : null}

              <div className="btn-row login-actions">
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in & sync'}
                </button>
                <button type="button" className="btn btn-ghost" disabled={loading} onClick={handleDemo}>
                  Try demo
                </button>
              </div>
            </form>

            <p className="login-footer">
              <Link to="/dashboard">Open dashboard without data</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
