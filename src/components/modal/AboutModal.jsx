import { memo, useEffect, useCallback } from "react";

const FEATURES = [
  {
    icon: "⚛",
    title: "All 118 Elements",
    desc: "Complete data for every element — atomic mass, electron configuration, discovery history, physical properties and more.",
  },
  {
    icon: "🔬",
    title: "Orbital Diagrams",
    desc: "Visualise electron configurations with interactive Aufbau orbital box diagrams using Hund's rule.",
  },
  {
    icon: "🌐",
    title: "3D Atomic Model",
    desc: "Animated CSS Bohr models showing electron shells orbiting the nucleus — zero dependencies, runs in any browser.",
  },
  {
    icon: "⚖",
    title: "Element Compare",
    desc: "Side-by-side comparison of any two elements across 15+ properties with visual difference indicators.",
  },
  {
    icon: "🧪",
    title: "Quiz Mode",
    desc: "4 quiz types with streak tracking, animated score rings, and full answer review to test your knowledge.",
  },
  {
    icon: "🤖",
    title: "ChemBot",
    desc: "Free built-in chemistry assistant. Ask anything about elements, periodic trends or concepts",
  },
];

const TECH = [
  { name: "React 18", role: "UI framework" },
  { name: "Vite", role: "Build tool" },
  { name: "CSS vars", role: "Theming & design" },
  { name: "IUPAC", role: "Atomic data source" },
  { name: "Grok", role: "ChemBot fallback" },

];

const STATS = [
  { value: "118", label: "Elements" },
  { value: "15+", label: "Properties each" },
  { value: "4", label: "Quiz modes" },
  { value: "0", label: "Cost to use" },
];

