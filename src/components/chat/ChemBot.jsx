import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { CHAT_CONFIG }              from '../../config/chatConfig.js';
import { sendMessage, checkHealth } from '../../services/chemBotApi.js';
import MessageBubble                from './MessageBubble.jsx';

const WELCOME =
  "Hi! I'm ChemBot 🧪\n\n" +
  "I'm your periodic table assistant — ask me anything about chemical " +
  "elements, properties, trends, or comparisons!\n\n" +
  "I only answer chemistry questions. Try one of the suggestions below to get started.";

const SESSION_CAP        = CHAT_CONFIG.sessionTokenCap ?? 20_000;
const AVG_TOKENS_PER_MSG = 400;

// ── Live midnight countdown ───────────────────────────────────────────────────
function useMidnightCountdown() {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    function calc() {
      const now = new Date(), midnight = new Date();
      midnight.setUTCHours(24, 0, 0, 0);
      const d = midnight - now;
      const h = Math.floor(d / 3_600_000);
      const m = Math.floor((d % 3_600_000) / 60_000);
      const s = Math.floor((d % 60_000) / 1_000);
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    }
    calc();
    const id = setInterval(calc, 1_000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
}

// ── Rate-limit error card ─────────────────────────────────────────────────────
const RateLimitCard = memo(function RateLimitCard({ rateLimit, timeLeft }) {
  const isDaily = rateLimit?.type === 'daily';
  const icon    = isDaily ? '📊' : '⏱️';
  const title   = isDaily ? 'Daily quota reached' : 'Slow down a little';

  return (
    <div className="cb-rl-card">
      <div className="cb-rl-icon">{icon}</div>
      <div className="cb-rl-body">
        <span className="cb-rl-title">{title}</span>

        {rateLimit?.limit != null && (
          <div className="cb-rl-stats">
            <div className="cb-rl-stat">
              <span className="cb-rl-stat-label">Used</span>
              <span className="cb-rl-stat-val cb-rl-used">{rateLimit.used?.toLocaleString() ?? '—'}</span>
            </div>
            <div className="cb-rl-divider" />
            <div className="cb-rl-stat">
              <span className="cb-rl-stat-label">Remaining</span>
              <span className="cb-rl-stat-val cb-rl-rem">
                {rateLimit.remaining != null ? rateLimit.remaining.toLocaleString() : '—'}
              </span>
            </div>
            <div className="cb-rl-divider" />
            <div className="cb-rl-stat">
              <span className="cb-rl-stat-label">Limit</span>
              <span className="cb-rl-stat-val">{rateLimit.limit.toLocaleString()}</span>
            </div>
          </div>
        )}

        {rateLimit?.waitFormatted ? (
          <div className="cb-rl-wait">
            ⏳ Try again in <strong>{rateLimit.waitFormatted}</strong>
            {rateLimit.retryAt && <span className="cb-rl-at"> · at {rateLimit.retryAt}</span>}
          </div>
        ) : isDaily ? (
          <div className="cb-rl-wait">
            🔄 Resets at midnight UTC · in <strong>{timeLeft}</strong>
          </div>
        ) : null}
      </div>
    </div>
  );
});

// ── Session token bar ─────────────────────────────────────────────────────────
const TokenBar = memo(function TokenBar({ used, cap, timeLeft }) {
  if (used === 0) return null;
  const remaining = Math.max(0, cap - used);
  const pct       = Math.min(100, Math.round((used / cap) * 100));
  const msgsLeft  = Math.max(0, Math.floor(remaining / AVG_TOKENS_PER_MSG));
  const color     = pct >= 80 ? '#ef4444' : pct >= 50 ? '#f59e0b' : '#22c55e';
  return (
    <div className="cb-token-bar-wrap">
      {pct >= 80 && (
        <div className="cb-token-warn">
          ⚠️ ~{msgsLeft} message{msgsLeft !== 1 ? 's' : ''} left · resets in <strong>{timeLeft}</strong>
        </div>
      )}
      <div className="cb-token-row">
        <span className="cb-token-used">{used.toLocaleString()} used</span>
        <div className="cb-token-track">
          <div className="cb-token-fill" style={{ width:`${pct}%`, background:color }} />
        </div>
        <span className="cb-token-rem" style={{ color }}>{remaining.toLocaleString()} left</span>
      </div>
    </div>
  );
});

// ── Main component ────────────────────────────────────────────────────────────
const ChemBot = memo(function ChemBot({ onClose }) {
  const [messages, setMessages] = useState([{ role:'assistant', text:WELCOME, id:0 }]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [online,   setOnline]   = useState(true);
  const [quota,    setQuota]    = useState({ used:0, cap:SESSION_CAP });

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const timeLeft  = useMidnightCountdown();

  useEffect(() => { checkHealth().then(ok => setOnline(ok)); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const addMessage = useCallback((role, text, extra = {}) => {
    setMessages(prev => [...prev, { role, text, id: Date.now() + Math.random(), ...extra }]);
  }, []);

  const handleSend = useCallback(async (text) => {
    const t = (text ?? input).trim();
    if (!t || loading) return;

    addMessage('user', t);
    setInput('');
    setLoading(true);

    const history = messages
      .filter(m => m.id !== 0)
      .slice(-CHAT_CONFIG.maxHistory)
      .map(m => ({ role: m.role, content: m.text }));

    try {
      const { reply, meta } = await sendMessage(t, history);
      addMessage('assistant', reply);
      setOnline(true);
      if (meta?.sessionTokensUsed != null)
        setQuota({ used: meta.sessionTokensUsed, cap: meta.sessionTokenCap ?? SESSION_CAP });

    } catch (err) {
      setOnline(false);

      // ✅ Rate-limit errors from Groq → render the card
      if (err.code === 'GROQ_TPD_LIMIT' || err.code === 'GROQ_TPM_LIMIT') {
        addMessage('assistant', null, { rateLimit: err.rateLimit });
        return;
      }

      // Internal limiter errors → friendly text
      const msg =
        err.code === 'SESSION_CAP'      ? 'Session token limit reached. Refresh to start a new session.'
        : err.code === 'DAILY_EXHAUSTED'? `Daily quota exhausted. Resets at midnight UTC (in ${timeLeft}).`
        : err.code === 'COOLDOWN'       ? 'Please wait a moment before sending again.'
        : err.code === 'USER_RATE_LIMIT'? 'Too many messages. Please slow down.'
        : 'Something went wrong. Please try again.';

      addMessage('assistant', msg);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, addMessage, timeLeft]);

  const handleKey = useCallback(e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const showSuggestions  = messages.length <= 2;
  const sessionExhausted = quota.used >= quota.cap;

  return (
    <div className="cb-panel" role="complementary" aria-label="ChemBot">

      {/* Header */}
      <div className="cb-header">
        <div className="cb-header-left">
          <div className="cb-avatar" aria-hidden="true">🧪</div>
          <div>
            <div className="cb-title">ChemBot</div>
            <div className="cb-status">
              <span className={`cb-dot ${online?'cb-dot--on':'cb-dot--off'}`} />
              <span>{online ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
        {onClose && <button className="cb-close" onClick={onClose} aria-label="Close ChemBot">✕</button>}
      </div>

      {/* Session token bar */}
      <TokenBar used={quota.used} cap={quota.cap} timeLeft={timeLeft} />

      {/* Messages */}
      <div className="cb-messages" role="log" aria-live="polite">
        {messages.map(msg => (
          <div key={msg.id} className={`cb-msg cb-msg--${msg.role}`}>
            {msg.role === 'assistant' && <span className="cb-av" aria-hidden="true">🧪</span>}
            <div className="cb-bubble">
              {/* ✅ Render card if rateLimit data exists, else render text */}
              {msg.rateLimit
                ? <RateLimitCard rateLimit={msg.rateLimit} timeLeft={timeLeft} />
                : <MessageBubble text={msg.text ?? ''} />
              }
            </div>
          </div>
        ))}

        {loading && (
          <div className="cb-msg cb-msg--assistant" aria-label="ChemBot is thinking">
            <span className="cb-av" aria-hidden="true">🧪</span>
            <div className="cb-bubble cb-typing"><span /><span /><span /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="cb-suggestions" aria-label="Suggested questions">
          {CHAT_CONFIG.suggestions.map(s => (
            <button key={s} className="cb-sugg" onClick={() => handleSend(s)} disabled={loading||sessionExhausted}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="cb-input-row">
        <input
          ref={inputRef}
          type="text"
          className="cb-input"
          placeholder={sessionExhausted ? `Session full — resets in ${timeLeft}` : 'Ask about any element or periodic trend…'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading || sessionExhausted}
          maxLength={300}
          aria-label="Your chemistry question"
        />
        <button className="cb-send" onClick={() => handleSend()} disabled={!input.trim()||loading||sessionExhausted} aria-label="Send">↑</button>
      </div>

      <style>{`
        .cb-panel{display:flex;flex-direction:column;width:370px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 120px);background:var(--bg-secondary);border:1px solid var(--border-medium);border-radius:var(--radius-xl);box-shadow:var(--shadow-xl);overflow:hidden}
        .cb-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:var(--bg-tertiary);border-bottom:1px solid var(--border-subtle);flex-shrink:0}
        .cb-header-left{display:flex;align-items:center;gap:10px}
        .cb-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#06b6d4,#3b82f6);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
        .cb-avatar-img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}
        .cb-title{font-family:var(--font-display);font-size:0.95rem;font-weight:700;color:var(--text-primary)}
        .cb-status{display:flex;align-items:center;gap:5px;font-size:0.64rem;color:var(--text-muted)}
        .cb-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
        .cb-dot--on{background:#22c55e}.cb-dot--off{background:#ef4444}
        .cb-close{width:28px;height:28px;border-radius:50%;background:var(--bg-secondary);border:1px solid var(--border-medium);color:var(--text-muted);font-size:0.7rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .cb-close:hover{background:var(--bg-tertiary);color:var(--text-primary)}

        /* Token bar */
        .cb-token-bar-wrap{flex-shrink:0;padding:5px 14px 6px;border-bottom:1px solid var(--border-subtle);display:flex;flex-direction:column;gap:4px}
        .cb-token-warn{font-size:0.65rem;color:#f59e0b;line-height:1.4}
        .cb-token-warn strong{font-family:var(--font-mono)}
        .cb-token-row{display:flex;align-items:center;gap:8px}
        .cb-token-used,.cb-token-rem{font-family:var(--font-mono);font-size:0.6rem;color:var(--text-muted);white-space:nowrap;min-width:58px}
        .cb-token-rem{text-align:right}
        .cb-token-track{flex:1;height:4px;background:var(--bg-tertiary);border-radius:999px;overflow:hidden}
        .cb-token-fill{height:100%;border-radius:999px;transition:width .5s ease,background .5s ease}

        /* Rate-limit card */
        .cb-rl-card{display:flex;gap:10px;align-items:flex-start;background:color-mix(in srgb,#f59e0b 8%,var(--bg-tertiary));border:1px solid color-mix(in srgb,#f59e0b 28%,transparent);border-radius:10px;padding:10px 12px}
        .cb-rl-icon{font-size:1.1rem;flex-shrink:0;margin-top:1px}
        .cb-rl-body{display:flex;flex-direction:column;gap:6px;flex:1;min-width:0}
        .cb-rl-title{font-size:0.78rem;font-weight:700;color:var(--text-primary);font-family:var(--font-display)}
        .cb-rl-stats{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .cb-rl-stat{display:flex;flex-direction:column;gap:1px}
        .cb-rl-stat-label{font-size:0.54rem;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);font-family:var(--font-mono)}
        .cb-rl-stat-val{font-size:0.76rem;font-weight:700;font-family:var(--font-mono);color:var(--text-primary)}
        .cb-rl-used{color:#f59e0b!important}
        .cb-rl-rem{color:#22c55e!important}
        .cb-rl-divider{width:1px;height:26px;background:var(--border-subtle);flex-shrink:0}
        .cb-rl-wait{font-size:0.7rem;color:var(--text-secondary);line-height:1.5}
        .cb-rl-wait strong{color:var(--text-primary);font-family:var(--font-mono)}
        .cb-rl-at{color:var(--text-muted)}

        /* Messages */
        .cb-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}
        .cb-msg{display:flex;gap:8px;align-items:flex-start}
        .cb-msg--user{flex-direction:row-reverse}
        .cb-av{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#06b6d4,#3b82f6);display:flex;align-items:center;justify-content:center;font-size:0.8rem;flex-shrink:0;margin-top:2px}
        .cb-bubble{max-width:calc(100% - 42px);padding:9px 13px;border-radius:16px;font-size:0.82rem;line-height:1.6;font-family:var(--font-body);color:var(--text-primary);word-break:break-word}
        .cb-msg--assistant .cb-bubble{background:var(--bg-tertiary);border:1px solid var(--border-subtle);border-bottom-left-radius:4px}
        .cb-msg--user .cb-bubble{background:var(--accent);color:white;border-bottom-right-radius:4px}
        .cb-typing{display:flex;align-items:center;gap:4px;padding:12px 16px}
        .cb-typing span{width:6px;height:6px;border-radius:50%;background:var(--text-muted);animation:cb-bounce 1.2s ease-in-out infinite}
        .cb-typing span:nth-child(2){animation-delay:.2s}
        .cb-typing span:nth-child(3){animation-delay:.4s}
        @keyframes cb-bounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-6px);opacity:1}}
        .cb-suggestions{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 10px;flex-shrink:0}
        .cb-sugg{padding:5px 12px;border-radius:999px;border:1px solid var(--border-medium);background:var(--bg-secondary);color:var(--text-secondary);font-size:0.7rem;cursor:pointer;transition:all .15s;white-space:nowrap;font-family:var(--font-body)}
        .cb-sugg:hover:not(:disabled){border-color:var(--accent);color:var(--accent);background:color-mix(in srgb,var(--accent) 8%,transparent)}
        .cb-sugg:disabled{opacity:.5;cursor:not-allowed}
        .cb-input-row{display:flex;gap:6px;padding:10px 12px;border-top:1px solid var(--border-subtle);flex-shrink:0}
        .cb-input{flex:1;padding:8px 12px;border:1px solid var(--border-medium);border-radius:8px;font-size:0.82rem;font-family:var(--font-body);background:var(--bg-secondary);color:var(--text-primary);transition:all .15s}
        .cb-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 20%,transparent)}
        .cb-input::placeholder{color:var(--text-muted)}
        .cb-input:disabled{opacity:.5;cursor:not-allowed}
        .cb-send{width:32px;height:32px;padding:0;border-radius:6px;border:1px solid var(--border-medium);background:var(--accent);color:white;font-size:1.1rem;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .cb-send:hover:not(:disabled){background:color-mix(in srgb,var(--accent) 90%,black);box-shadow:0 2px 6px rgba(0,0,0,.15)}
        .cb-send:disabled{opacity:.4;cursor:not-allowed}
      `}</style>
    </div>
  );
});

export default ChemBot;