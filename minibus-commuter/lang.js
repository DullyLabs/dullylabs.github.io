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
  // In Chinese, controls keep their English box with the label centred (and
  // shrunk to fit if needed), and text blocks keep their English height unless
  // the Chinese needs more than a few px extra, so nothing moves on switch.
  // English is left untouched.
  const CONTROLS = ':is(a, button):is([data-zh], :has([data-zh]))', BLOCKS = ':is(h1, h2, h3, p, .platform-note)[data-zh]', SPARE = 4;
  const size = el => { const r = el.getBoundingClientRect(); return r.width ? [r.width, r.height] : null; };
  const fitLabel = el => {
    const label = el.matches('[data-zh]') ? el : el.querySelector('[data-zh]'), cs = getComputedStyle(el), font = parseFloat(cs.fontSize), range = document.createRange();
    range.selectNodeContents(el);
    const room = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const fits = () => { const r = range.getBoundingClientRect(); return r.width <= room + .5 && r.height <= el.clientHeight + .5; };
    for (let f = 1; !fits() && f > .5;) {
      f -= .01;
      if (label === el) el.style.fontSize = `${font * f}px`; else label.style.zoom = f;
    }
  };
  const fit = zh => {
    document.querySelectorAll('[data-fit] [data-zh]').forEach(el => el.style.zoom = '');
    document.querySelectorAll('[data-fit]').forEach(el => { delete el.dataset.fit; el.style.width = el.style.height = el.style.fontSize = ''; });
    document.querySelectorAll(BLOCKS).forEach(el => el.style.height = '');
    if (!zh) return;
    root.lang = 'en';
    swap(false);
    const measure = sel => [...document.querySelectorAll(sel)].map(el => [el, size(el)]).filter(([, s]) => s);
    const controls = measure(CONTROLS), blocks = measure(BLOCKS);
    root.lang = 'zh-Hant';
    swap(true);
    blocks.forEach(([el, [, h]]) => { if (el.getBoundingClientRect().height <= h + SPARE) el.style.height = `${h}px`; });
    controls.forEach(([el, [w, h]]) => { el.dataset.fit = ''; el.style.width = `${w}px`; el.style.height = `${h}px`; });
    controls.forEach(([el]) => fitLabel(el));
  };
  const apply = lang => {
    const zh = lang === 'zh';
    root.lang = zh ? 'zh-Hant' : 'en';
    swap(zh);
    document.querySelectorAll('[data-zh-label]').forEach(el => {
      el.dataset.enLabel ??= el.getAttribute('aria-label');
      el.setAttribute('aria-label', zh ? el.dataset.zhLabel : el.dataset.enLabel);
    });
    document.querySelectorAll('.lang-toggle').forEach(button => {
      button.textContent = zh ? 'EN' : '中';
      button.lang = zh ? 'en' : 'zh-Hant';
      button.setAttribute('aria-label', zh ? 'Switch to English' : '切換至中文');
    });
    fit(zh);
    document.dispatchEvent(new CustomEvent('langchange'));
  };
  apply(saved === 'zh' || saved === 'en' ? saved : /^zh/i.test(navigator.language) ? 'zh' : 'en');
  const refit = () => fit(root.lang.startsWith('zh'));
  document.fonts.ready.then(refit);
  addEventListener('resize', () => setTimeout(refit)); // after route.js re-lays out the track
  document.querySelectorAll('.lang-toggle').forEach(button => button.addEventListener('click', () => {
    const lang = root.lang.startsWith('zh') ? 'en' : 'zh';
    apply(lang);
    try { localStorage.setItem(KEY, lang); } catch {}
  }));
})();
