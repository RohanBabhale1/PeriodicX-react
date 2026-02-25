import { createContext, useContext, useState, useCallback } from 'react';
import elementsData from '../data/elements.json';

const ElementContext = createContext(null);

export function ElementProvider({ children }) {
  const [selectedElement,    setSelectedElement]    = useState(null);
  const [comparisonElements, setComparisonElements] = useState([null, null]);
  const [searchQuery,        setSearchQuery]        = useState('');

  const openElement  = useCallback((element) => setSelectedElement(element), []);
  const closeElement = useCallback(() => setSelectedElement(null), []);

  const setComparisonSlot = useCallback((slot, element) => {
    setComparisonElements((prev) => {
      const next = [...prev];
      next[slot] = element;
      return next;
    });
  }, []);

  const clearComparison = useCallback(() => setComparisonElements([null, null]), []);

  return (
    <ElementContext.Provider value={{
      elements: elementsData,
      selectedElement, comparisonElements, searchQuery,
      setSearchQuery, openElement, closeElement,
      setComparisonSlot, clearComparison,
    }}>
      {children}
    </ElementContext.Provider>
  );
}

export function useElements() {
  const ctx = useContext(ElementContext);
  if (!ctx) throw new Error('useElements must be used inside ElementProvider');
  return ctx;
}

export default ElementContext;