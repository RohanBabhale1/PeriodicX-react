// api/chat.js  — Vercel serverless function
import Groq from "groq-sdk";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const ELEMENTS = require("../src/data/elements.json");

// ── Quota constants (Groq free tier) ──────────────────────────────────────────
const QUOTA = {
  DAILY_TOKENS: 100_000, // ✅ actual Groq free tier TPD
  GLOBAL_RPM: 30,
  USER_RPM: 6,
  MAX_CONCURRENT_USERS: 5,
  SESSION_TOKEN_CAP: 20_000, // per-session hard cap (100K / 5 users)
  MESSAGE_COOLDOWN_MS: 3_000,
  BASE_MAX_TOKENS: 300,
  MIN_MAX_TOKENS: 60,
  HISTORY_LIMIT: 6,
};

// ── In-memory rate limiter ────────────────────────────────────────────────────
class RateLimiter {
  constructor() {
    this._resetDailyAt = this._nextMidnightUTC();
    this.dailyTokensUsed = 0;
    this._globalMinute = { count: 0, windowStart: Date.now() };
    this.sessions = new Map();
  }

  _nextMidnightUTC() {
    const d = new Date();
    d.setUTCHours(24, 0, 0, 0);
    return d.getTime();
  }

  _maybeResetDaily() {
    if (Date.now() >= this._resetDailyAt) {
      this.dailyTokensUsed = 0;
      this._resetDailyAt = this._nextMidnightUTC();
      this.sessions.clear();
    }
  }

  _getSession(id) {
    if (!this.sessions.has(id)) {
      this.sessions.set(id, {
        tokensUsed: 0,
        lastMessageAt: 0,
        minuteWindow: { count: 0, windowStart: Date.now() },
        createdAt: Date.now(),
      });
    }
    return this.sessions.get(id);
  }

  _pruneInactive() {
    const ttl = 30 * 60 * 1000;
    const now = Date.now();
    for (const [id, s] of this.sessions)
      if (now - s.lastMessageAt > ttl) this.sessions.delete(id);
  }

  getDynamicMaxTokens() {
    const pct =
      (QUOTA.DAILY_TOKENS - this.dailyTokensUsed) / QUOTA.DAILY_TOKENS;
    if (pct > 0.6) return QUOTA.BASE_MAX_TOKENS;
    if (pct > 0.3) return Math.floor(QUOTA.BASE_MAX_TOKENS * 0.7);
    if (pct > 0.1) return Math.floor(QUOTA.BASE_MAX_TOKENS * 0.45);
    return QUOTA.MIN_MAX_TOKENS;
  }

  check(sessionId) {
    this._maybeResetDaily();
    this._pruneInactive();
    const now = Date.now();
    const sess = this._getSession(sessionId);

    const msSinceLast = now - sess.lastMessageAt;
    if (sess.lastMessageAt > 0 && msSinceLast < QUOTA.MESSAGE_COOLDOWN_MS)
      return {
        code: "COOLDOWN",
        waitMs: QUOTA.MESSAGE_COOLDOWN_MS - msSinceLast,
        message: `Please wait ${((QUOTA.MESSAGE_COOLDOWN_MS - msSinceLast) / 1000).toFixed(1)}s.`,
      };

    if (sess.tokensUsed >= QUOTA.SESSION_TOKEN_CAP)
      return {
        code: "SESSION_CAP",
        message: "Session token limit reached. Refresh to start a new session.",
      };

    if (this.dailyTokensUsed >= QUOTA.DAILY_TOKENS)
      return { code: "DAILY_EXHAUSTED", message: "Daily token quota reached." };

    const gw = this._globalMinute;
    if (now - gw.windowStart >= 60_000) {
      gw.count = 0;
      gw.windowStart = now;
    }
    if (gw.count >= QUOTA.GLOBAL_RPM)
      return {
        code: "GLOBAL_RATE_LIMIT",
        message: "Server is busy. Try again in a few seconds.",
      };

    const uw = sess.minuteWindow;
    if (now - uw.windowStart >= 60_000) {
      uw.count = 0;
      uw.windowStart = now;
    }
    if (uw.count >= QUOTA.USER_RPM)
      return {
        code: "USER_RATE_LIMIT",
        message: `Too many messages. Limit is ${QUOTA.USER_RPM}/min.`,
      };

    return null;
  }

  record(sessionId, tokensUsed) {
    this._maybeResetDaily();
    const sess = this._getSession(sessionId);
    sess.tokensUsed += tokensUsed;
    sess.lastMessageAt = Date.now();
    sess.minuteWindow.count++;
    this.dailyTokensUsed += tokensUsed;
    this._globalMinute.count++;
  }

  getSessionMeta(sessionId) {
    const sess = this._getSession(sessionId);
    return {
      sessionTokensUsed: sess.tokensUsed,
      sessionTokenCap: QUOTA.SESSION_TOKEN_CAP,
      dailyTokensUsed: this.dailyTokensUsed,
      dailyTokensRemaining: Math.max(
        0,
        QUOTA.DAILY_TOKENS - this.dailyTokensUsed,
      ),
      dailyTokenCap: QUOTA.DAILY_TOKENS,
    };
  }
}

