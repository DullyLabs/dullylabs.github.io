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
  // In Chinese, controls keep their English box with the label centred (and
  // shrunk to fit if needed), and text blocks keep their English height unless
  // the Chinese needs more than a few px extra, so nothing moves on switch.
  // English is left untouched. English sizes are cached per layout (width plus
  // the height breakpoints in styles.css).
  const CONTROLS = ':is(a, button):is([data-zh], :has([data-zh]))', BLOCKS = ':is(h1, h2, h3, p, .platform-note)[data-zh]', SPARE = 4, MIN_SCALE = .8;
  const layoutKey = () => [innerWidth, ...['(max-height:740px)', '(max-height:700px)'].map(q => matchMedia(q).matches)].join();
  const englishSizes = new Map();
  const size = el => { const r = el.getBoundingClientRect(); return r.width ? [r.width, r.height] : null; };
  const measureEnglish = () => {
    const lang = root.lang;
    root.lang = 'en';
    swap(false);
    const measure = sel => [...document.querySelectorAll(sel)].map(el => [el, size(el)]).filter(([, s]) => s);
    const sizes = {controls: measure(CONTROLS), blocks: measure(BLOCKS)};
    root.lang = lang;
    swap(true);
    return sizes;
  };
  // Shrinks only the label; it may use the padding below MIN_SCALE but never leaves the box.
  const fitLabel = el => {
    const label = el.matches('[data-zh]') ? el : el.querySelector('[data-zh]'), cs = getComputedStyle(el), range = document.createRange();
    range.selectNodeContents(el);
    const needed = range.getBoundingClientRect().width, own = label === el ? needed : label.getBoundingClientRect().width, fixed = needed - own;
    let scale = Math.min(1, (el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - fixed) / own);
    if (scale < MIN_SCALE) scale = Math.min(MIN_SCALE, (el.clientWidth - fixed) / own);
    if (scale >= 1) return;
    if (label === el) el.style.fontSize = `${parseFloat(cs.fontSize) * scale}px`; else label.style.zoom = scale;
  };
  const fit = zh => {
    document.querySelectorAll('[data-fit] [data-zh]').forEach(el => el.style.zoom = '');
    document.querySelectorAll('[data-fit]').forEach(el => { delete el.dataset.fit; el.style.width = el.style.height = el.style.fontSize = ''; });
    document.querySelectorAll(BLOCKS).forEach(el => el.style.height = '');
    if (!zh) return;
    const key = layoutKey();
    if (!englishSizes.has(key)) englishSizes.set(key, measureEnglish());
    const {controls, blocks} = englishSizes.get(key);
    blocks.forEach(([el, [, h]]) => { if (el.getBoundingClientRect().height <= h + SPARE) el.style.height = `${h}px`; });
    controls.forEach(([el, [w, h]]) => { el.dataset.fit = ''; el.style.width = `${w}px`; el.style.height = `${h}px`; });
    controls.forEach(([el]) => fitLabel(el));
  };
  const apply = lang => {
    const zh = lang !== 'en';
    if (zh) chinese = lang;
    root.lang = lang;
    swap(zh);
    document.querySelectorAll('[data-zh-label]').forEach(el => {
      el.dataset.enLabel ??= el.getAttribute('aria-label');
      el.setAttribute('aria-label', zh ? zhText(el, true) : el.dataset.enLabel);
    });
    document.querySelectorAll('.lang-toggle').forEach(button => {
      button.textContent = zh ? 'EN' : '中';
      button.lang = zh ? 'en' : chinese;
      button.setAttribute('aria-label', zh ? 'Switch to English' : chinese === 'zh-Hans' ? '切换至中文' : '切換至中文');
    });
    fit(zh);
    document.dispatchEvent(new CustomEvent('langchange'));
  };
  const browser = norm(navigator.language) ?? 'en';
  chinese = browser === 'en' ? 'zh-Hant' : browser;
  apply(param ?? norm(saved ?? '') ?? browser);
  let fitted = layoutKey(), pending;
  const refit = () => { fitted = layoutKey(); fit(root.lang.startsWith('zh')); };
  document.fonts.ready.then(() => { englishSizes.clear(); refit(); });
  // After route.js re-lays out the track; toolbar show/hide keeps the same layout.
  addEventListener('resize', () => { clearTimeout(pending); pending = setTimeout(() => layoutKey() !== fitted && refit()); });
  document.querySelectorAll('.lang-toggle').forEach(button => button.addEventListener('click', () => {
    const lang = root.lang.startsWith('zh') ? 'en' : chinese;
    apply(lang);
    try { localStorage.setItem(KEY, lang); } catch {}
  }));
})();
