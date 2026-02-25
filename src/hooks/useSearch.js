import { useMemo } from 'react';
import useDebounce from './useDebounce';

// Returns Set<atomicNumber> of matches, or null if no active query
function useSearch(elements, query) {
  const debouncedQuery = useDebounce(query, 250);

  return useMemo(() => {
    if (!debouncedQuery.trim()) return null;
    const q = debouncedQuery.trim().toLowerCase();
    return new Set(
      elements
        .filter((el) =>
          el.name.toLowerCase().includes(q) ||
          el.symbol.toLowerCase() === q ||
          String(el.atomicNumber) === q
        )
        .map((el) => el.atomicNumber)
    );
  }, [elements, debouncedQuery]);
}

export default useSearch;