const limiter = new RateLimiter();

// ── Element resolver ──────────────────────────────────────────────────────────
const CATEGORY_SYNONYMS = {
  "noble-gas": ["noble gas", "noble gases", "inert gas"],
  "alkali-metal": ["alkali metal", "alkali metals"],
  "alkaline-earth-metal": ["alkaline earth", "alkaline earth metal"],
  "transition-metal": ["transition metal", "transition metals"],
  "post-transition-metal": ["post transition metal", "poor metal"],
  metalloid: ["metalloid", "metalloids", "semimetal"],
  nonmetal: ["nonmetal", "nonmetals"],
  halogen: ["halogen", "halogens"],
  lanthanide: ["lanthanide", "lanthanides", "rare earth"],
  actinide: ["actinide", "actinides"],
};

const PROPERTY_PATTERNS = {
  density: {
    keywords: ["density", "densest", "most dense"],
    sort: (a, b) => (parseFloat(b.density) || 0) - (parseFloat(a.density) || 0),
  },
  meltingPoint: {
    keywords: ["melting point", "melt", "highest melting"],
    sort: (a, b) => {
      const av = parseFloat(a.meltingPoint), bv = parseFloat(b.meltingPoint);
      return (isNaN(bv) ? -Infinity : bv) - (isNaN(av) ? -Infinity : av);
    },
  },
  boilingPoint: {
    keywords: ["boiling point", "boil"],
    sort: (a, b) => {
      const av = parseFloat(a.boilingPoint), bv = parseFloat(b.boilingPoint);
      return (isNaN(bv) ? -Infinity : bv) - (isNaN(av) ? -Infinity : av);
    },
  },
};

function resolveRelevantElements(message) {
  const lower = message.toLowerCase();

  // Match by name or symbol
  const byName = ELEMENTS.filter(
    (e) =>
      lower.includes(e.name.toLowerCase()) ||
      lower.includes(e.symbol.toLowerCase()),
  );
  if (byName.length) return byName;

  // Match by atomic number
  const numMatch = lower.match(/atomic number\s*(\d+)/i);
  if (numMatch) {
    const found = ELEMENTS.find((e) => e.atomicNumber === parseInt(numMatch[1]));
    if (found) return [found];
  }

  // Match by period and group
  const pgMatch = lower.match(/period\s*(\d+).*group\s*(\d+)|group\s*(\d+).*period\s*(\d+)/i);
  if (pgMatch) {
    const period = parseInt(pgMatch[1] ?? pgMatch[4]);
    const group = parseInt(pgMatch[2] ?? pgMatch[3]);
    const found = ELEMENTS.filter((e) => e.period === period && e.group === group);
    if (found.length) return found;
  }

  // Match by category
  for (const [cat, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    if (synonyms.some((s) => lower.includes(s)))
      return ELEMENTS.filter((e) => e.category === cat);
  }

  // Match by property superlative
  for (const [, { keywords, sort }] of Object.entries(PROPERTY_PATTERNS)) {
    if (keywords.some((k) => lower.includes(k)))
      return ELEMENTS.slice().sort(sort).slice(0, 5);
  }

  return ELEMENTS.map((e) => ({
    name: e.name,
    symbol: e.symbol,
    atomicNumber: e.atomicNumber,
    category: e.category ?? "",
    period: e.period,
    group: e.group,
  }));
}

function formatElementData(elements) {
  if (!elements?.length) return "(No matching elements found)";
  return elements
    .map((el) => {
      const lines = [`${el.name} (${el.symbol}, #${el.atomicNumber})`];
      [
        "category", "period", "group", "block", "atomicMass",
        "electronegativity", "density", "meltingPoint", "boilingPoint",
        "stateAtRoomTemp", "electronConfiguration", "discoveredBy",
        "discoveryYear", "uses",
      ].forEach((prop) => {
        const val = el[prop];
        if (val != null && val !== "" && !(Array.isArray(val) && val.length === 0))
          lines.push(`  ${prop}: ${Array.isArray(val) ? val.join(", ") : val}`);
      });
      return lines.join("\n");
    })
    .join("\n\n");
}

function buildSystemPrompt(elementData) {
  const hasElements = elementData?.trim().length > 10;
  return `You are ChemBot, a friendly chemistry assistant embedded in PeriodicX, an interactive periodic table app.
CORE RULES:
1. Answer in 1-3 sentences max. No hedging.
2. PERIOD/GROUP: Find exact element. If none: "There is no element in period X and group Y."
3. PROPERTY: State element with value directly.
4. Use the element data below when relevant, otherwise use your chemistry knowledge.
5. GREETINGS (hi, hello, hey, how are you, etc.): Respond warmly and briefly. Introduce yourself and invite a chemistry question. Example: "Hey! I'm ChemBot 🧪 Your chemistry assistant. Ask me anything about elements, reactions, or compounds!"
6. NON-CHEMISTRY (anything unrelated to chemistry or greetings): Reply ONLY: "I'm ChemBot — I only answer chemistry-related questions."

${hasElements ? `ELEMENT DATA:\n${elementData}` : `NOTE: No elements match.`}`;
}

// ── Groq error parser ─────────────────────────────────────────────────────────
function parseGroqRateLimitError(err) {
  const raw = err?.error?.message ?? err?.message ?? "";
  const isDaily = raw.includes("tokens per day") || raw.includes("TPD");
  const isMinute = raw.includes("tokens per minute") || raw.includes("TPM");

  const toInt = (regex) => {
    const m = raw.match(regex);
    return m ? parseInt(m[1].replace(/,/g, "")) : null;
  };
  const limit = toInt(/Limit\s+([\d,]+)/i);
  const used = toInt(/Used\s+([\d,]+)/i);
  const requested = toInt(/Requested\s+([\d,]+)/i);
  const remaining = limit != null && used != null ? Math.max(0, limit - used) : null;

  const waitMatch = raw.match(/try again in\s+([^\.\n,]+)/i);
  const waitRaw = waitMatch ? waitMatch[1].trim() : null;

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
    const totalMs = ((m ? parseInt(m[1]) : 0) * 60 + (s ? parseFloat(s[1]) : 0)) * 1000;
    return new Date(Date.now() + totalMs).toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  }

  return {
    type: isDaily ? "daily" : isMinute ? "per_minute" : "unknown",
    limit, used, remaining, requested,
    waitFormatted: formatWait(waitRaw),
    retryAt: getRetryTime(waitRaw),
  };
}

