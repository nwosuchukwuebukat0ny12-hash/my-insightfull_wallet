import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'spendwise-theme';

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  const resolved = theme === 'system' ? getSystemTheme() : theme;

  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  }, []);

  // Apply theme on mount and listen for system changes
  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;

  return { theme, setTheme, resolvedTheme };
};
