import { useReducer, useCallback, useMemo } from "react";

export const QUIZ_MODES = {
  SYMBOL_TO_NAME:       "symbol_to_name",
  NAME_TO_SYMBOL:       "name_to_symbol",
  CATEGORY:             "category",
  PROPERTY:             "property",
  PROPERTY_TO_ELEMENT:  "property_to_element",
  CLUE_BASED:           "clue_based",
  TREND_COMPARISON:     "trend_comparison",
  MULTI_SELECT:         "multi_select",
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Deduplicated options builder — guarantees no repeated values in the 4 choices
function buildOptions(correct, wrongPool, count = 3) {
  const seen = new Set([String(correct)]);
  const uniqueWrongs = [];
  for (const w of wrongPool) {
    const key = String(w);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueWrongs.push(w);
      if (uniqueWrongs.length === count) break;
    }
  }
  return shuffle([correct, ...uniqueWrongs]);
}

// ── Clue builders for CLUE_BASED mode ────────────────────────────────────────
const CLUE_BUILDERS = [
  el => el.period                         ? `I am in period ${el.period}`                                              : null,
  el => el.group                          ? `My group number is ${el.group}`                                           : null,
  el => el.category                       ? `I am classified as a ${el.category.replace(/-/g, ' ')}`                  : null,
  el => el.stateAtRoomTemp                ? `I am ${el.stateAtRoomTemp.toLowerCase()} at room temperature`             : null,
  el => el.block                          ? `I am a ${el.block.toUpperCase()}-block element`                           : null,
  el => el.electronegativity              ? `My electronegativity is ${el.electronegativity} on the Pauling scale`    : null,
  el => el.atomicMass                     ? `My atomic mass is approximately ${Math.round(parseFloat(el.atomicMass))} u` : null,
  el => el.discoveredBy                   ? `I was discovered by ${el.discoveredBy}`                                   : null,
  el => el.discoveryYear                  ? `I was first identified in ${el.discoveryYear}`                            : null,
  el => el.uses && el.uses.length         ? `One of my common uses is: ${el.uses[0]}`                                 : null,
  el => el.meltingPoint                   ? `My melting point is ${el.meltingPoint}°C`                                : null,
];

// ── Trend definitions for TREND_COMPARISON and PROPERTY_TO_ELEMENT ───────────
const TREND_DEFS = [
  {
    key:     'electronegativity',
    label:   'highest electronegativity',
    dir:     'high',
    format:  v => `${v} (Pauling scale)`,
    propLabel: 'electronegativity',
  },
  {
    key:     'electronegativity',
    label:   'lowest electronegativity',
    dir:     'low',
    format:  v => `${v} (Pauling scale)`,
    propLabel: 'electronegativity',
  },
  {
    key:     'meltingPoint',
    label:   'highest melting point',
    dir:     'high',
    format:  v => `${v}°C`,
    propLabel: 'melting point',
  },
  {
    key:     'meltingPoint',
    label:   'lowest melting point',
    dir:     'low',
    format:  v => `${v}°C`,
    propLabel: 'melting point',
  },
  {
    key:     'boilingPoint',
    label:   'highest boiling point',
    dir:     'high',
    format:  v => `${v}°C`,
    propLabel: 'boiling point',
  },
  {
    key:     'density',
    label:   'highest density',
    dir:     'high',
    format:  v => `${v} g/cm³`,
    propLabel: 'density',
  },
  {
    key:     'density',
    label:   'lowest density (among those listed)',
    dir:     'low',
    format:  v => `${v} g/cm³`,
    propLabel: 'density',
  },
  {
    key:     'atomicMass',
    label:   'largest atomic mass',
    dir:     'high',
    format:  v => `${v} u`,
    propLabel: 'atomic mass',
  },
];

