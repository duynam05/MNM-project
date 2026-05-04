import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const HistoryContext = createContext();

export const HistoryProvider = ({ children }) => {
  const [viewedCategories, setViewedCategories] = useState(() => {
    const saved = localStorage.getItem('viewedCategories');
    return saved ? JSON.parse(saved) : [];
  });

  const addToHistory = useCallback((category) => {
    if (!category) return;

    setViewedCategories((current) => {
      if (current.includes(category)) {
        return current;
      }

      const next = [category, ...current].slice(0, 5);
      localStorage.setItem('viewedCategories', JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ viewedCategories, addToHistory }),
    [viewedCategories, addToHistory],
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

export const useHistory = () => useContext(HistoryContext);
