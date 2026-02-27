import { memo, useMemo } from 'react';
import { getCategoryConfig } from '../../config/categoryColors';

// ─────────────────────────────────────────────────────────────────────────────
// ACCURATE electron shell distribution
// Uses real quantum-mechanics shell filling order:
// Shell 1 → max 2   (1s)
// Shell 2 → max 8   (2s 2p)
// Shell 3 → max 18  (3s 3p 3d)
// Shell 4 → max 32  (4s 4p 4d 4f)
// ─────────────────────────────────────────────────────────────────────────────
function getShellElectrons(atomicNumber) {
  const MAX_PER_SHELL = [2, 8, 18, 32, 32, 18, 8];
  const shells = [];
  let remaining = atomicNumber;
  for (const max of MAX_PER_SHELL) {
    if (remaining <= 0) break;
    shells.push(Math.min(remaining, max));
    remaining -= max;
  }
  return shells;
}

// For each shell, define how many orbital PLANES to draw and their 3D angles.
// More shells = more planes to suggest orbital complexity.
const SHELL_PLANES = [
  [{ rx: 68, rz: 0 }],                                           // shell 1: 1 plane
  [{ rx: 68, rz: 0 }, { rx: -52, rz: 55 }],                     // shell 2: 2 planes
  [{ rx: 68, rz: 0 }, { rx: -52, rz: 55 }, { rx: 22, rz: -60 }], // shell 3: 3 planes
  [{ rx: 60, rz: 15 }, { rx: -45, rz: 50 }, { rx: 18, rz: -55 }], // shell 4: 3 planes
];

// Ring diameters for each shell (px)
const RING_D = [80, 132, 188, 248];

// Base orbit duration (seconds) — inner shells faster
const BASE_DUR = [2.8, 4.6, 6.8, 9.2];