// ── Multi-select condition definitions ────────────────────────────────────────
const MULTI_CONDITIONS = [
  { label: 'noble gases',                  filter: e => e.category === 'noble-gas'            },
  { label: 'alkali metals',                filter: e => e.category === 'alkali-metal'          },
  { label: 'halogens',                     filter: e => e.category === 'halogen'               },
  { label: 'alkaline earth metals',        filter: e => e.category === 'alkaline-earth-metal'  },
  { label: 'metalloids',                   filter: e => e.category === 'metalloid'             },
  { label: 'elements in period 2',         filter: e => e.period === 2                         },
  { label: 'elements in period 3',         filter: e => e.period === 3                         },
  { label: 'gases at room temperature',    filter: e => e.stateAtRoomTemp === 'Gas'            },
  { label: 'liquids at room temperature',  filter: e => e.stateAtRoomTemp === 'Liquid'         },
  { label: 'transition metals',            filter: e => e.category === 'transition-metal'      },
  { label: 'lanthanides',                  filter: e => e.category === 'lanthanide'            },
  { label: 'actinides',                    filter: e => e.category === 'actinide'              },
];

function generateQuestion(element, allElements, mode) {
  const wrong = shuffle(
    allElements.filter((e) => e.atomicNumber !== element.atomicNumber),
  );

  switch (mode) {

    // ── Existing modes ────────────────────────────────────────────────────────

    case QUIZ_MODES.SYMBOL_TO_NAME:
      return {
        id: `${element.atomicNumber}-stn`,
        mode,
        prompt: element.symbol,
        promptType: "symbol",
        promptLabel: "What element has this symbol?",
        hint: `Atomic number: ${element.atomicNumber}`,
        correct: element.name,
        options: buildOptions(element.name, wrong.map((e) => e.name)),
        element,
      };

    case QUIZ_MODES.NAME_TO_SYMBOL:
      return {
        id: `${element.atomicNumber}-nts`,
        mode,
        prompt: element.name,
        promptType: "name",
        promptLabel: "What is the chemical symbol?",
        hint: `Period ${element.period}, Group ${element.group ?? "f-block"}`,
        correct: element.symbol,
        options: buildOptions(element.symbol, wrong.map((e) => e.symbol)),
        element,
      };

    case QUIZ_MODES.CATEGORY:
      return {
        id: `${element.atomicNumber}-cat`,
        mode,
        prompt: `${element.symbol} — ${element.name}`,
        promptType: "name",
        promptLabel: "What category is this element?",
        hint: `Period ${element.period}, Block ${element.block?.toUpperCase()}`,
        correct: element.category,
        options: buildOptions(element.category, shuffle([
          "alkali-metal", "alkaline-earth-metal", "transition-metal", "nonmetal",
          "noble-gas", "lanthanide", "actinide", "halogen", "metalloid", "post-transition-metal",
        ]).filter((c) => c !== element.category)),
        formatOption: (v) => v.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        element,
      };

    case QUIZ_MODES.PROPERTY: {
      const propList = [
        {
          label: "atomic mass (u)",
          value: String(element.atomicMass),
          wrongs: wrong.map((e) => String(e.atomicMass)),
        },
        {
          label: "atomic number",
          value: String(element.atomicNumber),
          wrongs: wrong.map((e) => String(e.atomicNumber)),
        },
        {
          label: "period",
          value: String(element.period),
          wrongs: (() => {
            const fromElements = wrong.map((e) => String(e.period));
            const staticPool = ["1","2","3","4","5","6","7"].filter(
              (p) => p !== String(element.period)
            );
            return [...new Set([...fromElements, ...staticPool])];
          })(),
        },
        // Extended property questions
        ...(element.electronegativity != null ? [{
          label: "electronegativity (Pauling scale)",
          value: String(element.electronegativity),
          wrongs: wrong.filter(e => e.electronegativity != null).map(e => String(e.electronegativity)),
        }] : []),
        ...(element.stateAtRoomTemp ? [{
          label: "state at room temperature",
          value: element.stateAtRoomTemp,
          wrongs: ["Solid", "Liquid", "Gas"].filter(s => s !== element.stateAtRoomTemp),
        }] : []),
        ...(element.block ? [{
          label: "electron block",
          value: element.block.toUpperCase(),
          wrongs: ["S", "P", "D", "F"].filter(b => b !== element.block.toUpperCase()),
        }] : []),
      ];
      const prop = propList[Math.floor(Math.random() * propList.length)];
      return {
        id: `${element.atomicNumber}-prop`,
        mode,
        prompt: element.name,
        promptType: "name",
        promptLabel: `What is the ${prop.label} of ${element.name}?`,
        hint: `Symbol: ${element.symbol}, Period: ${element.period}`,
        correct: prop.value,
        options: buildOptions(prop.value, prop.wrongs),
        element,
      };
    }

    // ── New realistic modes ───────────────────────────────────────────────────

    // Given a specific property value, identify the matching element
    case QUIZ_MODES.PROPERTY_TO_ELEMENT: {
      const available = TREND_DEFS.filter(t => element[t.key] != null);
      if (!available.length) {
        // Fallback to symbol→name if no properties available
        return {
          id: `${element.atomicNumber}-pte-fb`,
          mode,
          prompt: element.symbol,
          promptType: "symbol",
          promptLabel: "What element has this symbol?",
          hint: `Atomic number: ${element.atomicNumber}`,
          correct: element.name,
          options: buildOptions(element.name, wrong.map(e => e.name)),
          element,
        };
      }
      const trend = available[Math.floor(Math.random() * available.length)];
      const value  = element[trend.key];
      // Wrong options: elements that have a different value for this property
      const wrongPool = wrong
        .filter(e => e[trend.key] != null && String(e[trend.key]) !== String(value))
        .slice(0, 3);

      return {
        id: `${element.atomicNumber}-pte`,
        mode,
        prompt: trend.format(value),
        promptType: "property",
        promptLabel: `Which element has this ${trend.propLabel}?`,
        hint: `${element.category.replace(/-/g, ' ')} · Period ${element.period}`,
        correct: element.name,
        options: buildOptions(element.name, wrongPool.map(e => e.name)),
        element,
      };
    }

    // Riddle: show 3 factual clues about an element, student identifies it
    case QUIZ_MODES.CLUE_BASED: {
      const allClues = CLUE_BUILDERS.map(fn => fn(element)).filter(Boolean);
      // Always lead with a broad clue (period/category), then narrow
      const broadClues    = allClues.filter(c => c.includes('period') || c.includes('classified'));
      const specificClues = allClues.filter(c => !broadClues.includes(c));
      const picked = [
        ...shuffle(broadClues).slice(0, 1),
        ...shuffle(specificClues).slice(0, 2),
      ].slice(0, 3);

      // Fallback: if fewer than 2 clues, just use whatever is available
      const finalClues = picked.length >= 2 ? picked : shuffle(allClues).slice(0, 3);

      return {
        id: `${element.atomicNumber}-clue`,
        mode,
        prompt: finalClues.map((c, i) => `${i + 1}. ${c}`).join('\n'),
        promptType: "clue",
        promptLabel: "Which element am I? 🔍",
        hint: `Atomic number: ${element.atomicNumber}, Symbol: ${element.symbol}`,
        correct: element.name,
        options: buildOptions(element.name, wrong.map(e => e.name)),
        element,
      };
    }

    // Given 4 elements, pick the one with the highest or lowest property value
    case QUIZ_MODES.TREND_COMPARISON: {
      // Try different trends until we find one where all 4 candidates have valid values
      const shuffledTrends = shuffle([...TREND_DEFS]);
      let trend, candidates, winner;

      for (const t of shuffledTrends) {
        const pool = [element, ...wrong].filter(e => e[t.key] != null);
        if (pool.length < 4) continue;
        const picked = [pool[0], ...shuffle(pool.slice(1)).slice(0, 3)];
        const sorted = [...picked].sort((a, b) => {
          const av = parseFloat(a[t.key]), bv = parseFloat(b[t.key]);
          return t.dir === 'high' ? bv - av : av - bv;
        });
        trend      = t;
        candidates = picked;
        winner     = sorted[0];
        break;
      }

      // Ultimate fallback to symbol→name
      if (!trend) {
        return {
          id: `${element.atomicNumber}-trend-fb`,
          mode,
          prompt: element.symbol,
          promptType: "symbol",
          promptLabel: "What element has this symbol?",
          hint: `Atomic number: ${element.atomicNumber}`,
          correct: element.name,
          options: buildOptions(element.name, wrong.map(e => e.name)),
          element,
        };
      }

      return {
        id: `${element.atomicNumber}-trend`,
        mode,
        prompt: `Which of these elements has the ${trend.label}?`,
        promptType: "trend",
        promptLabel: "Periodic Trend 📈",
        hint: `${winner.name}: ${trend.format(winner[trend.key])}`,
        correct: winner.name,
        options: shuffle(candidates.map(e => e.name)),
        element: winner,
      };
    }

    // Select ALL elements from a list that satisfy a given condition
    case QUIZ_MODES.MULTI_SELECT: {
      // Find a condition that element itself satisfies (anchors variety across questions)
      const matchingConditions = MULTI_CONDITIONS.filter(c => c.filter(element));
      const condition = matchingConditions.length
        ? matchingConditions[Math.floor(Math.random() * matchingConditions.length)]
        : MULTI_CONDITIONS[Math.floor(Math.random() * MULTI_CONDITIONS.length)];

      const allMatching = allElements.filter(condition.filter);
      // Pick exactly 2 correct answers (element + 1 other matching element)
      const otherCorrect = shuffle(allMatching.filter(e => e.atomicNumber !== element.atomicNumber)).slice(0, 1);
      const correctEls = condition.filter(element)
        ? [element, ...otherCorrect]
        : shuffle(allMatching).slice(0, 2);

      // 4 wrong options: elements NOT matching the condition
      const wrongEls = shuffle(
        allElements.filter(e => !condition.filter(e) && !correctEls.find(c => c.atomicNumber === e.atomicNumber))
      ).slice(0, 4);

      const options    = shuffle([...correctEls, ...wrongEls]).map(e => e.name);
      const correctSet = correctEls.map(e => e.name).sort();
      const correctKey = correctSet.join('|');

      return {
        id: `${element.atomicNumber}-multi`,
        mode,
        multiSelect:    true,
        prompt:         `Select ALL ${condition.label} from the list below:`,
        promptType:     "multi",
        promptLabel:    "Select ALL that apply ✓",
        hint:           `Correct: ${correctSet.join(', ')}`,
        correct:        correctKey,                  // pipe-joined sorted string for comparison
        correctAnswers: correctSet,                  // array for display in review
        options,
        element:        correctEls[0],
      };
    }

    default:
      return {
        id: `${element.atomicNumber}-stn`,
        mode,
        prompt: element.symbol,
        promptType: "symbol",
        promptLabel: "What element has this symbol?",
        hint: `Atomic number: ${element.atomicNumber}`,
        correct: element.name,
        options: buildOptions(element.name, wrong.map((e) => e.name)),
        element,
      };
  }
}

