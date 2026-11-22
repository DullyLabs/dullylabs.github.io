// Meridian landing page: a live clock of bands in the visitor's own time, shifted by one slider.
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };
  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });

  const HOUR = 36e5, MAX_BANDS = 6;
  const HOME = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const hourOptions = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions();
  const H12 = hourOptions.hourCycle ? /h1[12]/.test(hourOptions.hourCycle) : !!hourOptions.hour12;

  // What a city is up to at each local hour (0-23). The gossip is this page's; the app sticks to the time.
  const GOSSIP = [
    'asleep. Mostly.', 'dreaming', 'dead to the world', 'asleep. Do not call.', 'asleep, except the bakers',
    'hitting snooze', 'waking up, reluctantly', 'waiting for the kettle', 'on the commute', 'opening the laptop',
    'in a meeting that could have been an email', 'thinking about lunch', 'at lunch', 'finishing lunch',
    'pretending to work', 'on a third coffee', 'watching the clock', 'clocking off', 'heading home',
    'having dinner', 'doing the dishes', 'on the sofa', 'turning in', 'saying “one more episode”',
  ];

  // Cities people type that are not time zone names.
  const ALIASES = {
    'Mumbai': 'Asia/Kolkata', 'Delhi': 'Asia/Kolkata', 'Bangalore': 'Asia/Kolkata', 'Beijing': 'Asia/Shanghai',
    'San Francisco': 'America/Los_Angeles', 'Seattle': 'America/Los_Angeles', 'Boston': 'America/New_York',
    'Washington': 'America/New_York', 'Miami': 'America/New_York', 'Montreal': 'America/Toronto',
    'Rio de Janeiro': 'America/Sao_Paulo', 'Cape Town': 'Africa/Johannesburg', 'Abu Dhabi': 'Asia/Dubai',
    'Osaka': 'Asia/Tokyo', 'Munich': 'Europe/Berlin', 'Frankfurt': 'Europe/Berlin', 'Barcelona': 'Europe/Madrid',
    'Milan': 'Europe/Rome', 'Geneva': 'Europe/Zurich', 'Edinburgh': 'Europe/London', 'Manchester': 'Europe/London',
    'Wellington': 'Pacific/Auckland', 'Canberra': 'Australia/Sydney', 'Tel Aviv': 'Asia/Jerusalem',
    'Hanoi': 'Asia/Ho_Chi_Minh', 'Hawaii': 'Pacific/Honolulu',
  };
  const DEFAULTS = ['Europe/London', 'America/New_York', 'Asia/Tokyo', 'Australia/Sydney'];
  const cityName = tz => tz.split('/').pop().replace(/_/g, ' ');

  const index = new Map(); // lowercased name or zone id -> { tz, name }
  const zones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : DEFAULTS;
  for (const tz of zones) {
    const city = { tz, name: cityName(tz) };
    index.set(tz.toLowerCase(), city);
    if (!index.has(city.name.toLowerCase())) index.set(city.name.toLowerCase(), city);
  }
  for (const [name, tz] of Object.entries(ALIASES)) index.set(name.toLowerCase(), { tz, name });
  const names = [...new Set([...index.values()].map(city => city.name))].sort();
  $('zones').append(...names.map(name => Object.assign(el('option'), { value: name })));

  // Wall-clock time in a zone at an instant, via Intl.
  const formats = new Map();
  function wall(tz, ms) {
    let format = formats.get(tz);
    if (!format) {
      format = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
      formats.set(tz, format);
    }
    const p = {};
    for (const { type, value } of format.formatToParts(ms)) p[type] = +value;
    const h = p.hour % 24;
    return { h, m: p.minute, s: p.second, day: Date.UTC(p.year, p.month - 1, p.day) / 864e5, asUTC: Date.UTC(p.year, p.month - 1, p.day, h, p.minute, p.second) };
  }
  const pad = n => String(n).padStart(2, '0');
  const shownHour = h => H12 ? String(h % 12 || 12) : pad(h);
  const hourMark = h => H12 ? `${h % 12 || 12}${h < 12 ? 'AM' : 'PM'}` : `${pad(h)}:00`;
  const isDay = h => h >= 6 && h < 18;
  const isAwake = h => h >= 7 && h < 23;
  const isWork = t => t.h >= 9 && t.h < 18 && (t.day + 4) % 7 % 6 !== 0; // weekdays only, like the app
  const duration = (minutes, h, m) => [Math.floor(minutes / 60) && `${Math.floor(minutes / 60)}${h}`, minutes % 60 && `${minutes % 60}${m}`].filter(Boolean).join(' ');

  function offsetLabel(city, here) {
    const minutes = Math.round((city.asUTC - here.asUTC) / 6e4);
    const gap = minutes ? `${minutes > 0 ? '+' : '−'}${duration(Math.abs(minutes), 'H', 'M')}` : 'SAME TIME';
    const day = city.day - here.day;
    return day ? `${gap} · ${day > 0 ? 'TOMORROW' : 'YESTERDAY'}` : gap;
  }

  let bands = [{ tz: HOME, name: cityName(HOME), home: true }, ...DEFAULTS.filter(tz => tz !== HOME).map(tz => ({ tz, name: cityName(tz) }))];
  let shift = 0; // minutes
  let stripKey = '';
  const slider = $('shift'), nowButton = $('now'), list = $('bands'), message = $('add-msg');
  const narrow = matchMedia('(max-width: 560px)');

  function buildBands() {
    list.replaceChildren(...bands.map(band => {
      const item = el('li', 'band');
      const top = el('div', 'band-top caps');
      top.append(el('span', 'band-city', band.name), band.off = el('span', 'band-off'));
      const time = el('p', 'band-time');
      time.append(band.hh = el('b'), band.mm = el('span'), band.ss = el('i'), band.ap = el('small'));
      const row = el('div', 'band-row');
      row.append(time);
      if (!band.home) {
        const remove = el('button', 'band-x', '×');
        remove.type = 'button';
        remove.setAttribute('aria-label', `Remove ${band.name}`);
        remove.addEventListener('click', () => {
          bands = bands.filter(other => other !== band);
          buildBands();
          message.textContent = `${band.name} removed.`;
          $('city').focus();
        });
        row.append(remove);
      }
      item.append(top, row, band.gossip = el('p', 'band-gossip'));
      band.item = item;
      return item;
    }));
    stripKey = '';
    render();
  }

  function render() {
    const at = Date.now() + shift * 6e4;
    const here = wall(HOME, at);
    for (const band of bands) {
      const t = band.t = wall(band.tz, at);
      band.item.classList.toggle('night', !isDay(t.h));
      band.off.textContent = band.home ? 'YOU ARE HERE' : offsetLabel(t, here);
      band.hh.textContent = shownHour(t.h);
      band.mm.textContent = pad(t.m);
      band.ss.textContent = shift ? '' : pad(t.s); // like the app, seconds only run in the present
      band.ap.textContent = H12 ? (t.h < 12 ? 'AM' : 'PM') : '';
      band.gossip.textContent = GOSSIP[t.h];
    }
    renderHeadline();
    renderReport();
    const key = `${Math.floor(at / 6e4)}|${narrow.matches}|${bands.map(band => band.tz)}`;
    if (key !== stripKey) { stripKey = key; renderStrip(at); }
  }

  // "London is finishing lunch. Tokyo is turning in." for the first city and whichever is furthest from it.
  function renderHeadline() {
    const first = bands.find(band => !band.home) || bands[0];
    const apart = band => { const d = Math.abs(band.t.h - first.t.h); return Math.min(d, 24 - d); };
    const second = bands.filter(band => band !== first).sort((a, b) => apart(b) - apart(a))[0];
    const line = band => `${band.name} is ${GOSSIP[band.t.h]}${GOSSIP[band.t.h].endsWith('.') ? '' : '.'}`;
    const text = second ? `${line(first)} ${line(second)}` : `${line(first)} Everyone else is unaccounted for.`;
    if ($('title').textContent !== text) $('title').textContent = text;
  }

  function renderReport() {
    const asleep = bands.filter(band => !isAwake(band.t.h)).length;
    const report = !asleep ? 'Everyone is awake. This will not last.'
      : asleep === bands.length ? 'Everyone is asleep. Including, apparently, you.'
      : `${asleep} of ${bands.length} asleep. Text, don’t call.`;
    if ($('report').textContent !== report) $('report').textContent = report;
    const ahead = Math.abs(shift);
    $('shift-label').textContent = shift ? `${shift > 0 ? '+' : '−'}${duration(ahead, 'h', 'm')}` : 'Now';
    slider.setAttribute('aria-valuetext', shift ? `${duration(ahead, ahead < 120 ? ' hour' : ' hours', ahead % 60 === 1 ? ' minute' : ' minutes')} ${shift > 0 ? 'ahead' : 'back'}` : 'Now');
    nowButton.hidden = !shift;
  }

  // The Hours widget: one row of hours per city, and the next stretch when everyone is awake.
  function renderStrip(at) {
    const count = narrow.matches ? 16 : 24;
    const hours = bands.map(band => Array.from({ length: 24 }, (_, i) => wall(band.tz, at + i * HOUR)));
    const awake = i => hours.every(row => isAwake(row[i].h));
    const start = Array.from({ length: 24 }, (_, i) => i).find(awake);
    let length = 0;
    if (start !== undefined) while (start + length < 24 && awake(start + length)) length++;

    $('rows').replaceChildren(...bands.map((band, b) => {
      const row = el('div', 'hrow');
      const head = el('p', 'hrow-head');
      head.append(el('b', '', shownHour(band.t.h)), el('span', '', pad(band.t.m)), el('em', 'caps', band.name), el('small', 'caps', band.off.textContent));
      const cells = el('div', 'cells');
      cells.setAttribute('aria-hidden', 'true');
      cells.style.setProperty('--n', count);
      hours[b].slice(0, count).forEach((t, i) => {
        const h = t.h, state = isWork(t) ? 'work' : isAwake(h) ? 'awake' : 'asleep';
        const hit = start !== undefined && i >= start && i < start + length;
        cells.append(el('span', `c ${state}${hit ? ' hit' : ''}${h === 0 && i ? ' midnight' : ''}`, H12 ? h % 12 || 12 : pad(h)));
      });
      row.append(head, cells);
      return row;
    }));

    const mark = i => hourMark(wall(HOME, at + i * HOUR).h);
    if (start !== undefined) {
      $('verdict').textContent = `All awake ${mark(start)}–${mark(start + length)} · ${length}H`;
      $('aside').textContent = start ? `That’s in ${start} ${start === 1 ? 'hour' : 'hours'}, your time. Nobody has to set an alarm.` : 'That’s right now. Go on, call them.';
    } else {
      const asleepAt = i => bands.filter((_, b) => !isAwake(hours[b][i]));
      let best = 0;
      for (let i = 1; i < count; i++) if (asleepAt(i).length < asleepAt(best).length) best = i;
      const victims = asleepAt(best).map(band => band.name);
      const who = victims.length > 1 ? `${victims.slice(0, -1).join(', ')} and ${victims.at(-1)}` : victims[0];
      $('verdict').textContent = 'No hour works';
      $('aside').textContent = `Someone has to suffer. The least bad is ${mark(best)} your time. Sorry, ${who}.`;
    }
  }

  function setShift(minutes) {
    shift = minutes;
    slider.value = minutes;
    render();
  }
  slider.addEventListener('input', () => setShift(+slider.value));
  nowButton.addEventListener('click', () => { setShift(0); slider.focus(); });
  narrow.addEventListener('change', render);

  $('add').addEventListener('submit', event => {
    event.preventDefault();
    const input = $('city'), typed = input.value.trim();
    if (!typed) return;
    const query = typed.toLowerCase().replace(/\s+/g, ' ');
    const city = index.get(query) || index.get(query.replace(/ /g, '_')) || [...index.values()].filter(c => c.name.toLowerCase().startsWith(query)).sort((a, b) => a.name.length - b.name.length)[0];
    if (!city) message.textContent = `No time zone answers to “${typed}”. Try the nearest big city.`;
    else if (bands.some(band => band.tz === city.tz && band.name === city.name)) message.textContent = `${city.name} already has a band.`;
    else if (bands.length >= MAX_BANDS) message.textContent = 'Six bands, like the Hours widget. Remove one first.';
    else {
      bands.push({ ...city });
      input.value = '';
      buildBands();
      message.textContent = `${city.name} added.`;
    }
  });

  buildBands();
  (function tick() {
    render();
    setTimeout(tick, 1000 - Date.now() % 1000);
  })();
})();
