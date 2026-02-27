import { Suspense, lazy, useCallback } from 'react';
import { useElements } from '../context/ElementContext';

const ElementSelector = lazy(() => import('../components/comparison/ElementSelector'));
const ComparisonTable = lazy(() => import('../components/comparison/ComparisonTable'));

export default function ComparePage() {
  const { comparisonElements, setComparisonSlot, clearComparison } = useElements();
  const [elementA, elementB] = comparisonElements;
  const handleSelect = useCallback((slot, el) => setComparisonSlot(slot, el), [setComparisonSlot]);

  return (
    <main className="compare-page" role="main">
      <div className="compare-page__container">
        <section className="compare-hero animate-slideUp">
          <div>
            <h1 className="compare-hero__title"><span className="compare-hero__accent">Compare</span> Elements</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 480, lineHeight: 1.6, marginTop: 8 }}>Select two elements to view their properties side by side. Higher numeric values are highlighted.</p>
          </div>
          {(elementA || elementB) && (
            <button onClick={clearComparison} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid #ef444440', background: '#ef444415', color: '#ef4444', fontSize: '0.78rem', fontFamily: 'var(--font-body)', fontWeight: 500, cursor: 'pointer', transition: 'all var(--transition-fast)' }}>
              ✕ Clear
            </button>
          )}
        </section>

        <div className="compare-selectors">
          <Suspense fallback={<div style={{ height: 120, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }} />}>
            {/* excludeElement = elementB so slot A can't pick what's already in slot B */}
            <ElementSelector slot={0} selectedElement={elementA} onSelect={handleSelect} excludeElement={elementB} />
          </Suspense>
          <div className="compare-vs" aria-hidden="true">VS</div>
          <Suspense fallback={<div style={{ height: 120, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }} />}>
            {/* excludeElement = elementA so slot B can't pick what's already in slot A */}
            <ElementSelector slot={1} selectedElement={elementB} onSelect={handleSelect} excludeElement={elementA} />
          </Suspense>
        </div>

        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>}>
          <ComparisonTable elementA={elementA} elementB={elementB} />
        </Suspense>
      </div>
      <style>{`
        .compare-page { flex: 1; padding: 0 0 60px; }
        .compare-page__container { max-width: 960px; margin: 0 auto; padding: 0 20px; display: flex; flex-direction: column; gap: 24px; }
        .compare-hero { padding: 28px 0 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .compare-hero__title { font-family: var(--font-display); font-size: clamp(1.6rem,4vw,2.4rem); font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; line-height: 1; }
        .compare-hero__accent { background: linear-gradient(135deg,#22d3ee,#3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .compare-selectors { display: grid; grid-template-columns: 1fr auto 1fr; align-items: start; gap: 16px; }
        .compare-vs { display: flex; align-items: center; justify-content: center; height: 42px; font-family: var(--font-display); font-size: 0.8rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.1em; margin-top: 28px; }
        .spinner { width: 32px; height: 32px; border: 3px solid var(--border-medium); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) { .compare-selectors { grid-template-columns: 1fr 1fr; } .compare-vs { display: none; } }
      `}</style>
    </main>
  );
}