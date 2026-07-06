const storageKey = 'mum-sgpa-calculator';
const recentKey = 'mum-sgpa-calculator:recent';

const safeJsonParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const loadStoredState = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return safeJsonParse(window.localStorage.getItem(storageKey), null);
};

export const saveStoredState = (state) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(storageKey, JSON.stringify(state));
};

export const loadRecentCalculations = () => {
  if (typeof window === 'undefined') {
    return [];
  }
  return safeJsonParse(window.localStorage.getItem(recentKey), []);
};

export const saveRecentCalculation = (entry) => {
  if (typeof window === 'undefined') {
    return;
  }
  const current = loadRecentCalculations();
  const next = [entry, ...current].slice(0, 8);
  window.localStorage.setItem(recentKey, JSON.stringify(next));
};

export const storageKeys = { storageKey, recentKey };