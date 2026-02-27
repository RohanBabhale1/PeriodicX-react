import { Suspense, lazy, useCallback, useEffect, useRef } from "react";
import { useElements } from "../context/ElementContext";
import useQuiz, { QUIZ_MODES } from "../hooks/useQuiz";

const QuizCard = lazy(() => import("../components/quiz/QuizCard"));

// How long the feedback banner stays before auto-advancing
const AUTO_ADVANCE_DELAY = 1300;

const MODE_CONFIG = {
  // ── Original modes ──────────────────────────────────────────────────────
  [QUIZ_MODES.SYMBOL_TO_NAME]: {
    label: "Symbol → Name",
    icon:  "⚛",
    desc:  "Given the symbol, name the element",
  },
  [QUIZ_MODES.NAME_TO_SYMBOL]: {
    label: "Name → Symbol",
    icon:  "🔤",
    desc:  "Given the name, find its symbol",
  },
  [QUIZ_MODES.CATEGORY]: {
    label: "Category",
    icon:  "🏷",
    desc:  "Identify the element's category",
  },
  [QUIZ_MODES.PROPERTY]: {
    label: "Properties",
    icon:  "📊",
    desc:  "Guess atomic number, mass, period, state and more",
  },
  // ── New realistic modes ─────────────────────────────────────────────────
  [QUIZ_MODES.PROPERTY_TO_ELEMENT]: {
    label: "Value → Element",
    icon:  "🔢",
    desc:  "Given a property value (density, electronegativity…), identify the element",
  },
  [QUIZ_MODES.CLUE_BASED]: {
    label: "Element Riddle",
    icon:  "🔍",
    desc:  "Read 3 factual clues and figure out which element is described",
  },
  [QUIZ_MODES.TREND_COMPARISON]: {
    label: "Periodic Trends",
    icon:  "📈",
    desc:  "Pick which element has the highest or lowest value for a given property",
  },
  [QUIZ_MODES.MULTI_SELECT]: {
    label: "Select All",
    icon:  "☑",
    desc:  "Select ALL elements from a list that satisfy a given condition",
  },
};

const TOTAL_OPTIONS = [5, 10, 15, 20];

function ScoreRing({ percentage }) {
  const r = 36, circumference = 2 * Math.PI * r;
  const dash  = (percentage / 100) * circumference;
  const color = percentage >= 80 ? "#22c55e" : percentage >= 50 ? "#eab308" : "#ef4444";
  return (
    <svg width="104" height="104" viewBox="0 0 104 104" aria-label={`Score: ${percentage}%`}>
      <circle cx="52" cy="52" r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
      <circle cx="52" cy="52" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
        transform="rotate(-90 52 52)" style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x="52" y="48" textAnchor="middle" fontFamily="var(--font-display)" fontSize="20" fontWeight="800" fill={color}>{percentage}%</text>
      <text x="52" y="64" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10" fill="var(--text-muted)">score</text>
    </svg>
  );
}

// ── Review row helpers ────────────────────────────────────────────────────────
function formatReviewPrompt(question) {
  if (question.multiSelect)           return `Select all: ${question.correctAnswers?.join(', ')}`;
  if (question.promptType === 'clue') return `${question.element.name} (riddle)`;
  if (question.promptType === 'trend' || question.promptType === 'property')
                                      return question.prompt.length > 40
                                        ? question.prompt.slice(0, 40) + '…'
                                        : question.prompt;
  return question.prompt;
}

function formatReviewCorrect(question) {
  if (question.multiSelect)  return question.correctAnswers?.join(', ') ?? question.correct;
  if (question.formatOption) return question.formatOption(question.correct);
  return question.correct;
}

function formatReviewYours(answer, question) {
  if (question.multiSelect)  return answer.split('|').join(', ');
  if (question.formatOption) return question.formatOption(answer);
  return answer;
}

