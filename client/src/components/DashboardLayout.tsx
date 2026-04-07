import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  IconActivity,
  IconCard,
  IconGrid,
  IconMoon,
  IconSettings,
  IconSun,
} from './Icons';
import { useTheme } from '../context/ThemeContext';
import { useScrape } from '../context/ScrapeContext';
import { formatSyncTime } from '../lib/format';

export function DashboardLayout() {
  const { theme, toggleTheme } = useTheme();
  const { lastSyncAt, lastSyncMode } = useScrape();

  return (
    <div className="dashboard">
      <aside className="sidebar" aria-label="Primary">
        <Link to="/dashboard" className="brand brand-link">
          <div className="brand-mark" aria-hidden>
            F
          </div>
          <div className="brand-text">
            <span className="brand-name">Flux</span>
            <span className="brand-tag">Leumi workspace</span>
          </div>
        </Link>

        <nav className="nav">
          <NavLink to="/dashboard" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')} end>
            <IconGrid />
            Overview
          </NavLink>
          <NavLink to="/accounts" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <IconCard />
            Accounts
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <IconSettings />
            Settings
          </NavLink>
        </nav>

        <Link to="/login" className="btn btn-ghost btn-block sidebar-sync">
          <IconActivity />
          New sync
        </Link>

        <div className="sidebar-note">
          Powered by <code>israeli-bank-scrapers</code>. Credentials are not stored server-side — only used in memory for
          each request.
          {lastSyncAt ? (
            <>
              <br />
              <br />
              Last sync: <strong>{formatSyncTime(lastSyncAt)}</strong>
              {lastSyncMode ? ` (${lastSyncMode})` : ''}
            </>
          ) : null}
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="topbar topbar-toolbar">
          <div className="topbar-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
