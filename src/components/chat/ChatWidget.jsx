import { useState, memo, lazy, Suspense } from 'react';
import chembotLogo from '../../assets/chembot-logo.png';

const ChemBot = lazy(() => import('./ChemBot'));

const ChatWidget = memo(function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={`cw-fab ${open ? 'cw-fab--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close ChemBot' : 'Open ChemBot chemistry assistant'}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {open ? (
          <span className="cw-close-icon" aria-hidden="true">✕</span>
        ) : (
          <img
            src={chembotLogo}
            alt="ChemBot"
            className="cw-logo-img"
          />
        )}
      </button>

      {open && (
        <div className="cw-panel" role="dialog" aria-label="ChemBot chemistry assistant">
          <Suspense fallback={
            <div className="cw-loading">
              <div className="cw-spinner" />
            </div>
          }>
            <ChemBot onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      )}

      <style>{`
        /* FAB — closed state: shows robot image */
        .cw-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          padding: 0;
          overflow: hidden;
          background: transparent;
          box-shadow: 0 4px 20px rgba(59,130,246,.45), 0 0 0 3px rgba(59,130,246,.2);
          transition: all .2s cubic-bezier(.34,1.56,.64,1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cw-fab:hover {
          transform: translateY(-3px) scale(1.06);
          box-shadow: 0 8px 30px rgba(59,130,246,.6), 0 0 0 4px rgba(59,130,246,.25);
        }
        .cw-fab:active {
          transform: scale(0.96);
        }

        /* Robot logo image — fills the circular button */
        .cw-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          display: block;
        }

        /* Open state — ✕ close button */
        .cw-fab--open {
          background: var(--bg-tertiary, #1e293b);
          border: 1px solid var(--border-medium, #334155);
          box-shadow: 0 4px 12px rgba(0,0,0,.2);
        }
        .cw-fab--open:hover {
          transform: none;
          background: var(--bg-secondary, #0f172a);
          box-shadow: 0 4px 12px rgba(0,0,0,.2);
        }
        .cw-close-icon {
          font-size: 1rem;
          color: var(--text-secondary, #94a3b8);
          line-height: 1;
        }

        /* Chat panel */
        .cw-panel {
          position: fixed;
          bottom: 94px;
          right: 24px;
          z-index: 9999;
          animation: cw-up 250ms cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes cw-up {
          from { opacity: 0; transform: translateY(20px) scale(.95); }
          to   { opacity: 1; transform: none; }
        }

        /* Loading skeleton */
        .cw-loading {
          width: 370px;
          max-width: calc(100vw - 32px);
          height: 540px;
          background: var(--bg-secondary, #0f172a);
          border: 1px solid var(--border-medium, #334155);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cw-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-medium, #334155);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: cw-spin .8s linear infinite;
        }
        @keyframes cw-spin { to { transform: rotate(360deg); } }

        /* Mobile */
        @media (max-width: 480px) {
          .cw-fab   { bottom: 16px; right: 16px; }
          .cw-panel { bottom: 86px; right: 16px; left: 16px; }
        }
      `}</style>
    </>
  );
});

export default ChatWidget;