// ─────────────────────────────────────────────────────────────────────────────
// OrbitalRing — one plane of one shell, with electrons placed on it
// ─────────────────────────────────────────────────────────────────────────────
const OrbitalRing = memo(function OrbitalRing({
  shellIdx, planeIdx, totalPlanes, electronsOnPlane,
  diameter, color, duration,
}) {
  const radius  = diameter / 2;
  const animDir = (shellIdx + planeIdx) % 2 === 0 ? 1 : -1; // alternate direction

  return (
    <div
      className={`am-ring am-ring--s${shellIdx} am-ring--p${planeIdx}`}
      style={{
        width:  `${diameter}px`,
        height: `${diameter}px`,
        '--dur':   `${duration + planeIdx * 0.9}s`,
        '--animdir': animDir,
        '--cc':  color,
        '--rx':  `${SHELL_PLANES[shellIdx]?.[planeIdx]?.rx ?? 65}deg`,
        '--rz':  `${SHELL_PLANES[shellIdx]?.[planeIdx]?.rz ?? 0}deg`,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: electronsOnPlane }).map((_, eIdx) => {
        const angleDeg = (eIdx / electronsOnPlane) * 360;
        // Stagger each electron's animation start so they don't overlap at t=0
        const delay = -(duration * eIdx) / electronsOnPlane;
        return (
          <div
            key={eIdx}
            className="am-electron"
            style={{
              transform: `rotate(${angleDeg}deg) translateX(${radius}px)`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ShellGroup — all orbital planes for one shell
// ─────────────────────────────────────────────────────────────────────────────
const ShellGroup = memo(function ShellGroup({ shellIdx, electronCount, color }) {
  const planes      = SHELL_PLANES[Math.min(shellIdx, SHELL_PLANES.length - 1)];
  const diameter    = RING_D[Math.min(shellIdx, RING_D.length - 1)];
  const duration    = BASE_DUR[Math.min(shellIdx, BASE_DUR.length - 1)];
  const numPlanes   = planes.length;

  // Distribute electrons as evenly as possible across planes
  const basePerPlane = Math.floor(electronCount / numPlanes);
  const remainder    = electronCount % numPlanes;

  return (
    <>
      {planes.map((_, pIdx) => {
        const eCount = basePerPlane + (pIdx < remainder ? 1 : 0);
        if (eCount === 0) return null;
        return (
          <OrbitalRing
            key={pIdx}
            shellIdx={shellIdx}
            planeIdx={pIdx}
            totalPlanes={numPlanes}
            electronsOnPlane={eCount}
            diameter={diameter}
            color={color}
            duration={duration}
          />
        );
      })}
    </>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Nucleus — glowing core showing symbol + atomic number
// ─────────────────────────────────────────────────────────────────────────────
const Nucleus = memo(function Nucleus({ element, color }) {
  return (
    <div className="am-nucleus" style={{ '--cc': color }} aria-hidden="true">
      <span className="am-nucleus__symbol">{element.symbol}</span>
      <span className="am-nucleus__z">{element.atomicNumber}</span>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Shell info chips below the model
// ─────────────────────────────────────────────────────────────────────────────
const ShellChips = memo(function ShellChips({ shells, color }) {
  const LABELS = ['K','L','M','N','O','P','Q'];
  return (
    <div className="am-chips" aria-label="Electron shell summary">
      {shells.map((count, idx) => (
        <div key={idx} className="am-chip" style={{ '--cc': color }}>
          <span className="am-chip__shell">{LABELS[idx] ?? `n${idx+1}`}</span>
          <span className="am-chip__count">{count}</span>
          <span className="am-chip__e">e⁻</span>
        </div>
      ))}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const AtomicModel3D = memo(function AtomicModel3D({ element }) {
  const config = getCategoryConfig(element.category);
  const color  = config.color;

  // All shells (full accuracy)
  const allShells = useMemo(
    () => getShellElectrons(element.atomicNumber),
    [element.atomicNumber],
  );

  // Only render up to 4 shells in the 3D model (visual limit)
  const visibleShells = allShells.slice(0, 4);

  // For heavy elements with many shells, compress outer shells into last visible ring
  const displayShells = useMemo(() => {
    if (allShells.length <= 4) return allShells;
    // Sum extra shells into the 4th slot for display
    const base  = allShells.slice(0, 3);
    const extra = allShells.slice(3).reduce((a, b) => a + b, 0);
    return [...base, extra];
  }, [allShells]);

  const totalElectrons = element.atomicNumber;

  return (
    <div
      className="am-wrap"
      role="img"
      aria-label={`3D Bohr model of ${element.name}: ${totalElectrons} electrons across ${allShells.length} shell${allShells.length > 1 ? 's' : ''}`}
    >

      {/* ── 3D Scene ──────────────────────────────────────── */}
      <div className="am-scene" style={{ '--cc': color }}>

        {/* Ambient glow rings (decorative depth layers) */}
        <div className="am-glow am-glow--1" style={{ '--cc': color }} aria-hidden="true" />
        <div className="am-glow am-glow--2" style={{ '--cc': color }} aria-hidden="true" />

        {/* Orbital shells */}
        {displayShells.map((count, idx) => (
          <ShellGroup
            key={idx}
            shellIdx={idx}
            electronCount={count}
            color={color}
          />
        ))}

        {/* Nucleus */}
        <Nucleus element={element} color={color} />
      </div>

      {/* ── Shell info chips ──────────────────────────────── */}
      <ShellChips shells={allShells} color={color} />

      {/* ── Caption ───────────────────────────────────────── */}
      <p className="am-caption">
        Bohr model · {allShells.length} shell{allShells.length > 1 ? 's' : ''} · {totalElectrons} electron{totalElectrons > 1 ? 's' : ''}
        {allShells.length > 4 && <span className="am-caption__note"> · Outer shells compressed</span>}
      </p>

      {/* ── Styles ────────────────────────────────────────── */}
      <style>{`
        /* Wrapper */
        .am-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 8px 0;
          user-select: none;
        }

        /* 3D Scene container */
        .am-scene {
          position: relative;
          width: 280px;
          height: 280px;
          perspective: 900px;
          perspective-origin: 55% 45%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Ambient depth glow */
        .am-glow {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: am-pulse 3s ease-in-out infinite;
        }
        .am-glow--1 {
          width: 260px; height: 260px;
          background: radial-gradient(ellipse at center,
            color-mix(in srgb, var(--cc) 10%, transparent) 0%,
            transparent 70%
          );
        }
        .am-glow--2 {
          width: 180px; height: 180px;
          background: radial-gradient(ellipse at center,
            color-mix(in srgb, var(--cc) 8%, transparent) 0%,
            transparent 65%
          );
          animation-delay: -1.5s;
        }
        @keyframes am-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.06); }
        }

        /* Orbital ring */
        .am-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid color-mix(in srgb, var(--cc) 30%, transparent);
          transform-style: preserve-3d;
          transform: rotateX(var(--rx)) rotateZ(var(--rz));
          animation: am-orbit calc(var(--dur)) linear infinite;
          animation-direction: calc(var(--animdir) == 1 ? normal : reverse);
          box-shadow:
            0 0 6px color-mix(in srgb, var(--cc) 10%, transparent),
            inset 0 0 6px color-mix(in srgb, var(--cc) 5%, transparent);
        }

        /* Alternate ring animation directions */
        .am-ring--p0 { animation-name: am-orbit-cw; }
        .am-ring--p1 { animation-name: am-orbit-ccw; }
        .am-ring--p2 { animation-name: am-orbit-cw;  animation-delay: -1.2s; }

        @keyframes am-orbit-cw  { from { transform: rotateX(var(--rx)) rotateZ(var(--rz)); }
                                   to   { transform: rotateX(var(--rx)) rotateZ(calc(var(--rz) + 360deg)); } }
        @keyframes am-orbit-ccw { from { transform: rotateX(var(--rx)) rotateZ(var(--rz)); }
                                   to   { transform: rotateX(var(--rx)) rotateZ(calc(var(--rz) - 360deg)); } }

        /* Electron */
        .am-electron {
          position: absolute;
          top: 50%; left: 50%;
          width: 7px; height: 7px;
          margin: -3.5px 0 0 -3.5px;
          border-radius: 50%;
          background: var(--cc);
          transform-origin: 0 0;
          box-shadow:
            0 0 4px 1px var(--cc),
            0 0 10px color-mix(in srgb, var(--cc) 60%, transparent),
            0 0 20px color-mix(in srgb, var(--cc) 30%, transparent);
        }

        /* Nucleus */
        .am-nucleus {
          position: absolute;
          z-index: 20;
          width: 56px; height: 56px;
          border-radius: 50%;
          background: radial-gradient(
            circle at 35% 30%,
            color-mix(in srgb, var(--cc) 60%, white),
            color-mix(in srgb, var(--cc) 90%, black)
          );
          box-shadow:
            0 0 0 3px  color-mix(in srgb, var(--cc) 25%, transparent),
            0 0 16px 4px color-mix(in srgb, var(--cc) 45%, transparent),
            0 0 40px 8px color-mix(in srgb, var(--cc) 20%, transparent);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1px;
          animation: am-nucleus-pulse 2.8s ease-in-out infinite;
        }
        @keyframes am-nucleus-pulse {
          0%, 100% { box-shadow: 0 0 0 3px color-mix(in srgb,var(--cc) 25%,transparent), 0 0 16px 4px color-mix(in srgb,var(--cc) 45%,transparent), 0 0 40px 8px color-mix(in srgb,var(--cc) 20%,transparent); }
          50%       { box-shadow: 0 0 0 5px color-mix(in srgb,var(--cc) 35%,transparent), 0 0 24px 6px color-mix(in srgb,var(--cc) 55%,transparent), 0 0 55px 12px color-mix(in srgb,var(--cc) 25%,transparent); }
        }
        .am-nucleus__symbol {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 800;
          color: white;
          line-height: 1;
          text-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        .am-nucleus__z {
          font-family: var(--font-mono);
          font-size: 0.5rem;
          color: rgba(255,255,255,0.8);
          line-height: 1;
        }

        /* Shell chips */
        .am-chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 300px;
        }
        .am-chip {
          display: flex;
          align-items: baseline;
          gap: 2px;
          background: var(--bg-secondary);
          border: 1px solid color-mix(in srgb, var(--cc) 30%, var(--border-subtle));
          border-radius: var(--radius-sm);
          padding: 4px 10px;
        }
        .am-chip__shell {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--cc);
          min-width: 12px;
        }
        .am-chip__count {
          font-family: var(--font-display);
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
        }
        .am-chip__e {
          font-family: var(--font-mono);
          font-size: 0.55rem;
          color: var(--text-muted);
        }

        /* Caption */
        .am-caption {
          font-size: 0.62rem;
          color: var(--text-muted);
          font-style: italic;
          text-align: center;
          line-height: 1.5;
        }
        .am-caption__note {
          color: var(--text-muted);
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
});

export default AtomicModel3D;