/* Language switch. Elements carry their Chinese in data-zh (markup allowed);
   the English is remembered on first swap. A saved choice wins, else the
   browser language. Other scripts listen for `langchange`. */
(() => {
  const root = document.documentElement, KEY = 'dully-lang';
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch {}
  const swap = zh => document.querySelectorAll('[data-zh]').forEach(el => {
    el.dataset.en ??= el.innerHTML;
    el.innerHTML = zh ? el.dataset.zh : el.dataset.en;
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
    const zh = lang === 'zh';
    root.lang = zh ? 'zh-Hant' : 'en';
    swap(zh);
    if (document.fonts.status === 'loaded') lockSizes(zh);
    document.querySelectorAll('[data-zh-label]').forEach(el => {
      el.dataset.enLabel ??= el.getAttribute('aria-label');
      el.setAttribute('aria-label', zh ? el.dataset.zhLabel : el.dataset.enLabel);
    });
    document.querySelectorAll('.lang-toggle').forEach(button => {
      button.textContent = zh ? 'EN' : '中';
      button.lang = zh ? 'en' : 'zh-Hant';
      button.setAttribute('aria-label', zh ? 'Switch to English' : '切換至中文');
    });
    document.dispatchEvent(new CustomEvent('langchange'));
  };
  apply(saved === 'zh' || saved === 'en' ? saved : /^zh/i.test(navigator.language) ? 'zh' : 'en');
  document.fonts.ready.then(() => lockSizes(root.lang.startsWith('zh')));
  document.querySelectorAll('.lang-toggle').forEach(button => button.addEventListener('click', () => {
    const lang = root.lang.startsWith('zh') ? 'en' : 'zh';
    apply(lang);
    try { localStorage.setItem(KEY, lang); } catch {}
  }));
})();
