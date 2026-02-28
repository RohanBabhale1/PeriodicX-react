import { CHAT_CONFIG, SESSION_ID } from '../config/chatConfig.js';
import elementsData from '../data/elements.json';

const IS_DEV      = import.meta.env.DEV;
const DEV_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const ELEMENTS    = elementsData;

// ── Element resolver ──────────────────────────────────────────────────────────
const CATEGORY_SYNONYMS = {
  'noble-gas':             ['noble gas','noble gases','inert gas'],
  'alkali-metal':          ['alkali metal','alkali metals'],
  'alkaline-earth-metal':  ['alkaline earth','alkaline earth metal'],
  'transition-metal':      ['transition metal','transition metals'],
  'post-transition-metal': ['post transition metal','poor metal'],
  'metalloid':             ['metalloid','metalloids','semimetal'],
  'nonmetal':              ['nonmetal','nonmetals'],
  'halogen':               ['halogen','halogens'],
  'lanthanide':            ['lanthanide','lanthanides','rare earth'],
  'actinide':              ['actinide','actinides'],
};
const PROPERTY_PATTERNS = {
  density:          { keywords:['density','densest','most dense'],         sort:(a,b)=>(parseFloat(b.density)||0)-(parseFloat(a.density)||0) },
  meltingPoint:     { keywords:['melting point','melt','highest melting'], sort:(a,b)=>{ const av=parseFloat(a.meltingPoint),bv=parseFloat(b.meltingPoint); return (isNaN(bv)?-Infinity:bv)-(isNaN(av)?-Infinity:av); } },
  boilingPoint:     { keywords:['boiling point','boil'],                   sort:(a,b)=>{ const av=parseFloat(a.boilingPoint),bv=parseFloat(b.boilingPoint); return (isNaN(bv)?-Infinity:bv)-(isNaN(av)?-Infinity:av); } },
  electronegativity:{ keywords:['electronegativity','electronegative'],    sort:(a,b)=>(parseFloat(b.electronegativity)||0)-(parseFloat(a.electronegativity)||0) },
  atomicMass:       { keywords:['atomic mass','heaviest','lightest'],       sort:(a,b)=>(parseFloat(b.atomicMass)||0)-(parseFloat(a.atomicMass)||0) },
};
function detectPropertyQuery(msg) {
  if (!/highest|lowest|densest|heaviest|lightest/.test(msg)) return null;
  for (const { keywords, sort } of Object.values(PROPERTY_PATTERNS))
    if (keywords.some(k => msg.includes(k))) return { sort };
  return null;
}
function parsePeriodGroup(msg) {
  return {
    period: msg.match(/period\s+(\d+)/i) ? parseInt(msg.match(/period\s+(\d+)/i)[1]) : null,
    group:  msg.match(/group\s+(\d+)/i)  ? parseInt(msg.match(/group\s+(\d+)/i)[1])  : null,
  };
}
function resolveRelevantElements(message) {
  const msg = message.toLowerCase(), found = new Map();
  const pq = detectPropertyQuery(msg);
  if (pq) return [...ELEMENTS].sort(pq.sort).slice(0,5);
  const { period, group } = parsePeriodGroup(msg);
  if (period !== null || group !== null) {
    const f = ELEMENTS.filter(el=>(period===null||el.period===period)&&(group===null||el.group===group));
    return f.length > 0 ? f : [];
  }
  for (const el of ELEMENTS) {
    if (msg.includes(el.name.toLowerCase())) found.set(el.atomicNumber, el);
    if (new RegExp(`\\b${el.symbol.toLowerCase()}\\b`).test(msg)) found.set(el.atomicNumber, el);
  }
  for (const [cat, syns] of Object.entries(CATEGORY_SYNONYMS))
    if (syns.some(s=>msg.includes(s)))
      ELEMENTS.filter(el=>el.category===cat).forEach(el=>found.set(el.atomicNumber,el));
  const r = [...found.values()];
  return r.length > 0 ? r : ELEMENTS.map(e=>({
    name:e.name, symbol:e.symbol, atomicNumber:e.atomicNumber,
    category:e.category??'', period:e.period, group:e.group,
  }));
}
function formatElementData(elements) {
  if (!elements?.length) return '(No matching elements found)';
  return elements.map(el => {
    const lines = [`${el.name} (${el.symbol}, #${el.atomicNumber})`];
    ['category','period','group','block','atomicMass','electronegativity','density',
     'meltingPoint','boilingPoint','stateAtRoomTemp','electronConfiguration',
     'discoveredBy','discoveryYear','uses'].forEach(prop => {
      const val = el[prop];
      if (val!=null && val!=='' && !(Array.isArray(val)&&val.length===0))
        lines.push(`  ${prop}: ${Array.isArray(val)?val.join(', '):val}`);
    });
    return lines.join('\n');
  }).join('\n\n');
}
function buildSystemPrompt(elementData) {
  const has = elementData?.trim().length > 10;
  return `You are ChemBot, a chemistry assistant. You answer all chemistry-related questions including reactions, compounds, bonding, thermodynamics, organic chemistry, and more.
CORE RULES:
1. Answer in 1-3 sentences max. No hedging.
2. PERIOD/GROUP: Find exact element. If none: "There is no element in period X and group Y."
3. PROPERTY: State element with value directly.
4. Use the element data below when relevant, otherwise use your chemistry knowledge.
5. GREETINGS (hi, hello, hey, how are you, etc.): Respond warmly and briefly. Example: "Hey! I'm ChemBot 🧪 Ask me anything about chemistry or the periodic table!"
6. NON-CHEMISTRY (anything unrelated to chemistry or greetings): Reply ONLY: "I'm ChemBot — I only answer chemistry-related questions."
${has ? `ELEMENT DATA:\n${elementData}` : `NOTE: No elements match.`}`;
}

