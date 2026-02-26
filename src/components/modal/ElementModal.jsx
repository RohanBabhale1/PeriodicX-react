import { useEffect, useCallback, memo, Suspense } from 'react';
import { useElements } from '../../context/ElementContext';
import { getCategoryConfig, BLOCK_CONFIG, STATE_CONFIG } from '../../config/categoryColors';
import { lazy } from 'react';

const AtomicModel3D  = lazy(() => import('./AtomicModel3D'));
const OrbitalDiagram = lazy(() => import('./OrbitalDiagram'));

const DataRow = memo(({ label, value, mono }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="data-row">
      <span className="data-row__label">{label}</span>
      <span className={`data-row__value ${mono ? 'data-row__value--mono' : ''}`}>
        {Array.isArray(value) ? value.join(', ') : String(value)}
      </span>
    </div>
  );
});

const Section = memo(({ title, children }) => (
  <div className="modal-section">
    <h3 className="modal-section__title">{title}</h3>
    <div className="modal-section__content">{children}</div>
  </div>
));

const ElementModal = memo(function ElementModal() {
  const { selectedElement: el, closeElement } = useElements();

  const handleBackdropClick = useCallback((e) => { if (e.target === e.currentTarget) closeElement(); }, [closeElement]);

  useEffect(() => {
    if (!el) return;
    const handleKey = (e) => { if (e.key === 'Escape') closeElement(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [el, closeElement]);

  if (!el) return null;

  const config   = getCategoryConfig(el.category);
  const blockCfg = BLOCK_CONFIG[el.block] || {};
  const stateCfg = STATE_CONFIG[el.stateAtRoomTemp] || STATE_CONFIG.unknown;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label={`Details for ${el.name}`}>
      <div className="modal animate-scaleIn" style={{ '--cat-color': config.color, '--cat-bg': config.bg }}>

        {/* Header */}
        <div className="modal__header">
          <div className="modal__hero">
            <span className="modal__number">{el.atomicNumber}</span>
            <span className="modal__symbol">{el.symbol}</span>
            <span className="modal__name">{el.name}</span>
            <span className="modal__mass">{el.atomicMass}</span>
          </div>
          <div className="modal__badges">
            <span className="badge" style={{ color: config.color, borderColor: config.border, background: config.bg }}>{config.label}</span>
            <span className="badge" style={{ color: blockCfg.color, borderColor: `${blockCfg.color}40`, background: `${blockCfg.color}15` }}>{blockCfg.label}</span>
            <span className="badge" style={{ color: stateCfg.color, borderColor: `${stateCfg.color}40`, background: `${stateCfg.color}15` }}>{stateCfg.label} at RT</span>
            {el.isRadioactive && <span className="badge" style={{ color: '#f87171', borderColor: '#f8717140', background: '#f8717115' }}>☢ Radioactive</span>}
          </div>
          <button className="modal__close" onClick={closeElement} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div className="modal__body">
          {/* Quick stats */}
          <div className="modal__stats-grid">
            {[
              { label: 'Group',             value: el.group ?? '—' },
              { label: 'Period',            value: el.period },
              { label: 'Block',             value: el.block?.toUpperCase() },
              { label: 'Electronegativity', value: el.electronegativity ?? 'N/A' },
              { label: 'Ionization Energy', value: el.ionizationEnergy ? `${el.ionizationEnergy} eV` : 'N/A' },
              { label: 'Density',           value: el.density ? `${el.density} g/cm³` : 'N/A' },
            ].map((item) => (
              <div key={item.label} className="stat-card">
                <span className="stat-card__label">{item.label}</span>
                <span className="stat-card__value">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Detail sections */}
          <div className="modal__sections">
            <Section title="⚛ Physical Properties">
              <DataRow label="Atomic Mass"    value={el.atomicMass ? `${el.atomicMass} u` : null} mono />
              <DataRow label="Density"        value={el.density ? `${el.density} g/cm³` : null} mono />
              <DataRow label="Melting Point"  value={el.meltingPoint  !== null ? `${el.meltingPoint}°C`  : null} mono />
              <DataRow label="Boiling Point"  value={el.boilingPoint  !== null ? `${el.boilingPoint}°C`  : null} mono />
              <DataRow label="State at 25°C"  value={el.stateAtRoomTemp} />
            </Section>

            <Section title="⚡ Electronic Structure">
              <DataRow label="Electron Config"     value={el.electronConfiguration} mono />
              <DataRow label="Oxidation States"    value={el.oxidationStates} />
              <DataRow label="Electronegativity"   value={el.electronegativity ? `${el.electronegativity} (Pauling)` : null} mono />
              <DataRow label="Ionization Energy"   value={el.ionizationEnergy ? `${el.ionizationEnergy} eV` : null} mono />
            </Section>

            <Section title="📈 Periodic Trends">
              {el.periodicTrends && <>
                <DataRow label="Atomic Radius"           value={el.periodicTrends.atomicRadius ? `${el.periodicTrends.atomicRadius} pm` : 'Unknown'} mono />
                <DataRow label="Ionization Energy Trend" value={el.periodicTrends.ionizationEnergyTrend} />
                <DataRow label="Electron Affinity Trend" value={el.periodicTrends.electronAffinityTrend} />
              </>}
              <div className="trends-note">
                <p>Across a period (left→right): atomic radius ↓, ionization energy ↑, electronegativity ↑</p>
                <p>Down a group (top→bottom): atomic radius ↑, ionization energy ↓, electronegativity ↓</p>
              </div>
            </Section>

            <Section title="🔬 Discovery">
              <DataRow label="Discovered"    value={el.discoveryYear ?? 'Ancient / Prehistoric'} />
              <DataRow label="Discovered By" value={el.discoveredBy} />
            </Section>

            <Section title="🏭 Common Uses">
              {el.uses?.map((use, i) => (
                <div key={i} className="list-item">
                  <span style={{ color: config.color, fontSize: '0.7rem', marginTop: 3 }}>▸</span>
                  <span>{use}</span>
                </div>
              ))}
            </Section>

            <Section title="💡 Interesting Facts">
              {el.facts?.map((fact, i) => (
                <div key={i} className="list-item">
                  <span style={{ color: config.color, fontSize: '0.7rem', marginTop: 3 }}>★</span>
                  <span>{fact}</span>
                </div>
              ))}
            </Section>

            {/* Atomic Model */}
            <Section title="⚛ Atomic Model">
              <Suspense fallback={
                <div style={{ height:200, background:'var(--bg-tertiary)', borderRadius:'var(--radius-md)' }}/>
              }>
                <AtomicModel3D element={el} />
              </Suspense>
            </Section>

            {/* Orbital Diagram */}
            <Section title="🔬 Orbital Diagram">
              <Suspense fallback={null}>
                <OrbitalDiagram element={el} />
              </Suspense>
            </Section>
          </div>
        </div>
      </div>

      <style>{`
        .modal { background: var(--bg-modal); border: 1px solid var(--border-medium); border-top: 3px solid var(--cat-color); border-radius: var(--radius-lg); width: 100%; max-width: 680px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow-xl); position: relative; }
        .modal__header { padding: 24px 24px 16px; border-bottom: 1px solid var(--border-subtle); background: var(--cat-bg); flex-shrink: 0; }
        .modal__hero { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
        .modal__number { font-family: var(--font-mono); font-size: 0.9rem; color: var(--text-muted); }
        .modal__symbol { font-family: var(--font-display); font-size: 2.8rem; font-weight: 800; color: var(--cat-color); line-height: 1; }
        .modal__name { font-family: var(--font-display); font-size: 1.4rem; font-weight: 600; color: var(--text-primary); }
        .modal__mass { font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); margin-left: auto; }
        .modal__badges { display: flex; flex-wrap: wrap; gap: 6px; }
        .modal__close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 50%; background: var(--bg-tertiary); color: var(--text-secondary); font-size: 0.8rem; display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast); cursor: pointer; border: 1px solid var(--border-medium); }
        .modal__close:hover { background: var(--cat-bg); color: var(--cat-color); border-color: var(--cat-color); transform: rotate(90deg); }
        .modal__body { overflow-y: auto; flex: 1; padding: 20px 24px; display: flex; flex-direction: column; gap: 20px; }
        .modal__stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .stat-card { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; display: flex; flex-direction: column; gap: 4px; }
        .stat-card__label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 500; }
        .stat-card__value { font-family: var(--font-mono); font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
        .modal__sections { display: flex; flex-direction: column; gap: 16px; }
        .modal-section__title { font-family: var(--font-display); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--cat-color); margin-bottom: 8px; }
        .modal-section__content { display: flex; flex-direction: column; gap: 4px; }
        .data-row { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; padding: 4px 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.82rem; }
        .data-row:last-child { border-bottom: none; }
        .data-row__label { color: var(--text-muted); flex-shrink: 0; font-size: 0.78rem; }
        .data-row__value { color: var(--text-primary); text-align: right; font-weight: 500; }
        .data-row__value--mono { font-family: var(--font-mono); font-size: 0.78rem; }
        .list-item { display: flex; gap: 8px; align-items: flex-start; padding: 3px 0; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; }
        .trends-note { background: var(--bg-secondary); border-left: 3px solid var(--cat-color); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; padding: 10px 12px; margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
        .trends-note p { font-size: 0.75rem; color: var(--text-muted); line-height: 1.5; }
        @media (max-width: 600px) { .modal { max-height: 95vh; } .modal__stats-grid { grid-template-columns: repeat(2, 1fr); } .modal__body { padding: 16px; } .modal__header { padding: 16px; } }
      `}</style>
    </div>
  );
});

export default ElementModal;