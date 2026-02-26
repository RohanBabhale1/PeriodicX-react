import { memo, useState, useCallback } from 'react';
import { CATEGORY_CONFIG, BLOCK_CONFIG, STATE_CONFIG } from '../../config/categoryColors';

const PERIODS = [1,2,3,4,5,6,7];
const GROUPS  = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];

const FilterChip = memo(({ label, active, color, onClick }) => (
  <button className={`filter-chip ${active ? 'filter-chip--active' : ''}`}
    style={{ '--chip-color': color || 'var(--accent)' }} onClick={onClick} aria-pressed={active}>
    {label}
  </button>
));

const FilterSection = memo(({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="filter-section">
      <button className="filter-section__title" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        {title} <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="filter-section__chips">{children}</div>}
    </div>
  );
});

const FilterPanel = memo(function FilterPanel({ filters, toggleFilter, setRadioactive, resetFilters, isFilterActive, isOpen, onClose }) {
  const toggle = useCallback((key, val) => toggleFilter(key, val), [toggleFilter]);

  if (!isOpen) return null;

  return (
    <div className="filter-panel animate-slideDown" role="region" aria-label="Filter elements">
      <div className="filter-panel__header">
        <span className="filter-panel__heading">Filters</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {isFilterActive && <button className="filter-reset-btn" onClick={resetFilters}>Reset all</button>}
          <button className="filter-close-btn" onClick={onClose} aria-label="Close filters">✕</button>
        </div>
      </div>
      <div className="filter-panel__body">
        <FilterSection title="Category">
          {Object.entries(CATEGORY_CONFIG).map(([k, cfg]) => (
            <FilterChip key={k} label={cfg.label} active={filters.categories.includes(k)} color={cfg.color} onClick={() => toggle('categories', k)} />
          ))}
        </FilterSection>
        <FilterSection title="Block">
          {Object.entries(BLOCK_CONFIG).map(([k, cfg]) => (
            <FilterChip key={k} label={cfg.label} active={filters.blocks.includes(k)} color={cfg.color} onClick={() => toggle('blocks', k)} />
          ))}
        </FilterSection>
        <FilterSection title="Period">
          {PERIODS.map(p => <FilterChip key={p} label={`Period ${p}`} active={filters.periods.includes(p)} onClick={() => toggle('periods', p)} />)}
        </FilterSection>
        <FilterSection title="Group">
          {GROUPS.map(g => <FilterChip key={g} label={`${g}`} active={filters.groups.includes(g)} onClick={() => toggle('groups', g)} />)}
        </FilterSection>
        <FilterSection title="State at Room Temp">
          {Object.entries(STATE_CONFIG).map(([k, cfg]) => (
            <FilterChip key={k} label={cfg.label} active={filters.states.includes(k)} color={cfg.color} onClick={() => toggle('states', k)} />
          ))}
        </FilterSection>
        <FilterSection title="Radioactivity">
          <FilterChip label="Stable"      active={filters.radioactive === false} color="#34d399" onClick={() => setRadioactive(filters.radioactive === false ? null : false)} />
          <FilterChip label="Radioactive" active={filters.radioactive === true}  color="#f87171" onClick={() => setRadioactive(filters.radioactive === true  ? null : true)}  />
        </FilterSection>
      </div>
      <style>{`
        .filter-panel { background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-lg); max-height: 70vh; display: flex; flex-direction: column; }
        .filter-panel__header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border-subtle); background: var(--bg-tertiary); flex-shrink: 0; }
        .filter-panel__heading { font-family: var(--font-display); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-secondary); }
        .filter-reset-btn { font-size: 0.72rem; color: var(--accent); cursor: pointer; padding: 3px 8px; border-radius: var(--radius-sm); border: 1px solid var(--accent); background: transparent; transition: all var(--transition-fast); font-family: var(--font-body); }
        .filter-reset-btn:hover { background: var(--accent); color: white; }
        .filter-close-btn { font-size: 0.75rem; color: var(--text-muted); cursor: pointer; width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--border-medium); display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast); background: none; }
        .filter-close-btn:hover { color: var(--text-primary); background: var(--bg-tertiary); }
        .filter-panel__body { overflow-y: auto; padding: 12px 16px; display: flex; flex-direction: column; gap: 12px; }
        .filter-section__title { display: flex; align-items: center; justify-content: space-between; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-muted); margin-bottom: 6px; background: none; border: none; width: 100%; text-align: left; padding: 0; font-family: var(--font-body); cursor: pointer; }
        .filter-section__chips { display: flex; flex-wrap: wrap; gap: 5px; }
        .filter-chip { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--border-medium); background: transparent; color: var(--text-secondary); font-size: 0.72rem; cursor: pointer; transition: all var(--transition-fast); font-family: var(--font-body); white-space: nowrap; }
        .filter-chip:hover, .filter-chip--active { border-color: var(--chip-color); color: var(--chip-color); background: color-mix(in srgb, var(--chip-color) 15%, transparent); font-weight: 600; }
      `}</style>
    </div>
  );
});

export default FilterPanel;