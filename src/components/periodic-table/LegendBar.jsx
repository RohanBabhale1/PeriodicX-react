import { memo } from 'react';
import { CATEGORY_CONFIG } from '../../config/categoryColors';

const LegendBar = memo(function LegendBar({ activeCategories, onToggleCategory }) {
  return (
    <div className="legend-bar" role="group" aria-label="Element categories legend">
      {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
        <button
          key={key}
          className={`legend-item ${activeCategories?.includes(key) ? 'legend-item--active' : ''}`}
          style={{ '--color': cfg.color, '--bg': cfg.bg, '--border': cfg.border }}
          onClick={() => onToggleCategory?.(key)}
          aria-pressed={activeCategories?.includes(key)}
        >
          <span className="legend-dot" aria-hidden="true" />
          <span>{cfg.label}</span>
        </button>
      ))}
      <style>{`
        .legend-bar { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 0; }
        .legend-item { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--border); background: transparent; cursor: pointer; transition: all var(--transition-fast); font-size: 0.72rem; font-family: var(--font-body); color: var(--text-secondary); }
        .legend-item:hover, .legend-item--active { background: var(--bg); border-color: var(--color); color: var(--color); }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color); flex-shrink: 0; }
      `}</style>
    </div>
  );
});

export default LegendBar;