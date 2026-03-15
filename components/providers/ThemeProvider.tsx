'use client';

import { useCallback, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="algoviz-theme"
    >
      {children}
    </NextThemesProvider>
  );
}

/** Stable theme only after mount so server and first client render match (avoids hydration mismatch). */
export function useTheme() {
  const { resolvedTheme, setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;
  const toggle = useCallback(
    () => setTheme(isDark ? 'light' : 'dark'),
    [isDark, setTheme]
  );
  return { isDark, toggle };
}
