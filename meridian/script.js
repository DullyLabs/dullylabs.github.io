// Meridian landing page: city bands and a globe, all seen from the visitor's own time zone, shifted by dragging the Earth or the slider.
import { CITIES, COPY } from './cities.js';
import { drawGlobe, pxPerMinute } from './globe.js';

const $ = id => document.getElementById(id);
const DAY = 1440, STEP = 15;
const HOME = Intl.DateTimeFormat().resolvedOptions().timeZone;
const HOME_NAME = HOME.split('/').pop().replace(/_/g, ' ');
const bands = CITIES.filter(city => city.band);
const pad = n => String(n).padStart(2, '0');
const wrap = minutes => ((minutes + DAY / 2) % DAY + DAY) % DAY - DAY / 2; // the slider's −12h..+12h view of any shift

const formats = new Map();
function wall(zone, at) {
  if (!formats.has(zone)) formats.set(zone, new Intl.DateTimeFormat('en-GB', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }));
  const p = Object.fromEntries(formats.get(zone).formatToParts(at).map(part => [part.type, +part.value]));
  return { h: p.hour % 24, m: p.minute, day: Date.UTC(p.year, p.month - 1, p.day) / 864e5 };
}
const asleep = ({ sleep: [from, to] }, h) => from < to ? h >= from && h < to : h >= from || h < to;
const dayWord = diff => ({ '-1': 'Yesterday', 0: 'Today', 1: 'Tomorrow' })[diff] ?? (diff > 0 ? `In ${diff} days` : `${-diff} days ago`);
function offsetLabel(shift, long) {
  if (!shift) return 'Now';
  const total = Math.abs(shift), d = Math.floor(total / DAY), h = Math.floor(total % DAY / 60), m = total % 60;
  const parts = long ? [d && `${d} day${d > 1 ? 's' : ''}`, h && `${h} hour${h > 1 ? 's' : ''}`, m && `${m} minutes`] : [d && `${d}d`, `${h}h`, pad(m) + 'm'];
  return long ? `${parts.filter(Boolean).join(' ')} ${shift > 0 ? 'ahead' : 'back'}` : `${shift > 0 ? '+' : '−'}${parts.filter(Boolean).join(' ')}`;
}

for (const city of bands) {
  city.el = document.createElement('li');
  city.el.className = 'band';
  city.el.innerHTML = '<div class="band-top caps"><span></span><span class="date"></span></div><div class="band-body"><p class="band-time"><b></b><i></i></p><p class="gossip"></p></div>';
  city.el.querySelector('span').textContent = city.name;
  $('bands').append(city.el);
}
document.querySelector('[data-year]').textContent = new Date().getFullYear();

let shift = 0;
function render() {
  const at = new Date(Date.now() + shift * 6e4), you = wall(HOME, at);
  for (const city of bands) {
    const t = city.time = wall(city.zone, at), el = city.el;
    el.classList.toggle('night', t.h < 6 || t.h >= 18);
    el.querySelector('b').textContent = pad(t.h);
    el.querySelector('i').textContent = ':' + pad(t.m);
    el.querySelector('.date').textContent = t.day === you.day ? '' : dayWord(t.day - you.day);
    el.querySelector('.gossip').textContent = city.jokes[t.h];
  }
  const sleeping = bands.filter(city => asleep(city, city.time.h));
  $('report').textContent = sleeping.length ? COPY.sorry(sleeping[0].name) : COPY.allAwake;
  $('damage').textContent = sleeping.length ? COPY.asleepNote(new Intl.ListFormat('en').format(sleeping.slice(1).map(c => c.name))) : COPY.allAwakeNote;
  $('headline').textContent = sleeping.length ? sleeping[0].asleep : COPY.headline;
  $('you').textContent = `You, ${HOME_NAME}: ${pad(you.h)}:${pad(you.m)} ${shift ? dayWord(you.day - wall(HOME, new Date()).day) : ''}`.trim();
  $('shift-label').textContent = offsetLabel(shift);
  $('shift').value = wrap(shift);
  $('shift').setAttribute('aria-valuetext', offsetLabel(shift, true));
  $('mode').textContent = shift ? '○ Time travel' : '● Live';
  $('now').hidden = !shift;
  drawGlobe($('planet'), at, CITIES, document.documentElement.dataset.theme === 'dark');
}
const setShift = minutes => { shift = Math.round(minutes / STEP) * STEP; render(); };

// The slider shows one day either side; dragging the Earth keeps going through as many days as you like.
$('shift').addEventListener('input', e => setShift(shift - wrap(shift) + +e.target.value));
$('now').addEventListener('click', () => setShift(0));
const universe = $('universe');
let drag;
universe.addEventListener('pointerdown', e => {
  if (e.button) return;
  drag = { id: e.pointerId, x: e.clientX, shift };
  universe.setPointerCapture(e.pointerId);
  universe.classList.add('dragging');
});
universe.addEventListener('pointermove', e => {
  if (drag?.id === e.pointerId) setShift(drag.shift + (e.clientX - drag.x) / pxPerMinute($('planet')));
});
const endDrag = () => { drag = null; universe.classList.remove('dragging'); };
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) universe.addEventListener(type, endDrag);
new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
addEventListener('resize', render);
render();
setInterval(() => { if (!document.hidden) render(); }, 1000);
