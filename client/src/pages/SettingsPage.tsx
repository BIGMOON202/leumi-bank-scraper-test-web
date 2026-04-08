import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useScrape } from '../context/ScrapeContext';
import { accountsToCsv, downloadCsv } from '../lib/exportCsv';
import { formatSyncTime } from '../lib/format';
import { IconMoon, IconSun } from '../components/Icons';

export function SettingsPage() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const { result, lastSyncAt, lastSyncMode, clearSession } = useScrape();

  function handleExport() {
    if (!result?.success) {
      return;
    }
    const csv = accountsToCsv(result.accounts);
    downloadCsv(`leumi-export-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <div className="bank-page-inner">
      <header className="bank-dash-hero">
        <div className="bank-dash-greet">
          <h1>Settings</h1>
          <p>Appearance, exports, and session.</p>
        </div>
      </header>
      <div className="settings-stack">
          <section className="panel-glass settings-card">
            <h2>Appearance</h2>
            <p className="settings-desc">Choose light or dark. Preference is saved in this browser.</p>
            <div className="theme-segment">
              <button
                type="button"
                className={theme === 'dark' ? 'segment active' : 'segment'}
                onClick={() => setTheme('dark')}
              >
                <IconMoon /> Dark
              </button>
              <button
                type="button"
                className={theme === 'light' ? 'segment active' : 'segment'}
                onClick={() => setTheme('light')}
              >
                <IconSun /> Light
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={toggleTheme}>
                Toggle
              </button>
            </div>
          </section>

          <section className="panel-glass settings-card">
            <h2>Data export</h2>
            <p className="settings-desc">Download all visible transactions as CSV (UTF-8).</p>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!result?.success}
              onClick={handleExport}
            >
              Export CSV
            </button>
            {!result?.success ? <p className="settings-note">Sync or load demo data first.</p> : null}
          </section>

          <section className="panel-glass settings-card">
            <h2>Session</h2>
            <p className="settings-desc">
              Clears loaded bank data from this browser session. Does not delete anything on the server.
            </p>
            {lastSyncAt ? (
              <p className="settings-meta">
                Last sync: {formatSyncTime(lastSyncAt)}
                {lastSyncMode ? ` · ${lastSyncMode}` : ''}
              </p>
            ) : null}
            <div className="btn-row">
              <button type="button" className="btn btn-ghost" onClick={clearSession}>
                Clear session data
              </button>
              <Link to="/login" className="btn btn-primary">
                New sync
              </Link>
            </div>
          </section>

          <section className="panel-glass settings-card">
            <h2>Product ideas</h2>
            <ul className="ideas-list">
              <li>Budget categories &amp; rules (auto-tag merchants)</li>
              <li>Recurring payment detection &amp; alerts</li>
              <li>Monthly PDF statements &amp; email digests</li>
              <li>Multi-bank aggregation (other scrapers in the library)</li>
              <li>Read-only shared links for an accountant (no credentials)</li>
            </ul>
          </section>
        </div>
    </div>
  );
}
