import { memo, useEffect, useCallback, useState } from 'react';

const FORMSPREE_URL = 'https://formspree.io/f/xeelnnab';

const FEEDBACK_TYPES = [
  { value: 'bug',     label: '🐛 Bug Report' },
  { value: 'feature', label: '✨ Feature Request' },
  { value: 'general', label: '💬 General Feedback' },
];

const CHANNELS = [
  {
    icon: '📧',
    label: 'Email',
    value: 'periodicx01@gmail.com',
    href:  'mailto:periodicx01@gmail.com',
    desc:  'For general enquiries and partnerships',
  },
  {
    icon: '🐛',
    label: 'Bug Reports',
    value: 'GitHub Issues',
    href:  'https://github.com/RohanBabhale1/PeriodicX-react/issues',
    desc:  'Found a bug? Open an issue on GitHub',
  },
  {
    icon: '💡',
    label: 'Feature Ideas',
    value: 'GitHub Discussions',
    href:  'https://github.com/RohanBabhale1/PeriodicX-react/discussions',
    desc:  'Suggest features and vote on ideas',
  },
];

const PROMISES = [
  { icon: '⚡', text: 'We read every submission' },
  { icon: '🔒', text: 'Your data stays private'  },
  { icon: '📬', text: 'We reply within 48 hours' },
];

const INITIAL_FORM = { name: '', email: '', type: 'general', rating: 0, message: '' };

