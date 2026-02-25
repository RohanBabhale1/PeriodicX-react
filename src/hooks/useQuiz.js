import { useReducer, useCallback, useMemo } from "react";

export const QUIZ_MODES = {
  SYMBOL_TO_NAME: "symbol_to_name",
  NAME_TO_SYMBOL: "name_to_symbol",
  CATEGORY: "category",
  PROPERTY: "property",
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestion(element, allElements, mode) {
  const wrong = shuffle(
    allElements.filter((e) => e.atomicNumber !== element.atomicNumber),
  ).slice(0, 3);

  switch (mode) {
    case QUIZ_MODES.SYMBOL_TO_NAME:
      return {
        id: `${element.atomicNumber}-stn`,
        mode,
        prompt: element.symbol,
        promptType: "symbol",
        promptLabel: "What element has this symbol?",
        hint: `Atomic number: ${element.atomicNumber}`,
        correct: element.name,
        options: shuffle([element.name, ...wrong.map((e) => e.name)]),
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
        options: shuffle([element.symbol, ...wrong.map((e) => e.symbol)]),
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
        options: shuffle([
          element.category,
          ...shuffle([
            "alkali-metal",
            "alkaline-earth-metal",
            "transition-metal",
            "nonmetal",
            "noble-gas",
            "lanthanide",
            "actinide",
            "halogen",
            "metalloid",
            "post-transition-metal",
          ])
            .filter((c) => c !== element.category)
            .slice(0, 3),
        ]),
        formatOption: (v) =>
          v.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        element,
      };

    case QUIZ_MODES.PROPERTY:
    default: {
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
          wrongs: wrong.map((e) => String(e.period)),
        },
      ];
      const prop = propList[Math.floor(Math.random() * propList.length)];
      return {
        id: `${element.atomicNumber}-prop`,
        mode,
        prompt: element.name,
        promptType: "name",
        promptLabel: `What is the ${prop.label} of ${element.name}?`,
        hint: `Symbol: ${element.symbol}`,
        correct: prop.value,
        options: shuffle([prop.value, ...prop.wrongs]),
        element,
      };
    }
  }
}

const initialState = {
  questions: [],
  currentIndex: 0,
  selected: null,
  score: 0,
  streak: 0,
  bestStreak: 0,
  answers: [],
  phase: "idle",
  mode: QUIZ_MODES.SYMBOL_TO_NAME,
  totalQuestions: 10,
};

function quizReducer(state, action) {
  switch (action.type) {
    case "SET_TOTAL":
      return { ...state, totalQuestions: action.total };
    case "START":
      return {
        ...initialState,
        phase: "playing",
        mode: action.mode,
        totalQuestions: action.total,
        questions: action.questions,
      };
    case "SELECT": {
      if (state.selected !== null) return state;
      const q = state.questions[state.currentIndex];
      const isCorrect = action.answer === q.correct;
      const newStreak = isCorrect ? state.streak + 1 : 0;
      return {
        ...state,
        selected: action.answer,
        score: isCorrect ? state.score + 1 : state.score,
        streak: newStreak,
        bestStreak: Math.max(newStreak, state.bestStreak),
        answers: [
          ...state.answers,
          { question: q, answer: action.answer, correct: isCorrect },
        ],
      };
    }
    case "NEXT":
      if (state.currentIndex + 1 >= state.questions.length)
        return { ...state, phase: "result", selected: null };
      return { ...state, currentIndex: state.currentIndex + 1, selected: null };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

function useQuiz(elements) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const start = useCallback(
    (mode, total = 10) => {
      const pool = shuffle(elements).slice(0, total);
      const questions = pool.map((el) => generateQuestion(el, elements, mode));
      dispatch({ type: "START", mode, total, questions });
    },
    [elements],
  );

  const setTotal = useCallback(
    (total) => dispatch({ type: "SET_TOTAL", total }),
    [],
  );
  const select = useCallback(
    (answer) => dispatch({ type: "SELECT", answer }),
    [],
  );
  const next = useCallback(() => dispatch({ type: "NEXT" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const currentQuestion = useMemo(
    () => state.questions[state.currentIndex] ?? null,
    [state.questions, state.currentIndex],
  );

  const progress = useMemo(
    () =>
      state.questions.length > 0
        ? ((state.currentIndex + (state.selected !== null ? 1 : 0)) /
            state.questions.length) *
          100
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
    next,
    reset,
  };
}

export default useQuiz;
