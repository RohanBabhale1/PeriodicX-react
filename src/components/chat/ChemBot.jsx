import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { CHAT_CONFIG }              from '../../config/chatConfig.js';
import { sendMessage, checkHealth } from '../../services/chemBotApi.js';
import MessageBubble                from './MessageBubble.jsx';

const WELCOME =
  "Hi! I'm ChemBot 🧪\n\n" +
  "I'm your periodic table assistant — ask me anything about chemical " +
  "elements, properties, trends, or comparisons!\n\n" +
  "I only answer chemistry questions. Try one of the suggestions below to get started.";

// ── Live midnight countdown (used in RateLimitCard & exhausted message) ───────
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

// ── Main component ────────────────────────────────────────────────────────────
const ChemBot = memo(function ChemBot({ onClose }) {
  const [messages,     setMessages]     = useState([{ role:'assistant', text:WELCOME, id:0 }]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [online,       setOnline]       = useState(true);
  const [allExhausted, setAllExhausted] = useState(false); // true only when ALL providers fail

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

    // ── Only block if ALL providers are exhausted ───────────────────────────
    if (allExhausted) {
      addMessage('assistant', `All AI providers are currently unavailable. Please try again later or refresh at midnight UTC (in ${timeLeft}).`);
      return;
    }

    addMessage('user', t);
    setInput('');
    setLoading(true);

    const history = messages
      .filter(m => m.id !== 0)
      .slice(-CHAT_CONFIG.maxHistory)
      .map(m => ({ role: m.role, content: m.text }));

    try {
      const { reply } = await sendMessage(t, history);
      addMessage('assistant', reply);
      setOnline(true);

    } catch (err) {
      setOnline(false);

      // ALL providers exhausted → lock the UI
      if (err.code === 'ALL_PROVIDERS_EXHAUSTED') {
        setAllExhausted(true);
        addMessage('assistant', `All AI providers are currently unavailable. Please try again later.`);
        return;
      }

      // Groq rate-limit card (shown only if Mistral also failed)
      if (err.code === 'GROQ_TPD_LIMIT' || err.code === 'GROQ_TPM_LIMIT') {
        addMessage('assistant', null, { rateLimit: err.rateLimit });
        return;
      }

      // Cooldown / RPM limits → friendly text, don't lock UI
      const msg =
          err.code === 'COOLDOWN'         ? 'Please wait a moment before sending again.'
        : err.code === 'USER_RATE_LIMIT'  ? 'Too many messages. Please slow down.'
        : err.code === 'GLOBAL_RATE_LIMIT'? 'Server is busy. Try again in a few seconds.'
        : 'Something went wrong. Please try again.';

      addMessage('assistant', msg);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, addMessage, timeLeft, allExhausted]);

  const handleKey = useCallback(e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const showSuggestions = messages.length <= 2;
  const inputDisabled   = loading || allExhausted;

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

      {/* Messages */}
      <div className="cb-messages" role="log" aria-live="polite">
        {messages.map(msg => (
          <div key={msg.id} className={`cb-msg cb-msg--${msg.role}`}>
            {msg.role === 'assistant' && <span className="cb-av" aria-hidden="true">🧪</span>}
            <div className="cb-bubble">
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
            <button key={s} className="cb-sugg" onClick={() => handleSend(s)} disabled={inputDisabled}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="cb-input-row">
        <input
          ref={inputRef}
          type="text"
          className="cb-input"
          placeholder={allExhausted ? 'All providers unavailable…' : 'Ask about any element or periodic trend…'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={inputDisabled}
          aria-label="Chat input"
        />
        <button
          className="cb-send"
          onClick={() => handleSend()}
          disabled={inputDisabled || !input.trim()}
          aria-label="Send message"
        >↑</button>
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
        .cb-close{width:28px;height:28px;border-radius:50%;background:var(--bg-secondary);border:1px solid var(--border-medium);color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.75rem;transition:all var(--transition-fast)}
        .cb-close:hover{background:var(--bg-tertiary);color:var(--text-primary)}
        .cb-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}
        .cb-msg{display:flex;gap:8px;align-items:flex-start}
        .cb-msg--user{flex-direction:row-reverse}
        .cb-av{font-size:1.1rem;flex-shrink:0;margin-top:2px}
        .cb-bubble{max-width:82%;padding:10px 13px;border-radius:var(--radius-lg);font-size:0.82rem;line-height:1.55;word-break:break-word}
        .cb-msg--assistant .cb-bubble{background:var(--bg-tertiary);border:1px solid var(--border-subtle);color:var(--text-primary);border-radius:4px var(--radius-lg) var(--radius-lg) var(--radius-lg)}
        .cb-msg--user .cb-bubble{background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;border-radius:var(--radius-lg) 4px var(--radius-lg) var(--radius-lg)}
        .cb-typing{display:flex;gap:5px;align-items:center;padding:12px 16px}
        .cb-typing span{width:7px;height:7px;border-radius:50%;background:var(--text-muted);animation:cb-bounce 1.2s infinite}
        .cb-typing span:nth-child(2){animation-delay:.2s}.cb-typing span:nth-child(3){animation-delay:.4s}
        @keyframes cb-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        .cb-suggestions{padding:8px 12px;display:flex;flex-wrap:wrap;gap:6px;border-top:1px solid var(--border-subtle);flex-shrink:0;max-height:110px;overflow-y:auto}
        .cb-sugg{font-size:0.7rem;padding:5px 10px;border-radius:var(--radius-md);border:1px solid var(--border-medium);background:var(--bg-tertiary);color:var(--text-secondary);cursor:pointer;transition:all var(--transition-fast);white-space:nowrap}
        .cb-sugg:hover:not(:disabled){border-color:var(--accent);color:var(--accent);background:var(--accent-glow)}
        .cb-sugg:disabled{opacity:0.4;cursor:not-allowed}
        .cb-input-row{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--border-subtle);background:var(--bg-tertiary);flex-shrink:0}
        .cb-input{flex:1;padding:9px 13px;border-radius:var(--radius-md);border:1px solid var(--border-medium);background:var(--bg-secondary);color:var(--text-primary);font-size:0.82rem;outline:none;transition:border-color var(--transition-fast)}
        .cb-input:focus{border-color:var(--accent)}
        .cb-input::placeholder{color:var(--text-muted)}
        .cb-send{width:36px;height:36px;border-radius:var(--radius-md);background:linear-gradient(135deg,#3b82f6,#06b6d4);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;transition:opacity var(--transition-fast);flex-shrink:0}
        .cb-send:disabled{opacity:0.4;cursor:not-allowed}
        .cb-rl-card{background:var(--bg-secondary);border:1px solid var(--border-medium);border-radius:var(--radius-md);padding:10px 12px;display:flex;gap:10px;align-items:flex-start;font-size:0.78rem}
        .cb-rl-icon{font-size:1.2rem;flex-shrink:0}
        .cb-rl-body{display:flex;flex-direction:column;gap:6px;flex:1}
        .cb-rl-title{font-weight:700;color:var(--text-primary)}
        .cb-rl-stats{display:flex;gap:8px;align-items:center}
        .cb-rl-stat{display:flex;flex-direction:column;align-items:center;gap:2px}
        .cb-rl-stat-label{font-size:0.6rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted)}
        .cb-rl-stat-val{font-family:var(--font-mono);font-size:0.75rem;font-weight:700;color:var(--text-primary)}
        .cb-rl-used{color:#ef4444}.cb-rl-rem{color:#22c55e}
        .cb-rl-divider{width:1px;height:24px;background:var(--border-medium)}
        .cb-rl-wait{font-size:0.72rem;color:var(--text-muted)}
        .cb-rl-at{margin-left:4px;color:var(--text-muted)}
      `}</style>
    </div>
  );
});

export default ChemBot;