const AboutModal = memo(function AboutModal({ onClose }) {

  const handleKey = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  return (
    <div
      className="abt-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="About PeriodicX"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="abt-panel animate-scaleIn">
        {/* ── Header ───────────────────────────────── */}
        <div className="abt-header">
          <div className="abt-header__brand">
            <span className="abt-logo" aria-hidden="true">
              Px
            </span>
            <div>
              <h2 className="abt-title">About PeriodicX</h2>
              <p className="abt-subtitle">
                Interactive Periodic Table of Elements
              </p>
            </div>
          </div>
          <button
            className="abt-close"
            onClick={onClose}
            aria-label="Close About modal"
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable body ───────────────────────── */}
        <div className="abt-body">
          {/* Mission */}
          <section className="abt-section" aria-labelledby="abt-mission">
            <h3 className="abt-section__heading" id="abt-mission">
              Our Mission
            </h3>
            <p className="abt-prose">
              PeriodicX was built with a single goal — make chemistry accessible
              to everyone. Whether you're a student cramming for an exam, a
              teacher looking for a classroom tool, or simply curious about the
              matter that makes up the universe, PeriodicX gives you a
              beautiful, data-rich window into the periodic table.
            </p>
            <p className="abt-prose">
              Every feature is free, every tool works without an account, and
              the entire project runs with zero external UI dependencies — just
              React, CSS, and publicly available scientific data.
            </p>
          </section>

          {/* Stats row */}
          <div className="abt-stats" aria-label="Key statistics">
            {STATS.map((s) => (
              <div key={s.label} className="abt-stat">
                <span className="abt-stat__value">{s.value}</span>
                <span className="abt-stat__label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Features */}
          <section className="abt-section" aria-labelledby="abt-features">
            <h3 className="abt-section__heading" id="abt-features">
              What's Inside
            </h3>
            <div className="abt-features">
              {FEATURES.map((f) => (
                <div key={f.title} className="abt-feature">
                  <span className="abt-feature__icon" aria-hidden="true">
                    {f.icon}
                  </span>
                  <div>
                    <p className="abt-feature__title">{f.title}</p>
                    <p className="abt-feature__desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tech stack */}
          <section className="abt-section" aria-labelledby="abt-tech">
            <h3 className="abt-section__heading" id="abt-tech">
              Built With
            </h3>
            <div className="abt-tech-grid">
              {TECH.map((t) => (
                <div key={t.name} className="abt-tech-item">
                  <span className="abt-tech-item__name">{t.name}</span>
                  <span className="abt-tech-item__role">{t.role}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Data attribution */}
          <section className="abt-section" aria-labelledby="abt-data">
            <h3 className="abt-section__heading" id="abt-data">
              Data & Attribution
            </h3>
            <p className="abt-prose">
              All atomic weights and element names follow{" "}
              <a
                href="https://iupac.org"
                target="_blank"
                rel="noreferrer"
                className="abt-link"
              >
                IUPAC recommendations
              </a>
              . Physical property data is sourced from{" "}
              <a
                href="https://nist.gov"
                target="_blank"
                rel="noreferrer"
                className="abt-link"
              >
                NIST
              </a>{" "}
              
              
              . Element descriptions and historical facts draw from{" "}
              <a
                href="https://wikipedia.org"
                target="_blank"
                rel="noreferrer"
                className="abt-link"
              >
                Wikipedia
              </a>{" "}
              under the Creative Commons licence.
            </p>
          </section>

          {/* Open source note */}
          <div className="abt-oss-banner">
            <span className="abt-oss-banner__icon" aria-hidden="true">
              🔓
            </span>
            <div>
              <p className="abt-oss-banner__title">Free & Open Source</p>
              <p className="abt-oss-banner__sub">
                PeriodicX is free for students, educators and science
                enthusiasts worldwide — no ads, no paywalls, no tracking.
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────── */}
        <div className="abt-footer">
          <span className="abt-footer__copy">
            © {new Date().getFullYear()} PeriodicX · Built with ❤ for science
            education
          </span>
          <button className="abt-footer__btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <style>{`
        /* Overlay */
        .abt-overlay {
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
        .abt-panel {
          width: 100%;
          max-width: 680px;
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
        .abt-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 24px 20px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          flex-shrink: 0;
        }

        .abt-header__brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .abt-logo {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
          box-shadow: 0 4px 14px rgba(59,130,246,0.4);
          flex-shrink: 0;
        }

        .abt-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }

        .abt-subtitle {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin: 2px 0 0;
        }

        .abt-close {
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
        .abt-close:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border-color: var(--border-medium);
        }

        /* Scrollable body */
        .abt-body {
          flex: 1;
          overflow-y: auto;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          scrollbar-width: thin;
          scrollbar-color: var(--border-medium) transparent;
        }

        /* Section */
        .abt-section { display: flex; flex-direction: column; gap: 12px; }

        .abt-section__heading {
          font-family: var(--font-display);
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-subtle);
          margin: 0;
        }

        .abt-prose {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.75;
          margin: 0;
        }

        .abt-link {
          color: var(--accent);
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: opacity var(--transition-fast);
        }
        .abt-link:hover { opacity: 0.75; }

        /* Stats */
        .abt-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--border-subtle);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .abt-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 16px 8px;
          background: var(--bg-secondary);
        }

        .abt-stat__value {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--accent);
          line-height: 1;
        }

        .abt-stat__label {
          font-size: 0.62rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: center;
        }

        /* Features grid */
        .abt-features {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .abt-feature {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          transition: all var(--transition-fast);
        }
        .abt-feature:hover {
          background: var(--bg-secondary);
          border-color: var(--border-subtle);
        }

        .abt-feature__icon {
          font-size: 1.3rem;
          flex-shrink: 0;
          width: 28px;
          text-align: center;
          margin-top: 1px;
        }

        .abt-feature__title {
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 3px;
        }

        .abt-feature__desc {
          font-size: 0.77rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0;
        }

        /* Tech grid */
        .abt-tech-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .abt-tech-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 10px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .abt-tech-item__name {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--accent);
        }

        .abt-tech-item__role {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        /* OSS banner */
        .abt-oss-banner {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 18px;
          background: linear-gradient(135deg,
            rgba(59,130,246,0.07),
            rgba(139,92,246,0.05)
          );
          border: 1px solid rgba(59,130,246,0.18);
          border-radius: var(--radius-md);
        }

        .abt-oss-banner__icon { font-size: 1.4rem; flex-shrink: 0; }

        .abt-oss-banner__title {
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px;
        }

        .abt-oss-banner__sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.55;
          margin: 0;
        }

        /* Footer */
        .abt-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          flex-shrink: 0;
          gap: 12px;
          flex-wrap: wrap;
        }

        .abt-footer__copy {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .abt-footer__btn {
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
        }
        .abt-footer__btn:hover {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
        }

        /* Responsive */
        @media (max-width: 520px) {
          .abt-panel { max-height: 95vh; border-radius: var(--radius-lg); }
          .abt-header, .abt-body, .abt-footer { padding-left: 16px; padding-right: 16px; }
          .abt-stats { grid-template-columns: repeat(2, 1fr); }
          .abt-tech-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
});

export default AboutModal;
