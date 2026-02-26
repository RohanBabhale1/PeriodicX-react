import { memo, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";

const AboutModal = lazy(() => import("../modal/AboutModal"));
const ContactModal = lazy(() => import("../modal/ContactModal"));

// ── Category stats ticker ─────────────────────────────────
const CATEGORY_STATS = [
  { label: "Alkali Metals", count: 6, color: "#ef4444" },
  { label: "Alkaline Earth Metals", count: 6, color: "#f97316" },
  { label: "Transition Metals", count: 38, color: "#eab308" },
  { label: "Post-Transition Metals", count: 7, color: "#84cc16" },
  { label: "Metalloids", count: 7, color: "#22c55e" },
  { label: "Nonmetals", count: 7, color: "#06b6d4" },
  { label: "Halogens", count: 5, color: "#3b82f6" },
  { label: "Noble Gases", count: 7, color: "#8b5cf6" },
  { label: "Lanthanides", count: 15, color: "#ec4899" },
  { label: "Actinides", count: 15, color: "#f43f5e" },
];

// ── Explore — internal links ──────────────────────────────
const EXPLORE_LINKS = [
  { label: "Periodic Table", to: "/" },
  { label: "Compare Elements", to: "/compare" },
  { label: "Element Quiz", to: "/quiz" },
];

// ── Learn — verified external resources ───────────────────
const LEARN_LINKS = [
  {
    label: "Atomic Structure",
    sub: "LibreTexts Chemistry",
    href: "https://chem.libretexts.org/Courses/Bennington_College/Chemistry_-_An_Integrated_Approach_(Bullock)/03%3A_Why_Do_Molecules_Exist/3.02%3A_Atomic_Structure",
  },
  {
    label: "Periodic Trends",
    sub: "LibreTexts Chemistry",
    href: "https://chem.libretexts.org/Bookshelves/General_Chemistry/Map%3A_General_Chemistry_(Petrucci_et_al.)/09%3A_The_Periodic_Table_and_Some_Atomic_Properties",
  },
  {
    label: "Electron Configuration",
    sub: "LibreTexts Chemistry",
    href: "https://chem.libretexts.org/Courses/Oregon_Institute_of_Technology/OIT%3A_CHE_202_-_General_Chemistry_II/Unit_3%3A_Periodic_Patterns/3.1%3A_Electron_Configurations",
  },
  {
    label: "Chemical Bonding",
    sub: "LibreTexts Chemistry",
    href: "https://chem.libretexts.org/Bookshelves/General_Chemistry/Map%3A_General_Chemistry_(Petrucci_et_al.)/10%3A_Chemical_Bonding_I%3A_Basic_Concepts",
  },
  {
    label: "Oxidation States",
    sub: "Wikipedia",
    href: "https://en.wikipedia.org/wiki/Oxidation_state",
  },
  {
    label: "Nuclear Chemistry",
    sub: "Wikipedia",
    href: "https://en.wikipedia.org/wiki/Nuclear_chemistry",
  },
];

const DATA_SOURCES = [
  {
    name: "IUPAC",
    desc: "Atomic weights & nomenclature",
    href: "https://iupac.org",
  },
  {
    name: "NIST",
    desc: "Physical & chemical properties",
    href: "https://nist.gov",
  },
  {
    name: "Wikipedia",
    desc: "Element descriptions & history",
    href: "https://wikipedia.org",
  },
];

const FACTS = [
  { value: "118", label: "Elements" },
  { value: "7", label: "Periods" },
  { value: "18", label: "Groups" },
  { value: "4", label: "Blocks" },
  { value: "94", label: "Natural" },
  { value: "24", label: "Synthetic" },
];


const DIVIDER_SYMS = [
  "H",
  "He",
  "Li",
  "Be",
  "B",
  "C",
  "N",
  "O",
  "F",
  "Ne",
  "Na",
  "Mg",
  "Al",
  "Si",
  "P",
  "S",
  "Cl",
  "Ar",
];

const Footer = memo(function Footer() {
  const year = new Date().getFullYear();
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);

  return (
    <footer className="ft" role="contentinfo" aria-label="Site footer">

      <div className="ft-ticker" aria-label="Element category counts">
        <div className="ft-ticker__track">
          {CATEGORY_STATS.map((cat) => (
            <div key={cat.label} className="ft-ticker__item">
              <span
                className="ft-ticker__dot"
                style={{ background: cat.color }}
                aria-hidden="true"
              />
              <span className="ft-ticker__count" style={{ color: cat.color }}>
                {cat.count}
              </span>
              <span className="ft-ticker__label">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ft-main">
        <div className="ft-main__inner">
          {/* ── Brand column ──────────────────────────── */}
          <div className="ft-brand">
            <Link
              to="/"
              className="ft-brand__wordmark"
              aria-label="PeriodicX home"
            >
              <span className="ft-brand__logo" aria-hidden="true">
                Px
              </span>
              <span className="ft-brand__name">PeriodicX</span>
            </Link>

            <p className="ft-brand__tagline">
              Interactive periodic table for students, educators, and anyone
              curious about the elements.
            </p>

            {/* 3 × 2 facts grid */}
            <div className="ft-facts" aria-label="Periodic table statistics">
              {FACTS.map((f) => (
                <div key={f.label} className="ft-fact">
                  <span className="ft-fact__value">{f.value}</span>
                  <span className="ft-fact__label">{f.label}</span>
                </div>
              ))}
            </div>

            {/* ChemBot callout */}
            <div className="ft-chembot">
              <span className="ft-chembot__pulse" aria-hidden="true" />
              <span className="ft-chembot__icon" aria-hidden="true">
                🧪
              </span>
              <div className="ft-chembot__copy">
                <strong className="ft-chembot__title">ChemBot is live</strong>
                <span className="ft-chembot__sub">
                  Ask anything about elements
                </span>
              </div>
              <span className="ft-chembot__badge">Free</span>
            </div>
          </div>

          {/* ── Nav columns ───────────────────────────── */}
          <nav className="ft-nav" aria-label="Footer navigation">
            {/* Explore */}
            <div className="ft-col">
              <h3 className="ft-col__heading">Explore</h3>
              <ul className="ft-col__list" role="list">
                {EXPLORE_LINKS.map((lnk) => (
                  <li key={lnk.label}>
                    <Link to={lnk.to} className="ft-link ft-link--internal">
                      {lnk.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    className="ft-link ft-link--internal ft-link--btn"
                    onClick={() => setShowAbout(true)}
                    aria-haspopup="dialog"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    className="ft-link ft-link--internal ft-link--btn"
                    onClick={() => setShowContact(true)}
                    aria-haspopup="dialog"
                  >
                    Contact & Feedback
                  </button>
                </li>
              </ul>
            </div>

            {/* Learn */}
            <div className="ft-col">
              <h3 className="ft-col__heading">
                Learn
                <span className="ft-col__ext-badge" aria-label="External links">
                  ↗
                </span>
              </h3>
              <ul className="ft-col__list" role="list">
                {LEARN_LINKS.map((lnk) => (
                  <li key={lnk.label}>
                    <a
                      href={lnk.href}
                      className="ft-link ft-link--learn"
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`${lnk.label} on ${lnk.sub} (opens in new tab)`}
                    >
                      <span className="ft-link__learn-title">{lnk.label}</span>
                      <span className="ft-link__learn-src">{lnk.sub}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Data Sources */}
            <div className="ft-col">
              <h3 className="ft-col__heading">
                Data Sources
                <span className="ft-col__ext-badge" aria-label="External links">
                  ↗
                </span>
              </h3>
              <ul className="ft-col__list" role="list">
                {DATA_SOURCES.map((src) => (
                  <li key={src.name}>
                    <a
                      href={src.href}
                      className="ft-link ft-link--source"
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`${src.name} — ${src.desc} (opens in new tab)`}
                    >
                      <span className="ft-link__src-name">{src.name}</span>
                      <span className="ft-link__src-desc">{src.desc}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>

      <div className="ft-sym-row" aria-hidden="true">
        <div className="ft-sym-row__inner">
          {DIVIDER_SYMS.map((sym) => (
            <span key={sym} className="ft-sym">
              {sym}
            </span>
          ))}
        </div>
      </div>


      <div className="ft-bar">
        <div className="ft-bar__inner">
          <div className="ft-bar__left">
            <span className="ft-bar__text">© {year} PeriodicX</span>
            <span className="ft-bar__sep" aria-hidden="true">
              ·
            </span>
            <span className="ft-bar__text">Atomic data per IUPAC 2021</span>
            <span className="ft-bar__sep" aria-hidden="true">
              ·
            </span>
            <span className="ft-bar__text">
              Open source for science education
            </span>
            <span className="ft-bar__sep" aria-hidden="true">
              ·
            </span>
            <button
              className="ft-bar__modal-btn"
              onClick={() => setShowAbout(true)}
              aria-haspopup="dialog"
            >
              About
            </button>
            <span className="ft-bar__sep" aria-hidden="true">
              ·
            </span>
            <button
              className="ft-bar__modal-btn"
              onClick={() => setShowContact(true)}
              aria-haspopup="dialog"
            >
              Contact
            </button>
          </div>

          <div className="ft-bar__right">
            {["React 18", "Vite", "CSS"].map((t) => (
              <span key={t} className="ft-tech-tag">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`

        /* ─── Shell ──────────────────────────────── */
        .ft {
          margin-top: auto;
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          position: relative;
        }

        .ft::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 70% 50% at 0% 110%,  rgba(59,130,246,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 100% -10%, rgba(139,92,246,0.04) 0%, transparent 60%);
        }

        /* ─── Section 1 · Ticker ─────────────────── */
        .ft-ticker {
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-tertiary);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .ft-ticker::-webkit-scrollbar { display: none; }

        .ft-ticker__track {
          display: flex;
          align-items: stretch;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .ft-ticker__item {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 11px 18px;
          border-right: 1px solid var(--border-subtle);
          white-space: nowrap;
          flex-shrink: 0;
          transition: background var(--transition-fast);
          cursor: default;
        }
        .ft-ticker__item:first-child { padding-left: 0; }
        .ft-ticker__item:last-child  { border-right: none; }
        .ft-ticker__item:hover       { background: rgba(255,255,255,0.02); }

        .ft-ticker__dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .ft-ticker__count {
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 800;
          line-height: 1;
        }
        .ft-ticker__label {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        /* ─── Section 2 · Main body ──────────────── */
        .ft-main { padding: 52px 0 44px; position: relative; }

        .ft-main__inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 80px;
          align-items: start;
        }

        /* Brand */
        .ft-brand {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .ft-brand__wordmark {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          text-decoration: none;
          width: fit-content;
        }

        .ft-brand__logo {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 9px;
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
          box-shadow: 0 4px 14px rgba(59,130,246,0.35);
          flex-shrink: 0;
          transition: box-shadow var(--transition-fast), transform var(--transition-fast);
        }
        .ft-brand__wordmark:hover .ft-brand__logo {
          box-shadow: 0 6px 22px rgba(59,130,246,0.5);
          transform: translateY(-1px);
        }

        .ft-brand__name {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.025em;
        }

        .ft-brand__tagline {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.7;
          max-width: 280px;
        }

        /* Facts grid */
        .ft-facts {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--border-subtle);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .ft-fact {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 12px 8px;
          background: var(--bg-tertiary);
          transition: background var(--transition-fast);
          cursor: default;
        }
        .ft-fact:hover { background: var(--bg-secondary); }

        .ft-fact__value {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--accent);
          line-height: 1;
        }
        .ft-fact__label {
          font-size: 0.57rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: center;
        }

        /* ChemBot callout */
        .ft-chembot {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 15px;
          background: linear-gradient(135deg,
            rgba(6,182,212,0.07),
            rgba(59,130,246,0.05)
          );
          border: 1px solid rgba(6,182,212,0.18);
          border-radius: var(--radius-md);
          position: relative;
          overflow: hidden;
        }

        .ft-chembot::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent,
            rgba(6,182,212,0.4),
            transparent
          );
        }

        .ft-chembot__pulse {
          position: absolute;
          top: 13px; left: 14px;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #22c55e;
          opacity: 0.5;
          animation: pulse-ring 2s ease-out infinite;
        }

        .ft-chembot__icon {
          font-size: 1.25rem;
          flex-shrink: 0;
          margin-left: 10px;
        }

        .ft-chembot__copy {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .ft-chembot__title {
          font-family: var(--font-display);
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .ft-chembot__sub {
          font-size: 0.68rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .ft-chembot__badge {
          flex-shrink: 0;
          font-family: var(--font-display);
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #22c55e;
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.28);
          padding: 3px 9px;
          border-radius: 999px;
        }

        /* Nav grid — 3 equal columns */
        .ft-nav {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          align-items: start;
        }

        .ft-col { display: flex; flex-direction: column; gap: 14px; }

        .ft-col__heading {
          font-family: var(--font-display);
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.11em;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 6px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .ft-col__ext-badge {
          font-size: 0.6rem;
          color: var(--text-muted);
          font-weight: 400;
          letter-spacing: 0;
          opacity: 0.65;
          font-style: normal;
        }

        .ft-col__list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        /* ── Link variants ─────────────────────────── */

        /* Base */
        .ft-link {
          display: block;
          text-decoration: none;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        /* Internal — text with left accent bar on hover */
        .ft-link--internal {
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text-muted);
          padding: 5px 10px 5px 14px;
          position: relative;
        }
        .ft-link--internal::before {
          content: '';
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%) scaleY(0);
          width: 2px; height: 16px;
          background: var(--accent);
          border-radius: 1px;
          transition: transform var(--transition-fast);
        }
        .ft-link--internal:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }
        .ft-link--internal:hover::before {
          transform: translateY(-50%) scaleY(1);
        }

        /* Learn — two-line with source name */
        .ft-link--learn {
          padding: 7px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          border: 1px solid transparent;
        }
        .ft-link--learn:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-subtle);
        }
        .ft-link--learn:hover .ft-link__learn-title {
          color: var(--accent);
        }

        .ft-link__learn-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: color var(--transition-fast);
          line-height: 1.3;
        }
        .ft-link__learn-src {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-style: italic;
        }

        /* Data source — card with ↗ on hover */
        .ft-link--source {
          padding: 9px 11px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-tertiary);
          position: relative;
        }
        .ft-link--source::after {
          content: '↗';
          position: absolute;
          top: 9px; right: 10px;
          font-size: 0.6rem;
          color: var(--text-muted);
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        .ft-link--source:hover {
          border-color: var(--accent);
          background: var(--bg-secondary);
        }
        .ft-link--source:hover::after { opacity: 1; }
        .ft-link--source:hover .ft-link__src-name { color: var(--accent); }

        .ft-link__src-name {
          font-family: var(--font-display);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          transition: color var(--transition-fast);
        }
        .ft-link__src-desc {
          font-size: 0.65rem;
          color: var(--text-muted);
          line-height: 1.3;
        }

        /* ─── Section 3 · Symbol row ─────────────── */
        .ft-sym-row {
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-tertiary);
        }

        .ft-sym-row__inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          height: 38px;
        }

        .ft-sym {
          flex: 1;
          text-align: center;
          font-family: var(--font-display);
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--border-medium);
          letter-spacing: 0.04em;
          transition: color var(--transition-fast);
          cursor: default;
          user-select: none;
        }
        .ft-sym:hover { color: var(--accent); }

        /* ─── Section 4 · Bottom bar ─────────────── */
        .ft-bar { padding: 13px 0; }

        .ft-bar__inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .ft-bar__left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .ft-bar__text {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .ft-bar__sep {
          font-size: 0.7rem;
          color: var(--border-medium);
        }

        .ft-bar__right {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .ft-tech-tag {
          font-family: var(--font-mono);
          font-size: 0.58rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-subtle);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          letter-spacing: 0.04em;
        }

        /* ─── Responsive ──────────────────────────── */

        @media (max-width: 1280px) {
          .ft-main__inner {
            grid-template-columns: 300px 1fr;
            gap: 60px;
          }
        }

        @media (max-width: 1024px) {
          .ft-main__inner {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .ft-brand__tagline { max-width: 480px; }
          .ft-facts          { max-width: 360px; }
          .ft-chembot        { max-width: 440px; }
          .ft-nav            { grid-template-columns: repeat(3, 1fr); gap: 28px; }
        }

        @media (max-width: 768px) {
          .ft-main           { padding: 36px 0 32px; }
          .ft-nav            { grid-template-columns: 1fr 1fr; gap: 24px; }
          .ft-ticker__label  { display: none; }
          .ft-ticker__item   { padding: 9px 12px; }
          .ft-bar__inner     { flex-direction: column; align-items: flex-start; gap: 6px; }
          .ft-bar__sep:last-of-type,
          .ft-bar__text:last-of-type { display: none; }
          .ft-bar__right     { display: none; }
        }

        @media (max-width: 480px) {
          .ft-main                     { padding: 28px 0 24px; }
          .ft-main__inner,
          .ft-ticker__track,
          .ft-sym-row__inner,
          .ft-bar__inner               { padding: 0 16px; }
          .ft-nav                      { grid-template-columns: 1fr 1fr; gap: 18px; }
          .ft-facts                    { max-width: 100%; }
          .ft-sym:nth-child(n+13)      { display: none; }
        }
        /* Button-style nav links (About, Contact) */
        .ft-link--btn {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
        }

        /* Bottom bar modal buttons */
        .ft-bar__modal-btn {
          font-size: 0.7rem;
          color: var(--text-muted);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: var(--font-body);
          transition: color var(--transition-fast);
        }
        .ft-bar__modal-btn:hover { color: var(--accent); }

      `}</style>

      {/* ── Modals ───────────────────────────────────────── */}
      <Suspense fallback={null}>
        {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
        {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      </Suspense>
    </footer>
  );
});

export default Footer;
