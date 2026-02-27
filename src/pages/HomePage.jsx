import { useState, useCallback, useMemo, Suspense, lazy } from 'react';
import { useElements } from '../context/ElementContext';
import useSearch from '../hooks/useSearch';
import useFilters from '../hooks/useFilters';

const PeriodicTable = lazy(() => import('../components/periodic-table/PeriodicTable'));
const LegendBar     = lazy(() => import('../components/periodic-table/LegendBar'));
const SearchBar     = lazy(() => import('../components/search/SearchBar'));
const FilterPanel   = lazy(() => import('../components/search/FilterPanel'));
const ElementModal  = lazy(() => import('../components/modal/ElementModal'));

function TableSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(18,1fr)', gap: 4, width: '100%' }}>
      {Array.from({ length: 90 }).map((_, i) => (
        <div key={i} style={{ aspectRatio: 1, borderRadius: 6, background: 'linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%)', backgroundSize: '200% 100%', animation: `shimmer 1.5s ${i*8}ms infinite` }} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { elements, searchQuery } = useElements();
  const [filterOpen, setFilterOpen] = useState(false);

  const matchedNumbers = useSearch(elements, searchQuery);
  const { filters, filteredNumbers, isFilterActive, toggleFilter, setRadioactive, resetFilters } = useFilters(elements);

  // Merge: intersection of search + filter if both active
  const activeNumbers = useMemo(() => {
    if (!matchedNumbers && !filteredNumbers) return null;
    if (matchedNumbers && filteredNumbers)
      return new Set([...matchedNumbers].filter(n => filteredNumbers.has(n)));
    return matchedNumbers ?? filteredNumbers;
  }, [matchedNumbers, filteredNumbers]);

  const resultCount = useMemo(() =>
    activeNumbers ? activeNumbers.size : elements.length,
  [activeNumbers, elements.length]);

  const handleLegendToggle = useCallback((cat) => toggleFilter('categories', cat), [toggleFilter]);

  return (
    <main className="home-page" role="main">
      <div className="home-page__container">
        <section className="hero animate-slideUp">
          <div className="hero__content">
            <h1 className="hero__title"><span className="hero__title-accent">Periodic</span>Table</h1>
            <p className="hero__subtitle">All 118 elements. Click any element for full details, trends, and properties.</p>
          </div>
          <div className="hero__controls">
            <Suspense fallback={<div style={{ height: 42, width: 480, background: 'var(--bg-tertiary)', borderRadius: 10 }} />}>
              <SearchBar resultCount={resultCount} />
            </Suspense>
            <button
              className={`filter-toggle-btn ${isFilterActive ? 'filter-toggle-btn--active' : ''}`}
              onClick={() => setFilterOpen(o => !o)}
              aria-expanded={filterOpen}
              aria-label="Toggle filters"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              Filters
              {isFilterActive && <span className="filter-active-dot" />}
            </button>
          </div>
          {filterOpen && (
            <div style={{ maxWidth: 700 }}>
              <Suspense fallback={null}>
                <FilterPanel filters={filters} toggleFilter={toggleFilter} setRadioactive={setRadioactive} resetFilters={resetFilters} isFilterActive={isFilterActive} isOpen={filterOpen} onClose={() => setFilterOpen(false)} />
              </Suspense>
            </div>
          )}
        </section>

        <Suspense fallback={null}>
          <LegendBar activeCategories={filters.categories} onToggleCategory={handleLegendToggle} />
        </Suspense>

        {activeNumbers && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', fontSize: '0.78rem', color: 'var(--text-muted)' }} role="status" aria-live="polite">
            <span><strong style={{ color: 'var(--accent)' }}>{resultCount}</strong> of {elements.length} elements match</span>
            {(isFilterActive || searchQuery) && (
              <button onClick={resetFilters} style={{ fontSize: '0.72rem', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', padding: '2px 8px', cursor: 'pointer', background: 'transparent', fontFamily: 'var(--font-body)' }}>Clear filters</button>
            )}
          </div>
        )}

        <div className="table-scroll-wrapper">
          <Suspense fallback={<TableSkeleton />}>
            <PeriodicTable elements={elements} matchedNumbers={matchedNumbers} filteredNumbers={filteredNumbers} />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={null}><ElementModal /></Suspense>

      <style>{`
        .home-page { flex: 1; padding: 0 0 40px; }
        .home-page__container { max-width: 1600px; margin: 0 auto; padding: 0 20px; display: flex; flex-direction: column; gap: 4px; }
        .hero { padding: 28px 0 12px; display: flex; flex-direction: column; gap: 16px; }
        .hero__content { display: flex; align-items: baseline; gap: 20px; flex-wrap: wrap; }
        .hero__title { font-family: var(--font-display); font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; line-height: 1; }
        .hero__title-accent { background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero__subtitle { font-size: 0.875rem; color: var(--text-muted); max-width: 420px; line-height: 1.5; }
        .hero__controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .filter-toggle-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0 14px; height: 42px; border-radius: var(--radius-md); border: 1px solid var(--border-medium); background: var(--bg-secondary); color: var(--text-secondary); font-size: 0.82rem; font-family: var(--font-body); font-weight: 500; cursor: pointer; transition: all var(--transition-fast); position: relative; white-space: nowrap; }
        .filter-toggle-btn:hover, .filter-toggle-btn--active { border-color: var(--accent); color: var(--accent); }
        .filter-active-dot { position: absolute; top: 6px; right: 6px; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: pulse-ring 1.5s ease-out infinite; }
        @media (max-width: 600px) { .home-page__container { padding: 0 12px; } .hero__controls { flex-direction: column; align-items: stretch; } .filter-toggle-btn { justify-content: center; } }
      `}</style>
    </main>
  );
}