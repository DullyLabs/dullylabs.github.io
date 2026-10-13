/* Language switch: en, zh-Hant or zh-Hans. Elements carry Traditional Chinese
   in data-zh and Simplified in data-zh-hans (markup allowed; falls back to
   data-zh); the English is remembered on first swap. ?lang= wins, then a saved
   choice, then the browser language. The toggle flips English and the reader's
   Chinese. Other scripts listen for `langchange`. */
(() => {
  const root = document.documentElement, KEY = 'dully-lang';
  const norm = v => /^zh-(hans|cn|sg)(-|$)/i.test(v) ? 'zh-Hans' : /^zh/i.test(v) ? 'zh-Hant' : /^en(-|$)/i.test(v) ? 'en' : null;
  let saved = null, chinese;
  try { saved = localStorage.getItem(KEY); } catch {}
  const param = norm(new URLSearchParams(location.search).get('lang') ?? '');
  if (param) try { localStorage.setItem(KEY, param); } catch {}
  const zhText = (el, label) => (root.lang === 'zh-Hans' && el.dataset[label ? 'zhHansLabel' : 'zhHans']) || el.dataset[label ? 'zhLabel' : 'zh'];
  const swap = zh => document.querySelectorAll('[data-zh]').forEach(el => {
    el.dataset.en ??= el.innerHTML;
    el.innerHTML = zh ? zhText(el) : el.dataset.en;
  });
  // Buttons keep the size of their larger label so nothing shifts on switch.
  const lockSizes = zh => {
    const buttons = [...document.querySelectorAll('button')].filter(b => !b.dataset.locked && (b.matches('[data-zh]') || b.querySelector('[data-zh]')) && b.getBoundingClientRect().width);
    if (!buttons.length) return;
    const sizes = buttons.map(b => b.getBoundingClientRect());
    swap(!zh);
    buttons.forEach((b, i) => { const r = b.getBoundingClientRect(); sizes[i] = {width: Math.max(sizes[i].width, r.width), height: Math.max(sizes[i].height, r.height)}; });
    swap(zh);
    buttons.forEach((b, i) => { b.style.minWidth = `${Math.ceil(sizes[i].width)}px`; b.style.minHeight = `${Math.ceil(sizes[i].height)}px`; b.dataset.locked = '1'; });
  };
  const apply = lang => {
    const zh = lang !== 'en';
    if (zh) chinese = lang;
    root.lang = lang;
    swap(zh);
    if (document.fonts.status === 'loaded') lockSizes(zh);
    document.querySelectorAll('[data-zh-label]').forEach(el => {
      el.dataset.enLabel ??= el.getAttribute('aria-label');
      el.setAttribute('aria-label', zh ? zhText(el, true) : el.dataset.enLabel);
    });
    document.querySelectorAll('.lang-toggle').forEach(button => {
      button.textContent = zh ? 'EN' : '中';
      button.lang = zh ? 'en' : chinese;
      button.setAttribute('aria-label', zh ? 'Switch to English' : chinese === 'zh-Hans' ? '切换至中文' : '切換至中文');
    });
    document.dispatchEvent(new CustomEvent('langchange'));
  };
  const browser = norm(navigator.language) ?? 'en';
  chinese = browser === 'en' ? 'zh-Hant' : browser;
  apply(param ?? norm(saved ?? '') ?? browser);
  document.fonts.ready.then(() => lockSizes(root.lang.startsWith('zh')));
  document.querySelectorAll('.lang-toggle').forEach(button => button.addEventListener('click', () => {
    const lang = root.lang.startsWith('zh') ? 'en' : chinese;
    apply(lang);
    try { localStorage.setItem(KEY, lang); } catch {}
  }));
})();
