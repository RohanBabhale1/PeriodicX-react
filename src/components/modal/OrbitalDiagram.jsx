import { memo, useMemo } from 'react';

const SUP    = { '⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9' };
const MAX_E  = { s:2, p:6, d:10, f:14 };
const BOXES  = { s:1, p:3, d:5, f:7 };
const COLORS = { s:'#60a5fa', p:'#34d399', d:'#fbbf24', f:'#f472b6' };

function parseConfig(raw) {
  if (!raw) return [];
  let str = raw.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => SUP[c] ?? c)
               .replace(/^\[[A-Za-z]+\]\s*/, '').trim();
  const result = [];
  const re = /(\d+)([spdf])(\d+)/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    const [, n, type, eCnt] = m;
    result.push({ label:`${n}${type}`, type, count:parseInt(eCnt,10), max:MAX_E[type] });
  }
  return result;
}

function SubshellDisplay({ sub }) {
  const { type, count, label } = sub;
  const color = COLORS[type];
  const boxes = Array.from({ length: BOXES[type] }, (_, i) => ({
    hasUp:   count > i,
    hasDown: count > BOXES[type] + i,
  }));
  return (
    <div className="od-subshell">
      <div className="od-boxes" style={{ '--sc': color }}>
        {boxes.map((b, i) => (
          <div key={i} className="od-box">
            {b.hasDown && <span className="od-e od-e--down" aria-hidden="true">↓</span>}
            {b.hasUp   && <span className="od-e od-e--up"   aria-hidden="true">↑</span>}
          </div>
        ))}
      </div>
      <span className="od-label" style={{ color }}>{label}</span>
    </div>
  );
}

const OrbitalDiagram = memo(function OrbitalDiagram({ element }) {
  const subshells = useMemo(() => parseConfig(element.electronConfiguration), [element.electronConfiguration]);

  const shells = useMemo(() => {
    const map = {};
    for (const sub of subshells) {
      const n = sub.label[0];
      if (!map[n]) map[n] = [];
      map[n].push(sub);
    }
    return Object.entries(map);
  }, [subshells]);

  if (subshells.length === 0)
    return <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontStyle:'italic' }}>Orbital diagram not available</p>;

  return (
    <div className="od-wrap" role="img" aria-label={`Orbital diagram for ${element.name}`}>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <span style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', fontWeight:700, fontFamily:'var(--font-display)', flexShrink:0 }}>Config</span>
        <code style={{ fontFamily:'var(--font-mono)', fontSize:'0.76rem', color:'var(--text-secondary)', background:'var(--bg-tertiary)', padding:'3px 9px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-subtle)', wordBreak:'break-all' }}>
          {element.electronConfiguration}
        </code>
      </div>

      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
        {Object.entries(COLORS).map(([type, color]) => (
          <span key={type} style={{ display:'flex', alignItems:'center', gap:5, fontFamily:'var(--font-mono)', fontSize:'0.64rem', fontWeight:600, color }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:color, display:'inline-block', flexShrink:0 }} />
            {type}-block
          </span>
        ))}
      </div>

      <div className="od-shells">
        {shells.map(([n, subs]) => (
          <div key={n} className="od-shell-row">
            <span className="od-shell-n">n={n}</span>
            <div className="od-shell-subs">
              {subs.map((sub) => <SubshellDisplay key={sub.label} sub={sub} />)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
        <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.68rem', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
          <span className="od-e od-e--up">↑</span> spin-up (ms = +½)
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.68rem', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
          <span className="od-e od-e--down">↓</span> spin-down (ms = −½)
        </span>
      </div>

      <style>{`
        .od-wrap { display:flex; flex-direction:column; gap:14px; }
        .od-shells { display:flex; flex-direction:column; gap:10px; overflow-x:auto; padding-bottom:4px; }
        .od-shell-row { display:flex; align-items:flex-start; gap:10px; }
        .od-shell-n { font-family:var(--font-mono); font-size:0.62rem; color:var(--text-muted); padding-top:9px; min-width:30px; flex-shrink:0; }
        .od-shell-subs { display:flex; gap:12px; flex-wrap:wrap; }
        .od-subshell { display:flex; flex-direction:column; align-items:center; gap:4px; }
        .od-boxes { display:flex; gap:2px; }
        .od-box { width:28px; height:30px; border:1px solid var(--sc); border-radius:3px; background:color-mix(in srgb,var(--sc) 8%,transparent); display:flex; flex-direction:row-reverse; align-items:center; justify-content:center; }
        .od-label { font-family:var(--font-mono); font-size:0.6rem; font-weight:600; }
        .od-e { font-size:0.78rem; line-height:1; font-weight:700; display:inline-block; width:12px; text-align:center; }
        .od-e--up   { color:#60a5fa; }
        .od-e--down { color:#f472b6; }
      `}</style>
    </div>
  );
});

export default OrbitalDiagram;