function parseGroqRateLimit(err) {
  const raw = err?.error?.message ?? err?.message ?? '';

  const isDaily  = raw.includes('tokens per day')   || raw.includes('TPD');
  const isMinute = raw.includes('tokens per minute') || raw.includes('TPM');

  const toInt = rx => { const m = raw.match(rx); return m ? parseInt(m[1].replace(/,/g,'')) : null; };
  const limit     = toInt(/Limit\s+([\d,]+)/i);
  const used      = toInt(/Used\s+([\d,]+)/i);
  const requested = toInt(/Requested\s+([\d,]+)/i);
  const remaining = (limit!=null && used!=null) ? Math.max(0, limit-used) : null;

  const waitMatch = raw.match(/try again in\s+([^\.\n,]+)/i);
  const waitRaw   = waitMatch ? waitMatch[1].trim() : null;

  function formatWait(str) {
    if (!str) return null;
    const m = str.match(/(\d+)m/), s = str.match(/([\d.]+)s/);
    const mins = m ? parseInt(m[1]) : 0;
    const secs = s ? Math.ceil(parseFloat(s[1])) : 0;
    if (mins > 0 && secs > 0) return `${mins} min ${secs} sec`;
    if (mins > 0) return `${mins} min`;
    if (secs > 0) return `${secs} sec`;
    return str;
  }

  function getRetryTime(str) {
    if (!str) return null;
    const m = str.match(/(\d+)m/), s = str.match(/([\d.]+)s/);
    const totalMs = ((m?parseInt(m[1]):0)*60 + (s?parseFloat(s[1]):0)) * 1000;
    return new Date(Date.now() + totalMs)
      .toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  }

  return {
    type:          isDaily ? 'daily' : isMinute ? 'per_minute' : 'unknown',
    limit,
    used,
    remaining,
    requested,
    waitFormatted: formatWait(waitRaw),
    retryAt:       getRetryTime(waitRaw),
  };
}

// ── Dev mode: calls Groq directly from browser ────────────────────────────────
async function sendMessageDev(message, history = []) {
  if (!DEV_API_KEY) throw new Error('VITE_GROQ_API_KEY not set in .env.local');

  // Dynamic import so groq-sdk is never bundled into the production build
  const { default: Groq } = await import('groq-sdk');
  const groq = new Groq({ apiKey: DEV_API_KEY, dangerouslyAllowBrowser: true });

  const systemPrompt = buildSystemPrompt(formatElementData(resolveRelevantElements(message)));
  const recentHistory = (Array.isArray(history) ? history : [])
    .slice(-CHAT_CONFIG.maxHistory)
    .filter(m => m.role && m.content)
    .map(m => ({ role: m.role==='assistant'?'assistant':'user', content: String(m.content).slice(0,500) }));

  try {
    const completion = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      messages:    [{ role:'system', content:systemPrompt }, ...recentHistory, { role:'user', content:message }],
      temperature: 0.1,
      max_tokens:  300,
    });
    return {
      reply: completion.choices[0]?.message?.content?.trim() ?? 'No response received.',
      meta:  null,
    };

  } catch (groqErr) {
    if (groqErr?.status === 429 || groqErr?.statusCode === 429) {
      const rateLimit = parseGroqRateLimit(groqErr);
      const isDaily   = rateLimit.type === 'daily';
      const err       = new Error(isDaily ? 'Daily quota reached.' : 'Per-minute limit reached.');
      err.code        = isDaily ? 'GROQ_TPD_LIMIT' : 'GROQ_TPM_LIMIT';
      err.rateLimit   = rateLimit;
      throw err;
    }
    throw groqErr;
  }
}

// ── Prod mode: calls your Vercel serverless function ─────────────────────────
async function sendMessageProd(message, history = []) {
  const res = await fetch(CHAT_CONFIG.apiUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ message, history, sessionId: SESSION_ID }),
    signal:  AbortSignal.timeout(30_000),
  });

  const text = await res.text();
  if (!text) throw Object.assign(new Error('Server returned an empty response.'), { code:'EMPTY_RESPONSE' });

  let data;
  try { data = JSON.parse(text); }
  catch { throw Object.assign(new Error('Invalid server response.'), { code:'PARSE_ERROR' }); }

  if (!res.ok) {
    const err     = new Error(data.error ?? `Server error ${res.status}`);
    err.code      = data.code      ?? 'SERVER_ERROR';
    err.rateLimit = data.rateLimit ?? null;
    err.waitMs    = data.waitMs    ?? null;
    throw err;
  }

  return { reply: data.reply, meta: data.meta ?? null };
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function sendMessage(message, history = []) {
  return IS_DEV ? sendMessageDev(message, history) : sendMessageProd(message, history);
}

export async function checkHealth() {
  if (IS_DEV) return !!DEV_API_KEY;
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(5_000) });
    return res.ok;
  } catch { return false; }
}