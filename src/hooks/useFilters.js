import { useMemo, useCallback, useReducer } from 'react';

const initialFilters = {
  categories: [],
  blocks: [],
  periods: [],
  groups: [],
  states: [],
  radioactive: null, // null = any, true = radioactive only, false = stable only
};

function filtersReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_MULTI': {
      const { key, value } = action;
      const current = state[key];
      return {
        ...state,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    }
    case 'SET_RADIOACTIVE':
      return { ...state, radioactive: action.value };
    case 'RESET':
      return initialFilters;
    default:
      return state;
  }
}

function useFilters(elements) {
  const [filters, dispatch] = useReducer(filtersReducer, initialFilters);

  const toggleFilter   = useCallback((key, value) => dispatch({ type: 'TOGGLE_MULTI', key, value }), []);
  const setRadioactive = useCallback((value) => dispatch({ type: 'SET_RADIOACTIVE', value }), []);
  const resetFilters   = useCallback(() => dispatch({ type: 'RESET' }), []);

  const isFilterActive = useMemo(() =>
    filters.categories.length > 0 || filters.blocks.length > 0 ||
    filters.periods.length > 0 || filters.groups.length > 0 ||
    filters.states.length > 0 || filters.radioactive !== null,
  [filters]);

  // Returns Set<atomicNumber> or null if no filter active
  const filteredNumbers = useMemo(() => {
    if (!isFilterActive) return null;
    return new Set(
      elements.filter((el) => {
        if (filters.categories.length > 0 && !filters.categories.includes(el.category)) return false;
        if (filters.blocks.length > 0 && !filters.blocks.includes(el.block)) return false;
        if (filters.periods.length > 0 && !filters.periods.includes(el.period)) return false;
        if (filters.groups.length > 0 && !filters.groups.includes(el.group)) return false;
        if (filters.states.length > 0 && !filters.states.includes(el.stateAtRoomTemp)) return false;
        if (filters.radioactive !== null && el.isRadioactive !== filters.radioactive) return false;
        return true;
      }).map((el) => el.atomicNumber)
    );
  }, [elements, filters, isFilterActive]);

  return { filters, filteredNumbers, isFilterActive, toggleFilter, setRadioactive, resetFilters };
}

export default useFilters;