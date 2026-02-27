import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }} role="main">
      <div className="not-found animate-scaleIn">
        <div className="not-found__element">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>404</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-muted)', lineHeight: 1 }}>?</span>
          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Notfoundium</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-muted)' }}>∞</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>Page Not Found</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 320, textAlign: 'center' }}>
          This element doesn't exist on the periodic table — or this page.
        </p>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--accent)', color: 'white', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', transition: 'background var(--transition-fast)' }}>
          ← Back to the Periodic Table
        </Link>
      </div>
      <style>{`
        .not-found { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .not-found__element { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 120px; height: 120px; border-radius: var(--radius-md); border: 2px solid var(--border-strong); background: var(--bg-card); gap: 2px; margin-bottom: 8px; }
      `}</style>
    </main>
  );
}