// ── Initial state ─────────────────────────────────────────────────────────────
const initialState = {
  questions:     [],
  currentIndex:  0,
  selected:      null,      // single-select answer OR submitted multi-select key
  multiSelected: [],        // in-progress multi-select selections
  score:         0,
  streak:        0,
  bestStreak:    0,
  answers:       [],
  phase:         "idle",
  mode:          QUIZ_MODES.SYMBOL_TO_NAME,
  totalQuestions: null,
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function quizReducer(state, action) {
  switch (action.type) {

    case "SET_TOTAL":
      return { ...state, totalQuestions: action.total };

    case "START":
      return {
        ...initialState,
        phase:          "playing",
        mode:           action.mode,
        totalQuestions: action.total,
        questions:      action.questions,
      };

    // Single-select answer
    case "SELECT": {
      if (state.selected !== null) return state;
      const q          = state.questions[state.currentIndex];
      const isCorrect  = action.answer === q.correct;
      const newStreak  = isCorrect ? state.streak + 1 : 0;
      return {
        ...state,
        selected:   action.answer,
        score:      isCorrect ? state.score + 1 : state.score,
        streak:     newStreak,
        bestStreak: Math.max(newStreak, state.bestStreak),
        answers:    [
          ...state.answers,
          { question: q, answer: action.answer, correct: isCorrect },
        ],
      };
    }

    // Toggle one option in multi-select (before submit)
    case "TOGGLE_MULTI": {
      if (state.selected !== null) return state; // already submitted
      const already = state.multiSelected.includes(action.option);
      return {
        ...state,
        multiSelected: already
          ? state.multiSelected.filter(o => o !== action.option)
          : [...state.multiSelected, action.option],
      };
    }

    // Finalize multi-select — marks question as answered
    case "SUBMIT_MULTI": {
      if (state.selected !== null) return state;
      const q         = state.questions[state.currentIndex];
      const submitted = [...state.multiSelected].sort().join('|');
      const isCorrect = submitted === q.correct;
      const newStreak = isCorrect ? state.streak + 1 : 0;
      return {
        ...state,
        selected:   submitted,
        score:      isCorrect ? state.score + 1 : state.score,
        streak:     newStreak,
        bestStreak: Math.max(newStreak, state.bestStreak),
        answers:    [
          ...state.answers,
          { question: q, answer: submitted, correct: isCorrect },
        ],
      };
    }

    case "NEXT":
      if (state.currentIndex + 1 >= state.questions.length)
        return { ...state, phase: "result", selected: null, multiSelected: [] };
      return { ...state, currentIndex: state.currentIndex + 1, selected: null, multiSelected: [] };

    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
function useQuiz(elements) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const start = useCallback(
    (mode, total) => {
      if (!total) return;
      const pool      = shuffle(elements).slice(0, total);
      const questions = pool.map((el) => generateQuestion(el, elements, mode));
      dispatch({ type: "START", mode, total, questions });
    },
    [elements],
  );

  const setTotal    = useCallback((total)  => dispatch({ type: "SET_TOTAL",    total  }), []);
  const select      = useCallback((answer) => dispatch({ type: "SELECT",       answer }), []);
  const toggleMulti = useCallback((option) => dispatch({ type: "TOGGLE_MULTI", option }), []);
  const submitMulti = useCallback(()       => dispatch({ type: "SUBMIT_MULTI"         }), []);
  const next        = useCallback(()       => dispatch({ type: "NEXT"                 }), []);
  const reset       = useCallback(()       => dispatch({ type: "RESET"                }), []);

  const currentQuestion = useMemo(
    () => state.questions[state.currentIndex] ?? null,
    [state.questions, state.currentIndex],
  );

  const progress = useMemo(
    () =>
      state.questions.length > 0
        ? ((state.currentIndex + (state.selected !== null ? 1 : 0)) /
            state.questions.length) * 100
        : 0,
    [state.currentIndex, state.questions.length, state.selected],
  );

  const percentage = useMemo(
    () =>
      state.questions.length > 0
        ? Math.round((state.score / state.questions.length) * 100)
        : 0,
    [state.score, state.questions.length],
  );

  return {
    ...state,
    currentQuestion,
    progress,
    percentage,
    start,
    setTotal,
    select,
    toggleMulti,
    submitMulti,
    next,
    reset,
  };
}

export default useQuiz;