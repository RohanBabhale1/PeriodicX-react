export const CATEGORY_CONFIG = {
  'alkali-metal': {
    label: 'Alkali Metal',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
    border: 'rgba(239,68,68,0.4)',
    gradient: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))',
  },
  'alkaline-earth-metal': {
    label: 'Alkaline Earth Metal',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.15)',
    border: 'rgba(249,115,22,0.4)',
    gradient: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.05))',
  },
  'transition-metal': {
    label: 'Transition Metal',
    color: '#eab308',
    bg: 'rgba(234,179,8,0.15)',
    border: 'rgba(234,179,8,0.35)',
    gradient: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(234,179,8,0.05))',
  },
  'post-transition-metal': {
    label: 'Post-Transition Metal',
    color: '#84cc16',
    bg: 'rgba(132,204,22,0.15)',
    border: 'rgba(132,204,22,0.35)',
    gradient: 'linear-gradient(135deg, rgba(132,204,22,0.2), rgba(132,204,22,0.05))',
  },
  'metalloid': {
    label: 'Metalloid',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.15)',
    border: 'rgba(34,197,94,0.35)',
    gradient: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))',
  },
  'nonmetal': {
    label: 'Nonmetal',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.15)',
    border: 'rgba(6,182,212,0.35)',
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))',
  },
  'halogen': {
    label: 'Halogen',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.15)',
    border: 'rgba(59,130,246,0.35)',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))',
  },
  'noble-gas': {
    label: 'Noble Gas',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.15)',
    border: 'rgba(139,92,246,0.35)',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))',
  },
  'lanthanide': {
    label: 'Lanthanide',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.15)',
    border: 'rgba(236,72,153,0.35)',
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(236,72,153,0.05))',
  },
  'actinide': {
    label: 'Actinide',
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.15)',
    border: 'rgba(244,63,94,0.35)',
    gradient: 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(244,63,94,0.05))',
  },
};

export const BLOCK_CONFIG = {
  s: { label: 's-block', color: '#60a5fa' },
  p: { label: 'p-block', color: '#34d399' },
  d: { label: 'd-block', color: '#fbbf24' },
  f: { label: 'f-block', color: '#f472b6' },
};

export const STATE_CONFIG = {
  solid:   { label: 'Solid',   color: '#94a3b8' },
  liquid:  { label: 'Liquid',  color: '#38bdf8' },
  gas:     { label: 'Gas',     color: '#a78bfa' },
  unknown: { label: 'Unknown', color: '#475569' },
};

export const getCategoryConfig = (category) =>
  CATEGORY_CONFIG[category] || {
    label: category,
    color: '#64748b',
    bg: 'rgba(100,116,139,0.15)',
    border: 'rgba(100,116,139,0.35)',
    gradient: 'none',
  };