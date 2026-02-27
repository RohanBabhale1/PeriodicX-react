import { memo, useCallback } from 'react';
import { getCategoryConfig } from '../../config/categoryColors';

const QuizCard = memo(function QuizCard({ question, selected, onSelect, streak, feedback }) {
  const config = getCategoryConfig(question.element.category);

  const getOptionState = useCallback((option) => {
    if (!selected) return 'idle';
    if (option === question.correct) return 'correct';
    if (option === selected) return 'wrong';
    return 'dim';
  }, [selected, question.correct]);

  return (
    <div className="quiz-card animate-scaleIn">
      {streak >= 2 && (
        <div className="streak-badge" aria-live="polite">🔥 {streak} streak!</div>
      )}

      <div className="quiz-card__prompt-wrap">
        <p className="quiz-card__label">{question.promptLabel}</p>
        <div className="quiz-card__prompt"
          style={{ '--cat-color': config.color, '--cat-bg': config.bg, '--cat-border': config.border }}>
          {question.promptType === 'symbol' ? (
            <div className="quiz-prompt-symbol-block">
              <span className="quiz-card__atomic-num">{question.element.atomicNumber}</span>
              <span className="quiz-card__symbol">{question.prompt}</span>
              <span className="quiz-card__elem-mass">{question.element.atomicMass}</span>
            </div>
          ) : (
            <span className="quiz-card__name-prompt">{question.prompt}</span>
          )}
        </div>
        {selected && (
          <p className="quiz-card__hint animate-slideDown" aria-live="polite">
            💡 {question.hint}
          </p>
        )}
      </div>

      <div className="quiz-card__options" role="group" aria-label="Answer options">
        {question.options.map((option, idx) => {
          const state   = getOptionState(option);
          const display = question.formatOption ? question.formatOption(option) : option;
          return (
            <button key={`${question.id}-${idx}`}
              className={`quiz-option quiz-option--${state}`}
              onClick={() => onSelect(option)}
              disabled={!!selected}
              aria-label={`Option ${idx + 1}: ${display}`}>
              <span className="quiz-option__letter">{String.fromCharCode(65 + idx)}</span>
              <span className="quiz-option__text">{display}</span>
              {state === 'correct' && <span className="quiz-option__icon">✓</span>}
              {state === 'wrong'   && <span className="quiz-option__icon">✕</span>}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          className={`quiz-card__feedback quiz-card__feedback--${feedback.type} animate-slideDown`}
          aria-live="assertive"
        >
          <span className="quiz-card__feedback-icon">{feedback.type === 'correct' ? '✓' : '✕'}</span>
          <span>{feedback.message}</span>
          <div className="quiz-card__countdown" />
        </div>
      )}

      <style>{`
        .quiz-card { display:flex; flex-direction:column; gap:16px; width:100%; max-width:540px; margin:0 auto; position:relative; }
        .streak-badge { position:absolute; top:-18px; right:0; background:linear-gradient(135deg,#f97316,#ef4444); color:white; font-size:0.75rem; font-weight:700; padding:4px 12px; border-radius:999px; font-family:var(--font-display); animation:float 1.5s ease-in-out infinite; box-shadow:0 4px 12px rgba(239,68,68,0.4); }
        .quiz-card__prompt-wrap { display:flex; flex-direction:column; align-items:center; gap:10px; text-align:center; }
        .quiz-card__label { font-size:0.82rem; color:var(--text-muted); }
        .quiz-card__prompt { display:flex; align-items:center; justify-content:center; min-width:160px; min-height:90px; padding:16px 40px; background:var(--cat-bg); border:2px solid var(--cat-color); border-radius:var(--radius-lg); box-shadow:0 0 30px color-mix(in srgb,var(--cat-color) 20%,transparent); }
        .quiz-prompt-symbol-block { display:flex; flex-direction:column; align-items:center; gap:2px; }
        .quiz-card__atomic-num { font-family:var(--font-mono); font-size:0.65rem; color:var(--text-muted); line-height:1; }
        .quiz-card__symbol { font-family:var(--font-display); font-size:3.5rem; font-weight:800; color:var(--cat-color); line-height:1; }
        .quiz-card__elem-mass { font-family:var(--font-mono); font-size:0.6rem; color:var(--text-muted); line-height:1; }
        .quiz-card__name-prompt { font-family:var(--font-display); font-size:clamp(1.2rem,4vw,1.7rem); font-weight:700; color:var(--cat-color); line-height:1.2; }
        .quiz-card__hint { font-family:var(--font-mono); font-size:0.72rem; color:var(--text-muted); background:var(--bg-tertiary); padding:4px 14px; border-radius:999px; border:1px solid var(--border-subtle); }
        .quiz-card__options { display:flex; flex-direction:column; gap:7px; }
        .quiz-option { display:flex; align-items:center; gap:12px; padding:11px 16px; border-radius:var(--radius-md); border:1px solid var(--border-medium); background:var(--bg-secondary); color:var(--text-primary); font-size:0.875rem; font-family:var(--font-body); font-weight:500; cursor:pointer; text-align:left; transition:all var(--transition-fast); }
        .quiz-option:not(:disabled):hover { border-color:var(--accent); background:var(--bg-tertiary); transform:translateX(4px); }
        .quiz-option:disabled { cursor:default; }
        .quiz-option--correct { border-color:#22c55e!important; background:rgba(34,197,94,0.12)!important; color:#22c55e!important; }
        .quiz-option--wrong   { border-color:#ef4444!important; background:rgba(239,68,68,0.1)!important; color:#ef4444!important; }
        .quiz-option--dim { opacity:0.35; }
        .quiz-option__letter { display:flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; background:var(--bg-tertiary); font-family:var(--font-mono); font-size:0.72rem; font-weight:700; flex-shrink:0; border:1px solid var(--border-medium); }
        .quiz-option--correct .quiz-option__letter { background:#22c55e; color:white; border-color:#22c55e; }
        .quiz-option--wrong   .quiz-option__letter { background:#ef4444; color:white; border-color:#ef4444; }
        .quiz-option__text { flex:1; }
        .quiz-option__icon { font-size:1rem; font-weight:700; margin-left:auto; }

        /* inline feedback banner */
        .quiz-card__feedback { position:relative; display:flex; align-items:center; gap:10px; padding:10px 16px; border-radius:var(--radius-md); font-size:0.875rem; font-weight:600; overflow:hidden; }
        .quiz-card__feedback--correct { background:rgba(34,197,94,0.12); color:#22c55e; border:1px solid rgba(34,197,94,0.3); }
        .quiz-card__feedback--wrong   { background:rgba(239,68,68,0.1);  color:#ef4444; border:1px solid rgba(239,68,68,0.3); }
        .quiz-card__feedback-icon { font-size:1.1rem; font-weight:800; flex-shrink:0; }

        /* countdown bar shrinks left-to-right to indicate auto-advance timing */
        .quiz-card__countdown { position:absolute; bottom:0; left:0; height:3px; width:100%; border-radius:0 0 var(--radius-md) var(--radius-md); background:currentColor; opacity:0.45; transform-origin:left; animation:countdownShrink 1.3s linear forwards; }
        @keyframes countdownShrink { from { transform:scaleX(1); } to { transform:scaleX(0); } }
      `}</style>
    </div>
  );
});

export default QuizCard;