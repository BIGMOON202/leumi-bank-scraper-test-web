import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useScrape } from '../context/ScrapeContext';
import { IconSettings } from './Icons';

function LogoMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <rect width="36" height="36" rx="10" fill="#0f172a" />
      <path d="M10 12h6l-2 12H8L10 12zm10 0h6l-2 12h-6l2-12z" fill="#635BFF" />
    </svg>
  );
}

export function BankTopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { clearSession } = useScrape();

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  function signOut() {
    clearSession();
    navigate('/login', { replace: true });
    setMenuOpen(false);
  }

  return (
    <header className="bank-topnav">
      <div className="bank-topnav-inner">
        <Link to="/dashboard" className="bank-logo">
          <LogoMark />
          <span className="bank-logo-text">FluxBank</span>
        </Link>

        <nav className="bank-nav-center" aria-label="Main">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => 'bank-nav-pill' + (isActive ? ' is-active' : '')}
          >
            <IconNavDashboard />
            Dashboard
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => 'bank-nav-pill' + (isActive ? ' is-active' : '')}>
            <IconNavTx />
            Transactions
          </NavLink>
          <NavLink to="/report" className={({ isActive }) => 'bank-nav-pill' + (isActive ? ' is-active' : '')}>
            <IconNavReport />
            Report
          </NavLink>
          <span className="bank-nav-pill bank-nav-pill-disabled" title="Coming soon">
            <IconNavPay />
            Payment
          </span>
        </nav>

        <div className="bank-topnav-right">
          <button type="button" className="bank-icon-btn" aria-label="Search">
            <IconSearch />
          </button>
          <button type="button" className="bank-icon-btn" aria-label="Messages">
            <IconChat />
          </button>
          <button type="button" className="bank-icon-btn" aria-label="Notifications">
            <IconBell />
          </button>
          <div className="bank-user-wrap" ref={ref}>
            <button
              type="button"
              className="bank-user"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
            >
              <span className="bank-user-avatar">A</span>
              <span className="bank-user-text">
                <span className="bank-user-name">John</span>
                <span className="bank-user-role">Admin</span>
              </span>
              <span className="bank-user-chevron" aria-hidden>
                ▾
              </span>
            </button>
            {menuOpen ? (
              <div className="bank-user-menu">
                <Link to="/settings" className="bank-user-menu-item" onClick={() => setMenuOpen(false)}>
                  <IconSettings />
                  Settings
                </Link>
                <button type="button" className="bank-user-menu-item" onClick={signOut}>
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function IconNavDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function IconNavTx() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function IconNavReport() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function IconNavPay() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <path d="M1 10h22" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