// ── Mistral fallback (OpenAI-compatible, no extra SDK needed) ─────────────────
async function callMistral(messages, maxTokens) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY not configured.");

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "mistral-small-latest", // free tier — 1B tokens/month
      messages,
      temperature: 0.1,
      max_tokens: maxTokens,
    }),
    signal: AbortSignal.timeout(25_000),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const err = new Error(errBody?.message ?? `Mistral error ${response.status}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return {
    reply: data.choices[0]?.message?.content?.trim() ?? "No response received.",
    tokensUsed: data.usage?.total_tokens ?? 300,
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { message, history = [], sessionId } = req.body ?? {};
  if (!message?.trim())
    return res.status(400).json({ error: "Message is required." });
  if (!sessionId)
    return res.status(400).json({ error: "sessionId is required." });

  // Internal rate-limit check (before calling any API)
  const limitResult = limiter.check(sessionId);
  if (limitResult) {
    return res.status(429).json({
      error: limitResult.message,
      code: limitResult.code,
      waitMs: limitResult.waitMs ?? null,
    });
  }

  const maxTokens = limiter.getDynamicMaxTokens();
  const relevantElements = resolveRelevantElements(message.trim());
  const systemPrompt = buildSystemPrompt(formatElementData(relevantElements));
  const recentHistory = (Array.isArray(history) ? history : [])
    .slice(-QUOTA.HISTORY_LIMIT)
    .filter((m) => m.role && m.content)
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content).slice(0, 500),
    }));

  const messages = [
    { role: "system", content: systemPrompt },
    ...recentHistory,
    { role: "user", content: message.trim() },
  ];

  // ── Try Groq first ────────────────────────────────────────────────────────
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.1,
      max_tokens: maxTokens,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "No response received.";
    const tokensUsed = completion.usage?.total_tokens ?? 400;
    limiter.record(sessionId, tokensUsed);

    return res.status(200).json({
      reply,
      provider: "groq",
      meta: limiter.getSessionMeta(sessionId),
    });
  } catch (groqErr) {
    console.error("[ChemBot] Groq error:", groqErr?.status, groqErr?.message);

    // ── Groq hit a rate limit → silently fall back to Mistral ────────────────
    if (groqErr?.status === 429) {
      console.log("[ChemBot] Groq rate-limited — trying Mistral fallback...");

      try {
        const { reply, tokensUsed } = await callMistral(messages, maxTokens);
        limiter.record(sessionId, tokensUsed);

        return res.status(200).json({
          reply,
          provider: "mistral", // lets the UI know (optional)
          meta: limiter.getSessionMeta(sessionId),
        });
      } catch (mistralErr) {
        console.error("[ChemBot] Mistral fallback also failed:", mistralErr?.message);

        // Both APIs failed — now show the Groq rate-limit card to the user
        const rateLimit = parseGroqRateLimitError(groqErr);
        const isDaily = rateLimit.type === "daily";
        return res.status(429).json({
          error: isDaily
            ? "Daily token quota reached on all providers. Please try again tomorrow."
            : "Both AI providers are temporarily busy. Please try again in a moment.",
          code: isDaily ? "GROQ_TPD_LIMIT" : "GROQ_TPM_LIMIT",
          rateLimit,
        });
      }
    }

    // Non-rate-limit Groq error
    return res.status(500).json({
      error: "Something went wrong. Please try again.",
      code: "SERVER_ERROR",
    });
  }
}