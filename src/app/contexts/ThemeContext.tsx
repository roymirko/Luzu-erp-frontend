import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Cargar tema desde localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Guardar tema en localStorage
    localStorage.setItem('theme', theme);

    // Determinar si debe estar en modo oscuro
    if (theme === 'auto') {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(darkModeMediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
      darkModeMediaQuery.addEventListener('change', handler);
      return () => darkModeMediaQuery.removeEventListener('change', handler);
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}