export default function QuizPage() {
  const { elements } = useElements();
  const quiz = useQuiz(elements);

  const handleStart = useCallback(
    (mode) => { if (quiz.totalQuestions) quiz.start(mode, quiz.totalQuestions); },
    [quiz],
  );

  // Auto-advance after answer — works for both single and multi-select
  // (multi-select sets quiz.selected when submitted, same signal)
  const autoAdvanceTimer = useRef(null);
  useEffect(() => {
    if (quiz.selected !== null) {
      autoAdvanceTimer.current = setTimeout(() => quiz.next(), AUTO_ADVANCE_DELAY);
    }
    return () => clearTimeout(autoAdvanceTimer.current);
  }, [quiz.selected, quiz.currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build feedback for current question
  const q = quiz.phase === "playing" ? quiz.currentQuestion : null;
  const feedback = q && quiz.selected
    ? (() => {
        const isCorrect = quiz.selected === q.correct;
        let message;
        if (q.multiSelect) {
          message = isCorrect
            ? `Correct! All ${q.correctAnswers?.length} answers selected`
            : `Answer: ${q.correctAnswers?.join(', ')}`;
        } else {
          message = isCorrect
            ? `Correct! ${q.element.name} (${q.element.symbol})`
            : `Answer: ${q.formatOption ? q.formatOption(q.correct) : q.correct}`;
        }
        return { type: isCorrect ? "correct" : "wrong", message };
      })()
    : null;

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (quiz.phase === "idle") {
    return (
      <main className="quiz-page" role="main">
        <div className="quiz-container animate-slideUp">
          <div className="quiz-header">
            <h1 className="quiz-title">
              <span className="quiz-title-gradient">Element</span> Quiz
            </h1>
            <p className="quiz-subtitle">Test your chemistry knowledge across all 118 elements</p>
          </div>

          <div className="quiz-setup">
            <span className="quiz-setup__label">How many questions?</span>
            <div className="quiz-setup__options">
              {TOTAL_OPTIONS.map((n) => (
                <button
                  key={n}
                  className={`total-pill ${quiz.totalQuestions === n ? "total-pill--active" : ""}`}
                  onClick={() => quiz.setTotal(n)}
                  aria-pressed={quiz.totalQuestions === n}
                >
                  {n}
                </button>
              ))}
            </div>
            {!quiz.totalQuestions && (
              <p className="quiz-setup__hint">Select a number above to unlock quiz modes</p>
            )}
          </div>

          <div className={`mode-grid${!quiz.totalQuestions ? " mode-grid--locked" : ""}`}>
            {Object.entries(MODE_CONFIG).map(([mode, cfg]) => (
              <button
                key={mode}
                className="mode-card"
                onClick={() => handleStart(mode)}
                disabled={!quiz.totalQuestions}
              >
                <span className="mode-card__icon">{cfg.icon}</span>
                <span className="mode-card__label">{cfg.label}</span>
                <span className="mode-card__desc">{cfg.desc}</span>
                <span className="mode-card__cta">{quiz.totalQuestions ? "Start →" : "🔒"}</span>
              </button>
            ))}
          </div>
        </div>
        <QuizCSS />
      </main>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (quiz.phase === "result") {
    const grade =
      quiz.percentage >= 90 ? { label: "Excellent!", emoji: "🏆", color: "#22c55e" }
      : quiz.percentage >= 70 ? { label: "Good job!",   emoji: "🎉", color: "#3b82f6" }
      : quiz.percentage >= 50 ? { label: "Keep going!", emoji: "📚", color: "#eab308" }
      :                         { label: "Study more!", emoji: "🔬", color: "#ef4444" };
    return (
      <main className="quiz-page" role="main">
        <div className="quiz-container animate-scaleIn">
          <div className="result-card">
            <div className="result-top">
              <span className="result-emoji">{grade.emoji}</span>
              <h2 className="result-grade" style={{ color: grade.color }}>{grade.label}</h2>
            </div>
            <ScoreRing percentage={quiz.percentage} />
            <div className="result-stats">
              {[
                { label: "Correct",     value: quiz.score,                         color: "#22c55e" },
                { label: "Wrong",       value: quiz.questions.length - quiz.score, color: "#ef4444" },
                { label: "Best Streak", value: `🔥 ${quiz.bestStreak}`,            color: "#f97316" },
              ].map((s) => (
                <div key={s.label} className="result-stat">
                  <span className="result-stat__value" style={{ color: s.color }}>{s.value}</span>
                  <span className="result-stat__label">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="result-review">
              <p className="result-review__heading">Review</p>
              <div className="result-review__list">
                {quiz.answers.map((a, i) => (
                  <div key={i} className={`review-row review-row--${a.correct ? "ok" : "bad"}`}>
                    <span className="review-row__icon">{a.correct ? "✓" : "✕"}</span>
                    <span className="review-row__q">{formatReviewPrompt(a.question)}</span>
                    <span className="review-row__answer">{formatReviewCorrect(a.question)}</span>
                    {!a.correct && (
                      <span className="review-row__yours">
                        (you: {formatReviewYours(a.answer, a.question)})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="result-actions">
              <button className="result-btn result-btn--primary"
                onClick={() => quiz.start(quiz.mode, quiz.totalQuestions)}>
                Play Again
              </button>
              <button className="result-btn result-btn--secondary" onClick={quiz.reset}>
                Change Mode
              </button>
            </div>
          </div>
        </div>
        <QuizCSS />
      </main>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────
  if (!q) return null;
  return (
    <main className="quiz-page" role="main">
      <div className="quiz-container quiz-container--playing">
        <div className="quiz-topbar">
          <div className="quiz-progress-wrap">
            <div className="quiz-progress-bar" role="progressbar"
              aria-valuenow={Math.round(quiz.progress)} aria-valuemin={0} aria-valuemax={100}>
              <div className="quiz-progress-fill" style={{ width: `${quiz.progress}%` }} />
            </div>
            <span className="quiz-progress-label">
              {quiz.currentIndex + 1} / {quiz.questions.length}
            </span>
          </div>
          <div className="quiz-score-row">
            <span className="quiz-score-val">✓ {quiz.score}</span>
            {quiz.streak >= 2 && <span className="quiz-streak-mini">🔥{quiz.streak}</span>}
          </div>
        </div>

        <Suspense fallback={null}>
          <QuizCard
            question={q}
            selected={quiz.selected}
            multiSelected={quiz.multiSelected}
            onSelect={quiz.select}
            onToggleMulti={quiz.toggleMulti}
            onSubmitMulti={quiz.submitMulti}
            streak={quiz.streak}
            feedback={feedback}
          />
        </Suspense>
      </div>
      <QuizCSS />
    </main>
  );
}

function QuizCSS() {
  return (
    <style>{`
    .quiz-page { flex:1; display:flex; padding:0; }

    /* shared container */
    .quiz-container { max-width:600px; margin:0 auto; padding:40px 20px; width:100%; display:flex; flex-direction:column; gap:24px; }

    /* playing view: compact vertical layout, no overflow */
    .quiz-container--playing { max-width:560px; padding:20px 20px; gap:18px; }

    .quiz-header { text-align:center; display:flex; flex-direction:column; gap:10px; }
    .quiz-title { font-family:var(--font-display); font-size:clamp(2rem,5vw,3rem); font-weight:800; color:var(--text-primary); letter-spacing:-0.03em; }
    .quiz-title-gradient { background:linear-gradient(135deg,#22d3ee,#3b82f6,#8b5cf6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .quiz-subtitle { font-size:0.875rem; color:var(--text-muted); }
    .quiz-setup { display:flex; flex-direction:column; align-items:center; gap:8px; }
    .quiz-setup__label { font-size:0.68rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); font-weight:700; font-family:var(--font-display); }
    .quiz-setup__options { display:flex; gap:6px; }
    .quiz-setup__hint { font-size:0.72rem; color:var(--text-muted); font-style:italic; margin-top:2px; }
    .total-pill { width:44px; height:34px; border-radius:var(--radius-md); border:1px solid var(--border-medium); background:var(--bg-secondary); color:var(--text-secondary); font-size:0.82rem; font-family:var(--font-mono); font-weight:700; cursor:pointer; transition:all var(--transition-fast); }
    .total-pill:hover { border-color:var(--accent); color:var(--accent); background:var(--accent-glow); }
    .total-pill--active { border-color:var(--accent)!important; color:var(--accent)!important; background:var(--accent-glow)!important; }
    .mode-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .mode-grid--locked .mode-card { opacity:0.4; pointer-events:none; filter:grayscale(0.4); }
    .mode-card { display:flex; flex-direction:column; align-items:flex-start; gap:5px; padding:18px; border-radius:var(--radius-lg); border:1px solid var(--border-medium); background:var(--bg-secondary); cursor:pointer; transition:all var(--transition-fast); text-align:left; }
    .mode-card:not(:disabled):hover { border-color:var(--accent); transform:translateY(-3px); box-shadow:var(--shadow-md); }
    .mode-card__icon  { font-size:1.6rem; margin-bottom:4px; }
    .mode-card__label { font-family:var(--font-display); font-size:0.95rem; font-weight:700; color:var(--text-primary); }
    .mode-card__desc  { font-size:0.72rem; color:var(--text-muted); line-height:1.4; }
    .mode-card__cta   { font-size:0.72rem; color:var(--accent); font-weight:600; margin-top:4px; }
    .quiz-topbar { display:flex; align-items:center; gap:16px; flex-shrink:0; }
    .quiz-progress-wrap { flex:1; display:flex; flex-direction:column; gap:4px; }
    .quiz-progress-bar { height:6px; background:var(--bg-tertiary); border-radius:3px; overflow:hidden; }
    .quiz-progress-fill { height:100%; background:linear-gradient(90deg,#3b82f6,#8b5cf6); border-radius:3px; transition:width 400ms ease; }
    .quiz-progress-label { font-family:var(--font-mono); font-size:0.65rem; color:var(--text-muted); }
    .quiz-score-row { display:flex; gap:10px; font-family:var(--font-display); font-size:0.85rem; font-weight:700; color:var(--text-secondary); flex-shrink:0; }
    .quiz-streak-mini { color:#f97316; }
    .result-card { display:flex; flex-direction:column; align-items:center; gap:20px; background:var(--bg-secondary); border:1px solid var(--border-medium); border-radius:var(--radius-xl); padding:32px; }
    .result-top { display:flex; flex-direction:column; align-items:center; gap:8px; }
    .result-emoji { font-size:2.8rem; animation:float 2s ease-in-out infinite; display:block; }
    .result-grade { font-family:var(--font-display); font-size:1.9rem; font-weight:800; }
    .result-stats { display:flex; gap:28px; }
    .result-stat { display:flex; flex-direction:column; align-items:center; gap:4px; }
    .result-stat__value { font-family:var(--font-display); font-size:1.5rem; font-weight:800; }
    .result-stat__label { font-size:0.68rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; }
    .result-review { width:100%; }
    .result-review__heading { font-family:var(--font-display); font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:10px; }
    .result-review__list { display:flex; flex-direction:column; gap:4px; max-height:210px; overflow-y:auto; }
    .review-row { display:flex; align-items:center; gap:8px; padding:7px 10px; border-radius:var(--radius-sm); font-size:0.78rem; flex-wrap:wrap; }
    .review-row--ok  { background:rgba(34,197,94,0.08); }
    .review-row--bad { background:rgba(239,68,68,0.08); }
    .review-row__icon { font-weight:700; font-size:0.7rem; flex-shrink:0; }
    .review-row--ok  .review-row__icon { color:#22c55e; }
    .review-row--bad .review-row__icon { color:#ef4444; }
    .review-row__q { font-family:var(--font-mono); color:var(--text-muted); font-size:0.72rem; flex-shrink:0; max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .review-row__answer { font-weight:600; color:var(--text-primary); flex:1; }
    .review-row__yours  { font-size:0.68rem; color:#ef4444; flex-shrink:0; }
    .result-actions { display:flex; gap:10px; }
    .result-btn { padding:10px 24px; border-radius:var(--radius-md); font-size:0.875rem; font-family:var(--font-display); font-weight:700; cursor:pointer; transition:all var(--transition-fast); border:none; }
    .result-btn--primary   { background:var(--accent); color:white; }
    .result-btn--primary:hover { background:var(--accent-hover); transform:translateY(-1px); }
    .result-btn--secondary { background:var(--bg-tertiary); color:var(--text-secondary); border:1px solid var(--border-medium); }
    .result-btn--secondary:hover { border-color:var(--accent); color:var(--accent); }
    @media (max-width:480px) { .mode-grid { grid-template-columns:1fr; } .result-stats { gap:16px; } .result-card { padding:20px; } }
  `}</style>
  );
}