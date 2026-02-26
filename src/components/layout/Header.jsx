import { memo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Header = memo(function Header() {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  return (
    <header className="header glass" role="banner">
      <div className="header__inner">
        <Link to="/" className="header__logo" aria-label="PeriodicX Home">
          <span className="header__logo-mark" aria-hidden="true">Px</span>
          <span className="header__logo-text">PeriodicX</span>
          <span className="header__logo-tag">118 Elements</span>
        </Link>

        <nav className="header__nav" role="navigation" aria-label="Main navigation">
          <Link to="/"        className={`nav-link ${isActive('/')        ? 'nav-link--active' : ''}`} aria-current={isActive('/')        ? 'page' : undefined}><span aria-hidden="true">⊞</span> Table</Link>

          <Link to="/compare" className={`nav-link ${isActive('/compare') ? 'nav-link--active' : ''}`} aria-current={isActive('/compare') ? 'page' : undefined}><span aria-hidden="true">⇌</span> Compare</Link>

          <Link to="/quiz" className={`nav-link ${isActive('/quiz') ? 'nav-link--active' : 
          ''}`} aria-current={isActive('/quiz') ? 'page' : undefined}><span aria-hidden="true">🧪</span> Quiz</Link>
          
        </nav>

        <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
          <span aria-hidden="true">{isDark ? '☀' : '🌙'}</span>
          <span className="theme-toggle__label">{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      <style>{`
        .header { position: sticky; top: 0; z-index: 50; background: var(--bg-header); border-bottom: 1px solid var(--border-subtle); }
        .header__inner { max-width: 1600px; margin: 0 auto; padding: 0 24px; height: 60px; display: flex; align-items: center; gap: 24px; }
        .header__logo { display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; }
        .header__logo-mark { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: var(--radius-sm); font-family: var(--font-display); font-size: 0.9rem; font-weight: 800; color: white; }
        .header__logo-text { font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
        .header__logo-tag { font-family: var(--font-mono); font-size: 0.6rem; color: var(--text-muted); background: var(--bg-tertiary); border: 1px solid var(--border-subtle); padding: 2px 6px; border-radius: 999px; }
        .header__nav { display: flex; align-items: center; gap: 4px; margin-left: 8px; }
        .nav-link { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: var(--radius-md); font-size: 0.83rem; font-weight: 500; color: var(--text-secondary); text-decoration: none; transition: all var(--transition-fast); }
        .nav-link:hover { background: var(--bg-tertiary); color: var(--text-primary); }
        .nav-link--active { background: var(--bg-tertiary); color: var(--accent); font-weight: 600; }
        .theme-toggle { display: flex; align-items: center; gap: 6px; margin-left: auto; padding: 6px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-medium); background: var(--bg-secondary); color: var(--text-secondary); font-size: 0.78rem; font-family: var(--font-body); font-weight: 500; transition: all var(--transition-fast); cursor: pointer; flex-shrink: 0; }
        .theme-toggle:hover { background: var(--bg-tertiary); color: var(--text-primary); }
        @media (max-width: 600px) { .header__inner { padding: 0 16px; } .header__logo-tag { display: none; } .theme-toggle__label { display: none; } }
        @media (max-width: 480px) { .header__logo-text { display: none; } }
      `}</style>
    </header>
  );
});

export default Header;