import { memo, useMemo } from 'react';
import { getCategoryConfig } from '../../config/categoryColors';

const ROWS = [
  { label: 'Atomic Number',      key: 'atomicNumber',            mono: true },
  { label: 'Atomic Mass (u)',     key: 'atomicMass',              mono: true },
  { label: 'Category',           key: 'category',                format: v => v?.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) },
  { label: 'Block',              key: 'block',                   format: v => v?.toUpperCase(), mono: true },
  { label: 'Group',              key: 'group',                   mono: true },
  { label: 'Period',             key: 'period',                  mono: true },
  { label: 'Electron Config',    key: 'electronConfiguration',   mono: true },
  { label: 'Electronegativity',  key: 'electronegativity',       mono: true },
  { label: 'Ionization Energy',  key: 'ionizationEnergy',        mono: true, format: v => v != null ? `${v} eV` : '—' },
  { label: 'Density (g/cm³)',    key: 'density',                 mono: true },
  { label: 'Melting Point',      key: 'meltingPoint',            mono: true, format: v => v != null ? `${v}°C` : '—' },
  { label: 'Boiling Point',      key: 'boilingPoint',            mono: true, format: v => v != null ? `${v}°C` : '—' },
  { label: 'State at 25°C',      key: 'stateAtRoomTemp' },
  { label: 'Oxidation States',   key: 'oxidationStates',         format: v => Array.isArray(v) ? v.join(', ') : '—', mono: true },
  { label: 'Atomic Radius (pm)', key: 'periodicTrends',          format: v => v?.atomicRadius ? `${v.atomicRadius} pm` : '—', mono: true },
  { label: 'Radioactive',        key: 'isRadioactive',           format: v => v ? '☢ Yes' : '✓ Stable' },
  { label: 'Discovered',         key: 'discoveryYear',           format: v => v ?? 'Prehistoric' },
  { label: 'Discovered By',      key: 'discoveredBy' },
];

const ComparisonTable = memo(function ComparisonTable({ elementA, elementB }) {
  const cfgA = useMemo(() => elementA ? getCategoryConfig(elementA.category) : null, [elementA]);
  const cfgB = useMemo(() => elementB ? getCategoryConfig(elementB.category) : null, [elementB]);

  if (!elementA || !elementB) return (
    <div className="comparison-empty">
      <div style={{ fontSize: '3rem', opacity: 0.3 }}>⇌</div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select two elements to compare</p>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Use the search boxes above to pick elements</p>
      <style>{`.comparison-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 60px 24px; text-align: center; border: 2px dashed var(--border-medium); border-radius: var(--radius-lg); }`}</style>
    </div>
  );

  return (
    <div className="comparison-table-wrap animate-slideUp">
      <div className="comparison-heroes">
        <div />
        {[{ el: elementA, cfg: cfgA }, { el: elementB, cfg: cfgB }].map(({ el, cfg }) => (
          <div key={el.atomicNumber} className="hero-card" style={{ '--cc': cfg.color, '--cb': cfg.bg, '--cborder': cfg.border }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{el.atomicNumber}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 800, color: 'var(--cc)', lineHeight: 1 }}>{el.symbol}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{el.name}</div>
          </div>
        ))}
      </div>

      <div className="comparison-rows" role="table" aria-label="Element comparison">
        <div className="comparison-header" role="row">
          <div role="columnheader" style={{ padding: '10px 16px', fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Property</div>
          {[{ el: elementA, cfg: cfgA }, { el: elementB, cfg: cfgB }].map(({ el, cfg }) => (
            <div key={el.atomicNumber} role="columnheader" style={{ padding: '10px 16px', fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: cfg.color, textAlign: 'center' }}>{el.symbol}</div>
          ))}
        </div>

        {ROWS.map((row) => {
          const rawA = elementA[row.key], rawB = elementB[row.key];
          const valA = row.format ? row.format(rawA) : (rawA ?? '—');
          const valB = row.format ? row.format(rawB) : (rawB ?? '—');
          const numA = typeof rawA === 'number' ? rawA : null;
          const numB = typeof rawB === 'number' ? rawB : null;
          const winner = numA !== null && numB !== null ? (numA > numB ? 'a' : numB > numA ? 'b' : null) : null;

          return (
            <div key={row.label} className="comparison-row" role="row">
              <div className="comparison-row__label" role="cell">{row.label}</div>
              {[{ val: valA, isWinner: winner === 'a', cfg: cfgA }, { val: valB, isWinner: winner === 'b', cfg: cfgB }].map(({ val, isWinner, cfg }, i) => (
                <div key={i} role="cell"
                  className={`comparison-row__val ${row.mono ? 'comparison-row__val--mono' : ''}`}
                  style={{ color: isWinner ? cfg.color : undefined, fontWeight: isWinner ? 600 : undefined, background: isWinner ? `color-mix(in srgb, ${cfg.color} 6%, transparent)` : undefined }}>
                  {isWinner && <span style={{ fontSize: '0.6rem', color: cfg.color, animation: 'float 2s ease-in-out infinite' }}>▲</span>}
                  {String(val)}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <style>{`
        .comparison-table-wrap { display: flex; flex-direction: column; gap: 16px; width: 100%; }
        .comparison-heroes { display: grid; grid-template-columns: 180px 1fr 1fr; gap: 12px; }
        .hero-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 24px; background: var(--cb); border: 2px solid var(--cborder); border-top: 4px solid var(--cc); border-radius: var(--radius-lg); text-align: center; }
        .comparison-rows { border: 1px solid var(--border-medium); border-radius: var(--radius-lg); overflow: hidden; }
        .comparison-header { display: grid; grid-template-columns: 180px 1fr 1fr; background: var(--bg-tertiary); border-bottom: 2px solid var(--border-medium); }
        .comparison-row { display: grid; grid-template-columns: 180px 1fr 1fr; border-bottom: 1px solid var(--border-subtle); transition: background var(--transition-fast); }
        .comparison-row:last-child { border-bottom: none; }
        .comparison-row:hover { background: var(--bg-tertiary); }
        .comparison-row__label { padding: 10px 16px; font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; border-right: 1px solid var(--border-subtle); background: var(--bg-secondary); }
        .comparison-row__val { padding: 10px 16px; font-size: 0.82rem; color: var(--text-primary); text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px; border-right: 1px solid var(--border-subtle); }
        .comparison-row__val:last-child { border-right: none; }
        .comparison-row__val--mono { font-family: var(--font-mono); font-size: 0.78rem; }
        @media (max-width: 640px) { .comparison-heroes { grid-template-columns: 1fr 1fr; } .comparison-heroes > :first-child { display: none; } .comparison-header, .comparison-row { grid-template-columns: 120px 1fr 1fr; } .comparison-row__label { font-size: 0.68rem; padding: 8px; } .comparison-row__val { padding: 8px 6px; font-size: 0.7rem; } }
      `}</style>
    </div>
  );
});

export default ComparisonTable;