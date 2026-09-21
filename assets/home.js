(() => {
  'use strict';
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  const preference = matchMedia('(prefers-color-scheme: dark)');
  let manualTheme = false;

  try {
    const saved = localStorage.getItem('dully-theme');
    manualTheme = saved === 'light' || saved === 'dark';
  } catch (_) { /* The theme also works when storage is unavailable. */ }

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    toggle.setAttribute('aria-label', `Use ${theme === 'dark' ? 'light' : 'dark'} appearance`);
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#20231e' : '#f6f3ec';
  };

  setTheme(root.dataset.theme || (preference.matches ? 'dark' : 'light'));
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    manualTheme = true;
    setTheme(theme);
    try { localStorage.setItem('dully-theme', theme); } catch (_) {}
  });
  preference.addEventListener('change', (event) => {
    if (!manualTheme) setTheme(event.matches ? 'dark' : 'light');
  });
})();
