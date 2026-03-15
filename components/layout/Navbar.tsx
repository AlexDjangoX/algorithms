'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

export function Navbar() {
  const { isDark, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navBg = isDark
    ? 'bg-[hsl(240_20%_4%/0.8)] border-white/8'
    : 'bg-[hsl(0_0%_100%/0.8)] border-border';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 h-16 border-b transition-shadow duration-300 ${navBg} backdrop-blur-md ${scrolled ? 'shadow-md shadow-black/20' : ''}`}
      role="navigation"
      aria-label="Main"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="AlgoViz home"
        >
          <div className="relative h-7 w-7" aria-hidden>
            <div className="absolute inset-0 rounded-xs bg-primary rotate-12 opacity-80" />
            <div className="absolute inset-0.5 rounded-xs bg-accent -rotate-6 opacity-60" />
          </div>
          <span className="font-display text-base sm:text-lg font-bold tracking-tight text-foreground">
            AlgoViz
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggle}
            className="relative h-9 w-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Sun
              size={18}
              className={`absolute transition-all duration-200 ${isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`}
              aria-hidden
            />
            <Moon
              size={18}
              className={`absolute transition-all duration-200 ${isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
              aria-hidden
            />
          </button>
        </div>
      </div>
    </nav>
  );
}
