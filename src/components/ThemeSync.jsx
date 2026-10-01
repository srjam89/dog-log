import { useEffect } from 'react';
import { useAppStore } from '../store';

export function ThemeSync({ children }) {
  const themeMode = useAppStore((state) => state.themeMode);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const systemDark = media.matches;
      const isDark =
        themeMode === 'dark' || (themeMode === 'system' && systemDark);
      document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    };

    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [themeMode]);

  return children;
}
