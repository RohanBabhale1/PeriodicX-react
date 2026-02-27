import { memo, useState, useCallback, useMemo } from 'react';
import { useElements } from '../../context/ElementContext';
import { getCategoryConfig } from '../../config/categoryColors';
import useDebounce from '../../hooks/useDebounce';

const ElementSelector = memo(function ElementSelector({ slot, selectedElement, onSelect }) {
  const { elements } = useElements();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 200);

  const filtered = useMemo(() => {
    if (!debouncedQuery.trim()) return elements.slice(0, 118);
    const q = debouncedQuery.toLowerCase();
    return elements.filter((el) =>
      el.name.toLowerCase().includes(q) ||
      el.symbol.toLowerCase() === q ||
      String(el.atomicNumber) === q
    ).slice(0, 30);
  }, [elements, debouncedQuery]);

  const handleSelect = useCallback((el) => { onSelect(slot, el); setQuery(''); setIsOpen(false); }, [slot, onSelect]);
  const handleClear  = useCallback(() => { onSelect(slot, null); setQuery(''); }, [slot, onSelect]);
  const config = selectedElement ? getCategoryConfig(selectedElement.category) : null;

  return (
    <div className="element-selector">
      <div className="element-selector__label">Element {slot + 1}</div>
      {selectedElement ? (
        <div className="selected-card" style={{ '--cat-color': config.color, '--cat-bg': config.bg, '--cat-border': config.border }}>
          <div className="selected-card__number">{selectedElement.atomicNumber}</div>
          <div className="selected-card__symbol">{selectedElement.symbol}</div>
          <div className="selected-card__name">{selectedElement.name}</div>
          <div className="selected-card__mass">{selectedElement.atomicMass}</div>
          <button className="selected-card__clear" onClick={handleClear} aria-label={`Remove ${selectedElement.name}`}>✕</button>
        </div>
      ) : (
        <div className="element-selector__input-wrap">
          <input type="text" className="element-selector__input" placeholder="Search element…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 180)}
            aria-label={`Search element ${slot + 1}`} autoComplete="off" />
          {isOpen && filtered.length > 0 && (
            <div className="element-selector__dropdown" role="listbox">
              {filtered.map((el) => {
                const cfg = getCategoryConfig(el.category);
                return (
                  <button key={el.atomicNumber} className="dropdown-item" onMouseDown={() => handleSelect(el)} role="option" aria-selected="false">
                    <span className="dropdown-item__number">{el.atomicNumber}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: cfg.color, width: 28 }}>{el.symbol}</span>
                    <span style={{ flex: 1, fontSize: '0.82rem' }}>{el.name}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      <style>{`
        .element-selector { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 200px; }
        .element-selector__label { font-family: var(--font-display); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); }
        .selected-card { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 20px; background: var(--cat-bg); border: 2px solid var(--cat-border); border-radius: var(--radius-lg); text-align: center; min-height: 120px; }
        .selected-card__number { font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); }
        .selected-card__symbol { font-family: var(--font-display); font-size: 2.5rem; font-weight: 800; color: var(--cat-color); line-height: 1; }
        .selected-card__name   { font-family: var(--font-display); font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
        .selected-card__mass   { font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); }
        .selected-card__clear  { position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; border-radius: 50%; background: var(--bg-tertiary); color: var(--text-muted); font-size: 0.65rem; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid var(--border-medium); transition: all var(--transition-fast); }
        .selected-card__clear:hover { background: #ef444420; color: #ef4444; border-color: #ef4444; }
        .element-selector__input-wrap { position: relative; }
        .element-selector__input { width: 100%; height: 42px; padding: 0 12px; background: var(--bg-input); border: 1px solid var(--border-medium); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.875rem; font-family: var(--font-body); outline: none; transition: all var(--transition-fast); }
        .element-selector__input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
        .element-selector__dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 20; max-height: 240px; overflow-y: auto; animation: slideDown var(--transition-fast) both; }
        .dropdown-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; width: 100%; text-align: left; cursor: pointer; border: none; background: none; color: var(--text-primary); font-family: var(--font-body); transition: background var(--transition-fast); border-bottom: 1px solid var(--border-subtle); }
        .dropdown-item:last-child { border-bottom: none; }
        .dropdown-item:hover { background: var(--bg-tertiary); }
        .dropdown-item__number { font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); width: 24px; text-align: right; flex-shrink: 0; }
      `}</style>
    </div>
  );
});

export default ElementSelector;