const ContactModal = memo(function ContactModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('form');
  const [form,      setForm]      = useState(INITIAL_FORM);
  const [status,    setStatus]    = useState('idle'); // idle | loading | success | error

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.message.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch(FORMSPREE_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name:    form.name    || 'Anonymous',
          email:   form.email   || 'not provided',
          type:    form.type,
          rating:  form.rating  || 'not rated',
          message: form.message,
        }),
      });
      if (res.ok) { setStatus('success'); }
      else        { setStatus('error'); }
    } catch {
      setStatus('error');
    }
  }, [form]);

  const handleClose = useCallback(() => {
    setForm(INITIAL_FORM);
    setStatus('idle');
    onClose();
  }, [onClose]);

  return (
    <div
      className="ct-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Contact & Feedback"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="ct-panel animate-scaleIn">

        {/* ── Header ───────────────────────────────── */}
        <div className="ct-header">
          <div className="ct-header__left">
            <div className="ct-header__icon" aria-hidden="true">💬</div>
            <div>
              <h2 className="ct-title">Contact & Feedback</h2>
              <p className="ct-subtitle">We'd love to hear from you</p>
            </div>
          </div>
          <button className="ct-close" onClick={handleClose} aria-label="Close contact modal">✕</button>
        </div>

        {/* ── Promise strip ─────────────────────────── */}
        <div className="ct-promises" aria-label="Our commitments">
          {PROMISES.map((p) => (
            <div key={p.text} className="ct-promise">
              <span className="ct-promise__icon" aria-hidden="true">{p.icon}</span>
              <span className="ct-promise__text">{p.text}</span>
            </div>
          ))}
        </div>

        {/* ── Tab bar ───────────────────────────────── */}
        <div className="ct-tabs" role="tablist" aria-label="Contact options">
          {[
            { id: 'form',     label: '📝 Send Feedback' },
            { id: 'channels', label: '📡 Other Channels' },
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`ct-tab ${activeTab === tab.id ? 'ct-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Body ─────────────────────────────────── */}
        <div className="ct-body">

          {activeTab === 'form' && (
            <div className="ct-form-wrap" role="tabpanel" aria-label="Send feedback form">

              {status === 'success' ? (
                <div className="ct-success">
                  <span className="ct-success__icon">✅</span>
                  <p className="ct-success__title">Thanks for your feedback!</p>
                  <p className="ct-success__sub">We'll review it and get back to you if needed.</p>
                  <button className="ct-submit-btn" onClick={handleClose}>Close</button>
                </div>
              ) : (
                <div className="ct-native-form">

                  {/* Row: Name + Email */}
                  <div className="ct-row">
                    <div className="ct-field">
                      <label className="ct-label" htmlFor="ct-name">Name <span className="ct-required">*</span>
                      </label>
                      <input
                        id="ct-name"
                        name="name"
                        type="text"
                        className="ct-input"
                        placeholder="Your name"
                        value={form.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="ct-field">
                      <label className="ct-label" htmlFor="ct-email">
                        Email <span className="ct-required">*</span>
                      </label>
                      <input
                        id="ct-email"
                        name="email"
                        type="email"
                        className="ct-input"
                        placeholder="Your email"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Type */}
                  <div className="ct-field">
                    <label className="ct-label">Type</label>
                    <div className="ct-type-grid">
                      {FEEDBACK_TYPES.map((t) => (
                        <button
                          key={t.value}
                          className={`ct-type-btn ${form.type === t.value ? 'ct-type-btn--active' : ''}`}
                          onClick={() => setForm((p) => ({ ...p, type: t.value }))}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="ct-field">
                    <label className="ct-label">Rating</label>
                    <div className="ct-rating" role="group" aria-label="Rate PeriodicX">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className={`ct-star ${form.rating >= star ? 'ct-star--active' : ''}`}
                          onClick={() => setForm((p) => ({ ...p, rating: star }))}
                          aria-label={`Rate ${star} out of 5`}
                        >
                          ★
                        </button>
                      ))}
                      {form.rating > 0 && (
                        <span className="ct-rating__label">
                          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][form.rating]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="ct-field">
                    <label className="ct-label" htmlFor="ct-message">
                      Message / Details <span className="ct-required">*</span>
                    </label>
                    <textarea
                      id="ct-message"
                      name="message"
                      className="ct-textarea"
                      placeholder="Describe the issue, idea, or share your thoughts..."
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                    />
                  </div>

                  {status === 'error' && (
                    <p className="ct-error">Something went wrong. Please try again.</p>
                  )}

                  <button
                    className="ct-submit-btn"
                    onClick={handleSubmit}
                    disabled={!form.message.trim() || status === 'loading'}
                  >
                    {status === 'loading' ? 'Sending…' : 'Send Feedback'}
                  </button>

                </div>
              )}
            </div>
          )}

          {/* Tab: Channels */}
          {activeTab === 'channels' && (
            <div className="ct-channels" role="tabpanel" aria-label="Other contact channels">
              <p className="ct-channels__intro">
                Prefer a different way to reach us? All these channels are monitored.
              </p>

              <div className="ct-channel-list">
                {CHANNELS.map((ch) => (
                  <a
                    key={ch.label}
                    href={ch.href}
                    className="ct-channel"
                    target={ch.href.startsWith('mailto') ? undefined : '_blank'}
                    rel={ch.href.startsWith('mailto') ? undefined : 'noreferrer noopener'}
                    aria-label={`${ch.label}: ${ch.value}`}
                  >
                    <span className="ct-channel__icon" aria-hidden="true">{ch.icon}</span>
                    <div className="ct-channel__body">
                      <span className="ct-channel__label">{ch.label}</span>
                      <span className="ct-channel__value">{ch.value}</span>
                      <span className="ct-channel__desc">{ch.desc}</span>
                    </div>
                    <span className="ct-channel__arrow" aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>

              <div className="ct-report-guide">
                <h4 className="ct-report-guide__heading">🐛 Reporting a Bug? Include these:</h4>
                <ul className="ct-report-guide__list">
                  <li>Which element or feature the bug affects</li>
                  <li>What you expected to happen</li>
                  <li>What actually happened</li>
                  <li>Your browser and device (e.g. Chrome on Android)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────── */}
        <div className="ct-footer">
          <span className="ct-footer__note">
            💙 All feedback is read personally and helps improve PeriodicX for everyone
          </span>
          <button className="ct-footer__btn" onClick={handleClose}>Close</button>
        </div>
      </div>

      <style>{`
        /* Overlay */
        .ct-overlay {
          position: fixed;
          inset: 0;
          z-index: 500;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        /* Panel */
        .ct-panel {
          width: 100%;
          max-width: 640px;
          max-height: 90vh;
          background: var(--bg-primary);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-xl);
          box-shadow: 0 24px 80px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Header */
        .ct-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 18px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          flex-shrink: 0;
        }
        .ct-header__left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .ct-header__icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.12));
          border: 1px solid rgba(6,182,212,0.25);
          border-radius: 10px;
          font-size: 1.3rem;
          flex-shrink: 0;
        }
        .ct-title {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }
        .ct-subtitle {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin: 2px 0 0;
        }
        .ct-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-medium);
          color: var(--text-muted);
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }
        .ct-close:hover { background: var(--bg-secondary); color: var(--text-primary); }

        /* Promise strip */
        .ct-promises {
          display: flex;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-tertiary);
          flex-shrink: 0;
        }
        .ct-promise {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 8px;
          border-right: 1px solid var(--border-subtle);
        }
        .ct-promise:last-child { border-right: none; }
        .ct-promise__icon { font-size: 0.9rem; flex-shrink: 0; }
        .ct-promise__text {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-family: var(--font-body);
          white-space: nowrap;
        }

        /* Tabs */
        .ct-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          flex-shrink: 0;
          padding: 0 24px;
        }
        .ct-tab {
          padding: 11px 18px;
          font-family: var(--font-display);
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
          margin-bottom: -1px;
          white-space: nowrap;
        }
        .ct-tab:hover { color: var(--text-primary); }
        .ct-tab--active { color: var(--accent); border-bottom-color: var(--accent); }

        /* Body */
        .ct-body {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        /* Form wrap */
        .ct-form-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--border-medium) transparent;
        }

        /* Native form */
        .ct-native-form {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Row (side by side) */
        .ct-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Field */
        .ct-field { display: flex; flex-direction: column; gap: 6px; }
        .ct-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .ct-required { color: var(--accent); }
        .ct-optional { color: var(--text-muted); font-weight: 400; text-transform: none; letter-spacing: 0; font-size: 0.7rem; }

        /* Inputs */
        .ct-input, .ct-textarea {
          width: 100%;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.875rem;
          font-family: var(--font-body);
          outline: none;
          box-sizing: border-box;
          transition: border-color var(--transition-fast);
        }
        .ct-input:focus, .ct-textarea:focus { border-color: var(--accent); }
        .ct-textarea { resize: vertical; }
        .ct-input::placeholder, .ct-textarea::placeholder { color: var(--text-muted); }

        /* Type selector */
        .ct-type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }
        .ct-type-btn {
          padding: 9px 8px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 0.78rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: center;
          font-family: var(--font-body);
          line-height: 1.4;
        }
        .ct-type-btn:hover { border-color: var(--accent); color: var(--text-primary); }
        .ct-type-btn--active {
          border-color: var(--accent);
          background: rgba(99,102,241,0.12);
          color: var(--accent);
          font-weight: 600;
        }

        /* Star rating */
        .ct-rating {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ct-star {
          background: none;
          border: none;
          font-size: 1.8rem;
          cursor: pointer;
          color: var(--border-medium);
          transition: color var(--transition-fast), transform var(--transition-fast);
          padding: 0 2px;
          line-height: 1;
        }
        .ct-star:hover, .ct-star--active { color: #f59e0b; }
        .ct-star:hover { transform: scale(1.15); }
        .ct-rating__label {
          font-size: 0.78rem;
          color: #f59e0b;
          font-weight: 600;
          margin-left: 6px;
          font-family: var(--font-display);
        }

        /* Submit button */
        .ct-submit-btn {
          align-self: flex-end;
          padding: 10px 28px;
          border-radius: var(--radius-md);
          background: var(--accent);
          color: white;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.875rem;
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .ct-submit-btn:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); }
        .ct-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* Error */
        .ct-error { color: #ef4444; font-size: 0.8rem; margin: 0; }

        /* Success state */
        .ct-success {
          flex: 1;
          padding: 50px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .ct-success__icon { font-size: 3rem; }
        .ct-success__title {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }
        .ct-success__sub {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0 0 8px;
        }

        /* Channels tab */
        .ct-channels {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          scrollbar-width: thin;
          scrollbar-color: var(--border-medium) transparent;
        }
        .ct-channels__intro {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.6;
        }
        .ct-channel-list { display: flex; flex-direction: column; gap: 8px; }
        .ct-channel {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: all var(--transition-fast);
          position: relative;
        }
        .ct-channel:hover { border-color: var(--accent); background: var(--bg-tertiary); }
        .ct-channel:hover .ct-channel__label { color: var(--accent); }
        .ct-channel__icon { font-size: 1.4rem; flex-shrink: 0; width: 32px; text-align: center; }
        .ct-channel__body { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .ct-channel__label {
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          transition: color var(--transition-fast);
        }
        .ct-channel__value {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--accent);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ct-channel__desc { font-size: 0.68rem; color: var(--text-muted); line-height: 1.4; }
        .ct-channel__arrow {
          font-size: 0.75rem;
          color: var(--text-muted);
          flex-shrink: 0;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        .ct-channel:hover .ct-channel__arrow { opacity: 1; }

        /* Bug report guide */
        .ct-report-guide {
          padding: 16px 18px;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: var(--radius-md);
        }
        .ct-report-guide__heading {
          font-family: var(--font-display);
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 10px;
        }
        .ct-report-guide__list {
          font-size: 0.76rem;
          color: var(--text-muted);
          line-height: 1.9;
          margin: 0;
          padding-left: 18px;
        }

        /* Footer */
        .ct-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          flex-shrink: 0;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ct-footer__note {
          font-size: 0.7rem;
          color: var(--text-muted);
          flex: 1;
          line-height: 1.4;
        }
        .ct-footer__btn {
          padding: 8px 22px;
          border-radius: var(--radius-md);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-medium);
          color: var(--text-secondary);
          font-size: 0.82rem;
          font-family: var(--font-display);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }
        .ct-footer__btn:hover {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
        }

        /* Responsive */
        @media (max-width: 520px) {
          .ct-panel   { max-height: 95vh; border-radius: var(--radius-lg); }
          .ct-header,
          .ct-tabs,
          .ct-channels,
          .ct-footer  { padding-left: 16px; padding-right: 16px; }
          .ct-native-form { padding: 16px; }
          .ct-promise__text { display: none; }
          .ct-promise { padding: 8px 6px; }
          .ct-row { grid-template-columns: 1fr; }
          .ct-type-grid { grid-template-columns: 1fr 1fr; }
          .ct-submit-btn { align-self: stretch; }
        }
      `}</style>
    </div>
  );
});

export default ContactModal;