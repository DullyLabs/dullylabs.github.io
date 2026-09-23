/* Site-wide appearance. Loaded blocking in every <head> so the theme is set
   before first paint. A saved choice wins; otherwise follow the system, and
   with no system preference go dark between 8pm and 6am. Keep following the
   system until the visitor presses a .theme-toggle. */
(() => {
  const root = document.documentElement, KEY = 'dully-theme';
  const system = matchMedia('(prefers-color-scheme: dark)');
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch {}
  const sync = () => {
    const dark = root.dataset.theme === 'dark';
    document.querySelector('.theme-toggle')?.setAttribute('aria-label', `Use ${dark ? 'light' : 'dark'} appearance`);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && document.body) meta.content = getComputedStyle(document.body).backgroundColor;
  };
  const apply = theme => { root.dataset.theme = theme; sync(); };
  const fromSystem = () => {
    if (system.matches) return 'dark';
    if (matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    const hour = new Date().getHours();
    return hour >= 20 || hour < 6 ? 'dark' : 'light';
  };
  apply(saved === 'dark' || saved === 'light' ? saved : fromSystem());
  system.addEventListener('change', () => { if (!saved) apply(fromSystem()); });
  addEventListener('DOMContentLoaded', () => {
    sync();
    document.body.addEventListener('transitionend', event => {
      if (event.target === document.body && event.propertyName === 'background-color') sync();
    });
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      saved = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(saved);
      try { localStorage.setItem(KEY, saved); } catch {}
    });
  });
})();
