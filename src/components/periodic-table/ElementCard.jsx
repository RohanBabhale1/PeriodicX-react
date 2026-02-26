import { memo, useCallback } from 'react';
import { getCategoryConfig } from '../../config/categoryColors';
import { useElements } from '../../context/ElementContext';

const ElementCard = memo(function ElementCard({ element, isHighlighted, isDimmed, animationDelay = 0 }) {
  const { openElement } = useElements();
  const config = getCategoryConfig(element.category);

  const handleClick   = useCallback(() => openElement(element), [element, openElement]);
  const handleKeyDown = useCallback((e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openElement(element); } }, [element, openElement]);

  return (
    <div
      className={`element-card animate-scaleIn ${isHighlighted ? 'element-card--highlighted' : ''} ${isDimmed ? 'element-card--dimmed' : ''}`}
      style={{ '--cat-color': config.color, '--cat-bg': config.bg, '--cat-border': config.border, '--cat-gradient': config.gradient, animationDelay: `${animationDelay}ms` }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${element.name}, atomic number ${element.atomicNumber}, symbol ${element.symbol}`}
    >
      {element.isRadioactive && <span className="element-card__radioactive" aria-label="Radioactive">☢</span>}
      <span className="element-card__number">{element.atomicNumber}</span>
      <span className="element-card__symbol">{element.symbol}</span>
      <span className="element-card__name">{element.name}</span>
      <span className="element-card__mass">
        {typeof element.atomicMass === 'number'
          ? element.atomicMass.toFixed(element.atomicMass < 10 ? 3 : 2)
          : `(${element.atomicMass})`}
      </span>

      <style>{`
        .element-card { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; aspect-ratio: 1; min-width: 44px; min-height: 44px; padding: 4px 2px; border-radius: var(--radius-sm); background: var(--cat-gradient), var(--bg-card); border: 1px solid var(--cat-border); cursor: pointer; transition: transform var(--transition-fast), box-shadow var(--transition-fast), opacity var(--transition-base); overflow: hidden; text-align: center; }
        .element-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%); opacity: 0; transition: opacity var(--transition-fast); pointer-events: none; }
        .element-card:hover { transform: scale(1.12) translateZ(0); box-shadow: 0 0 0 2px var(--cat-color), 0 8px 20px rgba(0,0,0,0.3); z-index: 10; border-color: var(--cat-color); }
        .element-card:hover::before { opacity: 1; }
        .element-card:active { transform: scale(1.05) translateZ(0); }
        .element-card--highlighted { border-color: var(--cat-color) !important; box-shadow: 0 0 0 2px var(--cat-color), 0 0 20px color-mix(in srgb, var(--cat-color) 40%, transparent) !important; z-index: 5; }
        .element-card--dimmed { opacity: 0.18; filter: grayscale(0.6); }
        .element-card--dimmed:hover { opacity: 0.7; filter: grayscale(0); }
        .element-card__radioactive { position: absolute; top: 2px; right: 3px; font-size: 0.45rem; color: var(--cat-color); opacity: 0.7; }
        .element-card__number { font-family: var(--font-mono); font-size: clamp(0.45rem, 0.9vw, 0.6rem); color: var(--text-muted); line-height: 1; margin-bottom: 1px; }
        .element-card__symbol { font-family: var(--font-display); font-size: clamp(0.75rem, 1.6vw, 1.05rem); font-weight: 700; color: var(--cat-color); line-height: 1; }
        .element-card__name { font-size: clamp(0.35rem, 0.7vw, 0.5rem); color: var(--text-secondary); line-height: 1.2; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; padding: 0 2px; }
        .element-card__mass { font-family: var(--font-mono); font-size: clamp(0.3rem, 0.6vw, 0.42rem); color: var(--text-muted); line-height: 1; margin-top: 1px; }
        @media (max-width: 768px) { .element-card__name, .element-card__mass { display: none; } }
      `}</style>
    </div>
  );
});

export default ElementCard;