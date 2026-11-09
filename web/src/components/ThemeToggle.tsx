import { useEffect, useState } from 'react';
import { Moon, Sun } from '@phosphor-icons/react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'quench-theme';

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode can refuse storage; the theme still applies for this session.
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0B0C0E' : '#EDF0F6');
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  const next = theme === 'dark' ? 'day' : 'night';
  const label = `Switch to ${next} theme`;

  if (compact) {
    return (
      <button
        type="button"
        className="theme-toggle theme-toggle--compact"
        onClick={toggle}
        aria-label={label}
        title={label}
        data-testid="theme-toggle"
      >
        {theme === 'dark' ? (
          <Sun size={16} weight="bold" aria-hidden="true" />
        ) : (
          <Moon size={16} weight="bold" aria-hidden="true" />
        )}
      </button>
    );
  }

  return (
    <div className="theme-toggle" role="group" aria-label="Colour theme">
      <button
        type="button"
        className={`theme-toggle__option${theme === 'light' ? ' is-active' : ''}`}
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        aria-label="Day theme"
        title="Day theme"
      >
        <Sun size={13} weight="bold" aria-hidden="true" />
        <span>Day</span>
      </button>
      <button
        type="button"
        className={`theme-toggle__option${theme === 'dark' ? ' is-active' : ''}`}
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        aria-label="Night theme"
        title="Night theme"
      >
        <Moon size={13} weight="bold" aria-hidden="true" />
        <span>Night</span>
      </button>
    </div>
  );
}
