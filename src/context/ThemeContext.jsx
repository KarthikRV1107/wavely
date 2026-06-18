import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'wv_theme';
const THEMES = ['warm-dark', 'paper-light'];

const Ctx = createContext(null);

const getInitialTheme = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return THEMES.includes(saved) ? saved : 'warm-dark';
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => current === 'warm-dark' ? 'paper-light' : 'warm-dark');
  };

  const value = useMemo(() => ({
    theme,
    isLight: theme === 'paper-light',
    toggleTheme,
  }), [theme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const value = useContext(Ctx);
  if (!value) throw new Error('useTheme must be inside ThemeProvider');
  return value;
}
