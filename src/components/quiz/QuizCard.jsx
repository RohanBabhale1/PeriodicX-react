import { memo, useCallback } from 'react';
import { getCategoryConfig } from '../../config/categoryColors';

const QuizCard = memo(function QuizCard({
  question,
  selected,
  multiSelected = [],
  onSelect,
  onToggleMulti,
  onSubmitMulti,
  streak,
  feedback,
}) {
  const config = getCategoryConfig(question.element.category);

  // ── Single-select option state ────────────────────────────────────────────
  const getOptionState = useCallback((option) => {
    if (!selected) return 'idle';
    if (option === question.correct) return 'correct';
    if (option === selected)         return 'wrong';
    return 'dim';
  }, [selected, question.correct]);

  // ── Multi-select option state (after submit) ──────────────────────────────
  const getMultiOptionState = useCallback((option) => {
    const isCorrectAnswer = question.correctAnswers?.includes(option);
    if (!selected) {
      // Before submit: show checked/unchecked
      return multiSelected.includes(option) ? 'checked' : 'idle';
    }
    // After submit: show right/wrong per option
    if (isCorrectAnswer && multiSelected.includes(option)) return 'correct';     // correctly selected
    if (isCorrectAnswer && !multiSelected.includes(option)) return 'missed';     // should have selected
    if (!isCorrectAnswer && multiSelected.includes(option)) return 'wrong';      // wrongly selected
    return 'dim';
  }, [selected, multiSelected, question.correctAnswers]);

  return (
    <div className="quiz-card animate-scaleIn">
      {streak >= 2 && (
        <div className="streak-badge" aria-live="polite">🔥 {streak} streak!</div>
      )}

      {/* ── Prompt ───────────────────────────────────────────────────────── */}
      <div className="quiz-card__prompt-wrap">
        <p className="quiz-card__label">{question.promptLabel}</p>

        <div className="quiz-card__prompt"
          style={{ '--cat-color': config.color, '--cat-bg': config.bg, '--cat-border': config.border }}>

          {question.promptType === 'symbol' && (
            <div className="quiz-prompt-symbol-block">
              <span className="quiz-card__atomic-num">{question.element.atomicNumber}</span>
              <span className="quiz-card__symbol">{question.prompt}</span>
              <span className="quiz-card__elem-mass">{question.element.atomicMass}</span>
            </div>
          )}

          {question.promptType === 'property' && (
            <div className="quiz-prompt-property-block">
              <span className="quiz-card__property-value">{question.prompt}</span>
            </div>
          )}

          {question.promptType === 'clue' && (
            <div className="quiz-prompt-clue-block">
              {question.prompt.split('\n').map((line, i) => (
                <p key={i} className="quiz-card__clue-line">{line}</p>
              ))}
            </div>
          )}

          {question.promptType === 'trend' && (
            <div className="quiz-prompt-trend-block">
              <span className="quiz-card__trend-question">{question.prompt}</span>
            </div>
          )}

          {question.promptType === 'multi' && (
            <div className="quiz-prompt-multi-block">
              <span className="quiz-card__multi-prompt">{question.prompt}</span>
            </div>
          )}

          {(question.promptType === 'name') && (
            <span className="quiz-card__name-prompt">{question.prompt}</span>
          )}
        </div>

        {selected && (
          <p className="quiz-card__hint animate-slideDown" aria-live="polite">
            💡 {question.hint}
          </p>
        )}
      </div>

      {/* ── Options ──────────────────────────────────────────────────────── */}
      {question.multiSelect ? (
        // Multi-select: checkboxes + submit button
        <div className="quiz-card__options" role="group" aria-label="Answer options — select all that apply">
          {question.options.map((option, idx) => {
            const state = getMultiOptionState(option);
            return (
              <button
                key={`${question.id}-${idx}`}
                className={`quiz-option quiz-option--multi quiz-option--${state}`}
                onClick={() => !selected && onToggleMulti(option)}
                disabled={!!selected}
                aria-pressed={multiSelected.includes(option)}
                aria-label={`Option ${idx + 1}: ${option}`}
              >
                <span className={`quiz-option__checkbox ${multiSelected.includes(option) || state === 'correct' || state === 'missed' ? 'quiz-option__checkbox--checked' : ''}`}>
                  {(state === 'correct')                                   && '✓'}
                  {(state === 'wrong')                                     && '✕'}
                  {(state === 'missed')                                    && '!'}
                  {(state === 'checked' || (state === 'idle' && multiSelected.includes(option))) && '✓'}
                </span>
                <span className="quiz-option__text">{option}</span>
                {state === 'missed' && <span className="quiz-option__badge">should select</span>}
              </button>
            );
          })}

          {/* Submit button — only visible before answer is submitted */}
          {!selected && (
            <button
              className={`quiz-option__submit ${multiSelected.length === 0 ? 'quiz-option__submit--disabled' : ''}`}
              onClick={onSubmitMulti}
              disabled={multiSelected.length === 0}
            >
              Submit Answer ({multiSelected.length} selected)
            </button>
          )}
        </div>
      ) : (
        // Single-select: original radio-style buttons
        <div className="quiz-card__options" role="group" aria-label="Answer options">
          {question.options.map((option, idx) => {
            const state   = getOptionState(option);
            const display = question.formatOption ? question.formatOption(option) : option;
            return (
              <button
                key={`${question.id}-${idx}`}
                className={`quiz-option quiz-option--${state}`}
                onClick={() => onSelect(option)}
                disabled={!!selected}
                aria-label={`Option ${idx + 1}: ${display}`}
              >
                <span className="quiz-option__letter">{String.fromCharCode(65 + idx)}</span>
                <span className="quiz-option__text">{display}</span>
                {state === 'correct' && <span className="quiz-option__icon">✓</span>}
                {state === 'wrong'   && <span className="quiz-option__icon">✕</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Feedback banner ───────────────────────────────────────────────── */}
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
        .quiz-card__prompt { display:flex; align-items:center; justify-content:center; min-width:160px; min-height:90px; padding:16px 24px; background:var(--cat-bg); border:2px solid var(--cat-color); border-radius:var(--radius-lg); box-shadow:0 0 30px color-mix(in srgb,var(--cat-color) 20%,transparent); width:100%; }

        /* Symbol prompt */
        .quiz-prompt-symbol-block { display:flex; flex-direction:column; align-items:center; gap:2px; }
        .quiz-card__atomic-num { font-family:var(--font-mono); font-size:0.65rem; color:var(--text-muted); line-height:1; }
        .quiz-card__symbol { font-family:var(--font-display); font-size:3.5rem; font-weight:800; color:var(--cat-color); line-height:1; }
        .quiz-card__elem-mass { font-family:var(--font-mono); font-size:0.6rem; color:var(--text-muted); line-height:1; }

        /* Name prompt */
        .quiz-card__name-prompt { font-family:var(--font-display); font-size:clamp(1.2rem,4vw,1.7rem); font-weight:700; color:var(--cat-color); line-height:1.2; }

        /* Property prompt */
        .quiz-prompt-property-block { display:flex; flex-direction:column; align-items:center; gap:4px; }
        .quiz-card__property-value { font-family:var(--font-mono); font-size:clamp(1.1rem,3.5vw,1.6rem); font-weight:800; color:var(--cat-color); letter-spacing:0.03em; }

        /* Clue prompt */
        .quiz-prompt-clue-block { display:flex; flex-direction:column; gap:6px; text-align:left; width:100%; }
        .quiz-card__clue-line { font-size:0.82rem; color:var(--text-primary); line-height:1.5; font-family:var(--font-body); }
        .quiz-card__clue-line:first-child { color:var(--cat-color); font-weight:600; }

        /* Trend prompt */
        .quiz-prompt-trend-block { display:flex; align-items:center; justify-content:center; }
        .quiz-card__trend-question { font-family:var(--font-display); font-size:clamp(0.9rem,3vw,1.1rem); font-weight:700; color:var(--cat-color); text-align:center; line-height:1.4; }

        /* Multi-select prompt */
        .quiz-prompt-multi-block { display:flex; align-items:center; justify-content:center; }
        .quiz-card__multi-prompt { font-family:var(--font-display); font-size:clamp(0.85rem,2.8vw,1rem); font-weight:700; color:var(--cat-color); text-align:center; line-height:1.4; }

        /* Hint */
        .quiz-card__hint { font-family:var(--font-mono); font-size:0.72rem; color:var(--text-muted); background:var(--bg-tertiary); padding:4px 14px; border-radius:999px; border:1px solid var(--border-subtle); }

        /* Single-select options */
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

        /* Multi-select options */
        .quiz-option--multi { gap:10px; }
        .quiz-option__checkbox { display:flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:5px; background:var(--bg-tertiary); font-size:0.7rem; font-weight:700; flex-shrink:0; border:2px solid var(--border-medium); transition:all var(--transition-fast); }
        .quiz-option__checkbox--checked { background:var(--accent); border-color:var(--accent); color:white; }
        .quiz-option--checked  { border-color:var(--accent)!important; background:color-mix(in srgb, var(--accent) 8%, transparent)!important; }
        .quiz-option--correct  { border-color:#22c55e!important; background:rgba(34,197,94,0.12)!important; color:#22c55e!important; }
        .quiz-option--missed   { border-color:#f59e0b!important; background:rgba(245,158,11,0.1)!important; color:#f59e0b!important; }
        .quiz-option--wrong    { border-color:#ef4444!important; background:rgba(239,68,68,0.1)!important; color:#ef4444!important; }
        .quiz-option__badge { font-size:0.6rem; font-weight:700; padding:2px 6px; border-radius:999px; background:rgba(245,158,11,0.2); color:#f59e0b; margin-left:auto; white-space:nowrap; }

        /* Submit button */
        .quiz-option__submit { width:100%; padding:11px 16px; border-radius:var(--radius-md); border:none; background:linear-gradient(135deg,#3b82f6,#06b6d4); color:white; font-size:0.875rem; font-family:var(--font-display); font-weight:700; cursor:pointer; transition:opacity var(--transition-fast); margin-top:4px; }
        .quiz-option__submit--disabled { opacity:0.4; cursor:not-allowed; }
        .quiz-option__submit:not(.quiz-option__submit--disabled):hover { opacity:0.9; }

        /* Feedback banner */
        .quiz-card__feedback { position:relative; display:flex; align-items:center; gap:10px; padding:10px 16px; border-radius:var(--radius-md); font-size:0.875rem; font-weight:600; overflow:hidden; }
        .quiz-card__feedback--correct { background:rgba(34,197,94,0.12); color:#22c55e; border:1px solid rgba(34,197,94,0.3); }
        .quiz-card__feedback--wrong   { background:rgba(239,68,68,0.1);  color:#ef4444; border:1px solid rgba(239,68,68,0.3); }
        .quiz-card__feedback-icon { font-size:1.1rem; font-weight:800; flex-shrink:0; }
        .quiz-card__countdown { position:absolute; bottom:0; left:0; height:3px; width:100%; border-radius:0 0 var(--radius-md) var(--radius-md); background:currentColor; opacity:0.45; transform-origin:left; animation:countdownShrink 1.3s linear forwards; }
        @keyframes countdownShrink { from { transform:scaleX(1); } to { transform:scaleX(0); } }
      `}</style>
    </div>
  );
});

export default QuizCard;