import { useCallback, useRef, memo } from 'react';
import { useElements } from '../../context/ElementContext';

const SearchBar = memo(function SearchBar({ resultCount }) {
  const { searchQuery, setSearchQuery } = useElements();
  const inputRef = useRef(null);

  const handleChange  = useCallback((e) => setSearchQuery(e.target.value), [setSearchQuery]);
  const handleClear   = useCallback(() => { setSearchQuery(''); inputRef.current?.focus(); }, [setSearchQuery]);
  const handleKeyDown = useCallback((e) => { if (e.key === 'Escape') { setSearchQuery(''); inputRef.current?.blur(); } }, [setSearchQuery]);

  return (
    <div className="search-bar" role="search">
      <label htmlFor="element-search" className="sr-only">Search elements by name, symbol, or atomic number</label>
      <div className="search-bar__inner">
        <span className="search-bar__icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </span>
        <input ref={inputRef} id="element-search" type="search" className="search-bar__input"
          placeholder="Search by name, symbol, or atomic number…"
          value={searchQuery} onChange={handleChange} onKeyDown={handleKeyDown}
          autoComplete="off" spellCheck="false" aria-label="Search elements" />
        {searchQuery && <button className="search-bar__clear" onClick={handleClear} aria-label="Clear search" type="button">✕</button>}
        {searchQuery && <span className="search-bar__count" aria-live="polite">{resultCount ?? 0} found</span>}
      </div>
      <style>{`
        .search-bar { width: 100%; max-width: 480px; }
        .search-bar__inner { position: relative; display: flex; align-items: center; }
        .search-bar__icon { position: absolute; left: 12px; color: var(--text-muted); pointer-events: none; display: flex; align-items: center; }
        .search-bar__input { width: 100%; height: 42px; padding: 0 100px 0 40px; background: var(--bg-input); border: 1px solid var(--border-medium); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.875rem; transition: all var(--transition-fast); outline: none; }
        .search-bar__input::placeholder { color: var(--text-muted); }
        .search-bar__input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); background: var(--bg-secondary); }
        .search-bar__input::-webkit-search-cancel-button { display: none; }
        .search-bar__clear { position: absolute; right: 70px; color: var(--text-muted); font-size: 0.75rem; padding: 4px; border-radius: 4px; transition: color var(--transition-fast); cursor: pointer; background: none; border: none; }
        .search-bar__clear:hover { color: var(--text-primary); }
        .search-bar__count { position: absolute; right: 12px; font-family: var(--font-mono); font-size: 0.7rem; color: var(--accent); white-space: nowrap; font-weight: 600; }
      `}</style>
    </div>
  );
});

export default SearchBar;