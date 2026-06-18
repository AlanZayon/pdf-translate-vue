import { ref } from 'vue';

const STORAGE_KEY = 'arcane-theme';
const theme = ref('dark');
let initialized = false;

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(value) {
  return value === 'system' ? getSystemTheme() : value;
}

function applyTheme(resolved) {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#08080c' : '#faf6ef');
  }
}

function loadStoredTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    theme.value = stored;
  }
}

export function initThemeEarly() {
  loadStoredTheme();
  applyTheme(resolveTheme(theme.value));
}

export function useTheme() {
  function setTheme(value) {
    theme.value = value;
    localStorage.setItem(STORAGE_KEY, value);
    applyTheme(resolveTheme(value));
  }

  function toggleTheme() {
    const resolved = resolveTheme(theme.value);
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  }

  function initTheme() {
    if (initialized) return;
    initialized = true;
    loadStoredTheme();
    applyTheme(resolveTheme(theme.value));

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') applyTheme(getSystemTheme());
    });
  }

  initTheme();

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: () => resolveTheme(theme.value) === 'dark',
  };
}
