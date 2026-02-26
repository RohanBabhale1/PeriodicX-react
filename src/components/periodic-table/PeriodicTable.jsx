import { useMemo, memo } from 'react';
import { GRID_POSITIONS } from '../../data/gridPositions';
import ElementCard from './ElementCard';

const PeriodicTable = memo(function PeriodicTable({ elements, matchedNumbers, filteredNumbers }) {
  const getCardState = useMemo(() => {
    const activeSet = filteredNumbers ?? matchedNumbers;
    return (atomicNumber) => {
      if (!activeSet) return { isHighlighted: false, isDimmed: false };
      return { isHighlighted: activeSet.has(atomicNumber), isDimmed: !activeSet.has(atomicNumber) };
    };
  }, [filteredNumbers, matchedNumbers]);

  const mainElements  = useMemo(() => elements.filter((el) => GRID_POSITIONS[el.atomicNumber]?.row <= 7), [elements]);
  const lanthanides   = useMemo(() => elements.filter((el) => GRID_POSITIONS[el.atomicNumber]?.row === 9), [elements]);
  const actinides     = useMemo(() => elements.filter((el) => GRID_POSITIONS[el.atomicNumber]?.row === 10), [elements]);

  return (
    <div className="periodic-table-wrapper" role="region" aria-label="Periodic Table of Elements">
      <div className="periodic-grid" role="grid">
        {mainElements.map((el, idx) => {
          const pos = GRID_POSITIONS[el.atomicNumber];
          if (!pos) return null;
          const { isHighlighted, isDimmed } = getCardState(el.atomicNumber);
          return (
            <div key={el.atomicNumber} className="periodic-grid__cell" style={{ gridColumn: pos.col, gridRow: pos.row }} role="gridcell">
              <ElementCard element={el} isHighlighted={isHighlighted} isDimmed={isDimmed} animationDelay={idx * 4} />
            </div>
          );
        })}

        {/* Group labels */}
        {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map((g) => (
          <div key={`group-${g}`} className="group-label" style={{ gridColumn: g, gridRow: 0 }}>{g}</div>
        ))}

        {/* Lanthanide / Actinide placeholders */}
        <div className="series-placeholder" style={{ gridColumn: '3', gridRow: '6' }}>57–71</div>
        <div className="series-placeholder" style={{ gridColumn: '3', gridRow: '7' }}>89–103</div>
      </div>

      {/* Lanthanides row */}
      <div className="series-block">
        {[{ label: 'La 57–71', elements: lanthanides, offset: 200 },
          { label: 'Ac 89–103', elements: actinides, offset: 260 }].map(({ label, elements: els, offset }) => (
          <div key={label} className="series-row">
            <div className="series-row__label">{label.split(' ')[0]}<span>{label.split(' ')[1]}</span></div>
            <div className="series-grid">
              {els.map((el, idx) => {
                const { isHighlighted, isDimmed } = getCardState(el.atomicNumber);
                return <ElementCard key={el.atomicNumber} element={el} isHighlighted={isHighlighted} isDimmed={isDimmed} animationDelay={offset + idx * 4} />;
              })}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .periodic-table-wrapper { display: flex; flex-direction: column; gap: 12px; width: 100%; }
        .periodic-grid { display: grid; grid-template-columns: repeat(18, 1fr); gap: clamp(2px, 0.4vw, 5px); width: 100%; }
        .periodic-grid__cell { display: flex; align-items: stretch; justify-content: stretch; }
        .group-label { display: flex; align-items: flex-end; justify-content: center; padding-bottom: 2px; font-family: var(--font-mono); font-size: 0.55rem; color: var(--text-muted); height: 16px; }
        .series-placeholder { display: flex; align-items: center; justify-content: center; border: 1px dashed var(--border-medium); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.5rem; color: var(--text-muted); aspect-ratio: 1; }
        .series-block { display: flex; flex-direction: column; gap: 4px; padding-left: clamp(0px, 2.5vw, 40px); margin-top: 4px; }
        .series-row { display: flex; align-items: center; gap: 6px; }
        .series-row__label { display: flex; flex-direction: column; align-items: center; min-width: 28px; font-family: var(--font-mono); font-size: 0.65rem; font-weight: 600; color: var(--text-muted); gap: 2px; }
        .series-row__label span { font-size: 0.45rem; opacity: 0.7; }
        .series-grid { display: grid; grid-template-columns: repeat(14, 1fr); gap: clamp(2px, 0.4vw, 5px); flex: 1; }
      `}</style>
    </div>
  );
});

export default PeriodicTable;