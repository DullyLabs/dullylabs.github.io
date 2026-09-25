// Set once the App Store listing is live; until then the buttons open the coming-soon dialog.
const APP_STORE_URL = '';
const dialog = document.querySelector('#download-dialog');
document.querySelectorAll('[data-download]').forEach(button => {
  button.addEventListener('click', () => {
    if (APP_STORE_URL) window.location.assign(APP_STORE_URL);
    else dialog.showModal();
  });
});
dialog.querySelectorAll('.dialog-close, .dialog-done').forEach(button => {
  button.addEventListener('click', () => dialog.close());
});
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
});
const zh = () => document.documentElement.lang.startsWith('zh');
const pinButton = document.querySelector('#pin-stop');
let pinned = false;
const renderPin = () => pinButton.textContent = pinned ? (zh() ? '✓ 已釘選' : '✓ Stop pinned') : (zh() ? '＋ 釘選此站' : '＋ Pin this stop');
pinButton.addEventListener('click', () => {
  pinned = !pinned;
  pinButton.setAttribute('aria-pressed', String(pinned));
  renderPin();
});

// Vertical scroll drives the bus horizontally along the route.
const viewport = document.querySelector('.route-viewport');
const track = document.querySelector('.route-track');
const stops = [...track.children];
// The depot sits past the terminus but off the inert track, so its site links stay reachable.
const depot = document.querySelector('.depot');
const places = [...stops, depot];
const last = places.length - 1;
const routeScroll = document.querySelector('.route-scroll');
const strip = document.querySelector('.route-strip');
const progress = strip.querySelector('.route-progress');
const backdrops = document.querySelectorAll('.skyline');
const wheels = document.querySelectorAll('.wheel');
const road = document.querySelector('.road');
const bus = document.querySelector('.route-bus');
const ferry = document.querySelector('.star-ferry');
const locationLabel = document.querySelector('#route-location');
const speech = document.querySelector('.bus-speech');
const wanChaiIndex = stops.findIndex(stop => stop.id === 'wan-chai');
const farParallax = .12;
const doorButton = document.querySelector('.door-toggle');
const layers = places.map(stop => [stop.querySelector('.far'), stop.querySelector('.mid')]);

const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionPreference.matches;
const initialStop = places.findIndex(stop => `#${stop.id}` === location.hash);
let stopWidth = 0, scale = 1, scrollPerStop = 0, current = -1, lastX = 0, idleTimer, glide;
let journeyReady = false, previousPosition = null, calloutArmed = false, speechTimer, provisional = true;
let ferryExitPosition = wanChaiIndex, ferryTravel = 0;

places.forEach((stop, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  const name = stop.querySelector('.stop-sign').lastChild.textContent;
  button.setAttribute('aria-label', name);
  button.innerHTML = `<i></i><span>${name}</span>`;
  button.addEventListener('click', () => driveTo(index));
  strip.append(button);
});
const buttons = strip.querySelectorAll('button');
function driveTo(index) { cancelAnimationFrame(glide); scrollTo({top: index * scrollPerStop, behavior: reducedMotion ? 'instant' : 'smooth'}); }
document.querySelectorAll('[data-stop]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); driveTo(Number(link.dataset.stop)); }));

function layout() {
  if (!viewport.clientWidth) return; // hidden or unrendered; resize will call again
  const position = scrollPerStop ? scrollY / scrollPerStop : Math.max(initialStop, 0);
  stopWidth = viewport.clientWidth;
  // Give narrow screens more scroll per stop so a single flick doesn't skip districts.
  scrollPerStop = Math.max(stopWidth, viewport.clientHeight * .9);
  // Safari can lay out while the panel lags the window, or the window is still empty or toolbar-less.
  provisional = !(Math.abs(viewport.clientHeight - innerHeight) <= 2 && innerHeight > 0 && innerHeight < screen.height);
  track.style.setProperty('--stop', `${stopWidth}px`);
  const svg = stops[0].querySelector('.landmarks');
  scale = Math.min(svg.clientWidth / 1000, svg.clientHeight / 300);
  // The first curved Wan Chai mountain peaks at t = 80 / 150 on its
  // quadratic from (400, 200), through (600, 120), to (800, 190).
  const peakX = 400 + 400 * (80 / 150);
  const peakOffset = (stopWidth - 1000 * scale) / 2 + peakX * scale;
  ferryExitPosition = wanChaiIndex + (peakOffset - stopWidth) / (stopWidth * (reducedMotion ? 1 : 1 - farParallax));
  const harbourBounds = ferry.ownerSVGElement.getBoundingClientRect();
  const harbourScale = harbourBounds.width / ferry.ownerSVGElement.viewBox.baseVal.width;
  // Include the wake and a small stroke allowance so the whole ferry clears the viewport.
  ferryTravel = (viewport.getBoundingClientRect().right - harbourBounds.left) / harbourScale - ferry.getBBox().x + 2;
  routeScroll.style.height = `${last * scrollPerStop + viewport.clientHeight}px`;
  scrollTo({top: position * scrollPerStop, behavior: 'instant'});
  render();
}
function render() {
  if (!stopWidth) return;
  const x = Math.max(0, Math.min(scrollY / scrollPerStop, last)) * stopWidth;
  const position = x / stopWidth;
  if (journeyReady) {
    if (position <= wanChaiIndex + .01) {
      calloutArmed = true;
      hideSpeech();
    }
    // Clear the callout before arrival, even during a quick swipe or stop jump.
    if (position >= wanChaiIndex + .8) {
      calloutArmed = false;
      hideSpeech();
    }
    // Cross just beyond Wan Chai going east.
    if (calloutArmed && previousPosition <= wanChaiIndex + .08 && position > wanChaiIndex + .08) {
      calloutArmed = false;
      showSpeech();
    }
  }
  previousPosition = position;
  track.style.transform = `translate3d(${-x}px,0,0)`;
  depot.style.transform = `translate3d(${stops.length * stopWidth - x}px,0,0)`;
  if (!reducedMotion) {
    backdrops.forEach(layer => layer.style.transform = `translate3d(${-x * .22}px,0,0)`);
    road.style.setProperty('--dash', `${-(x % 140)}px`);
    // Far and mid landmark layers lag the track so each panel has its own depth; zero offset at its stop centre.
    layers.forEach(([far, mid], i) => {
      if (Math.abs(x - i * stopWidth) > stopWidth) return; // off-screen panel
      const d = (x - i * stopWidth) / scale;
      far.style.transform = `translate(${d * farParallax}px)`;
      mid.style.transform = `translate(${d * .05}px)`;
    });
    wheels.forEach(wheel => wheel.style.transform = `rotate(${x * .9}deg)`);
    // Keep the original continuous, scroll-driven drift; the faster speed
    // carries it beyond the right edge by the time the mountain peak arrives.
    ferry.style.transform = `translateX(${position / ferryExitPosition * ferryTravel}px)`;
    bus.classList.toggle('moving', x !== lastX);
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => bus.classList.remove('moving'), 160);
  }
  if (x !== lastX && bus.classList.contains('door-open')) setDoor(false);
  lastX = x;
  progress.style.transform = `scaleX(${x / (last * stopWidth)})`;
  const index = Math.round(x / stopWidth);
  if (index === current) return;
  current = index;
  const name = `${places[index].querySelector('.stop-sign b').textContent} · ${buttons[index].textContent}`;
  locationLabel.textContent = index < stops.length ? `${String(index + 1).padStart(2, '0')} / ${String(stops.length).padStart(2, '0')} · ${name}` : `${name} · ${zh() ? '暫停服務' : 'Not in service'}`;
  buttons.forEach((button, i) => button.setAttribute('aria-current', i === index ? 'step' : 'false'));
  places.forEach((place, i) => place.classList.toggle('active', i === index));
  stops.forEach((stop, i) => { stop.inert = i !== index; });
  bus.classList.toggle('off-duty', index === last);
  history.replaceState(null, '', `#${places[index].id}`);
}
addEventListener('scroll', render, {passive: true});
// Watch the panel itself: on launch or restore, iOS Safari can hand layout a stale box (386x2741 on
// a 402x714 screen) or an empty or toolbar-less window (402x874) that settles without a window
// resize, even mid-drag, so re-lay out on any mismatch until a layout lands on a settled size.
// After that, ignore height-only changes within 1.5x so toolbar show/hide doesn't re-layout and
// jump the scroll position; just keep the scroll length matched so the depot is still reachable.
new ResizeObserver(() => {
  const fit = Math.max(viewport.clientWidth, viewport.clientHeight * .9);
  if (viewport.clientWidth !== stopWidth || Math.max(fit, scrollPerStop) > (provisional ? 1 : 1.5) * Math.min(fit, scrollPerStop)) layout();
  else if (stopWidth) routeScroll.style.height = `${last * scrollPerStop + viewport.clientHeight}px`;
}).observe(viewport);
addEventListener('keydown', event => {
  if (dialog.open || event.target.closest('input,textarea,select,[contenteditable="true"]') || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    driveTo(Math.max(0, Math.min(current + (event.key === 'ArrowRight' ? 1 : -1), last)));
  }
});
layout();
// Native fragment scrolling runs after deferred scripts and targets the panel's
// vertical position, which is shared by every stop. Restore our mapped position.
addEventListener('load', () => requestAnimationFrame(() => {
  if (initialStop >= 0) scrollTo({top: initialStop * scrollPerStop, behavior: 'instant'});
  render();
  calloutArmed = previousPosition <= wanChaiIndex + .01;
  journeyReady = true;
}), {once: true});
addEventListener('hashchange', () => {
  const target = places.findIndex(stop => `#${stop.id}` === location.hash);
  if (target >= 0) driveTo(target);
});
// Tabbing into the depot's links drives the bus there so focus is always on screen.
depot.addEventListener('focusin', () => { if (current !== last) driveTo(last); });
function setDoor(open) {
  bus.classList.toggle('door-open', open);
  doorButton.setAttribute('aria-pressed', String(open));
  doorButton.setAttribute('aria-label', zh() ? (open ? '關門' : '開門') : open ? 'Close the door' : 'Open the door');
  doorButton.title = open ? 'Close the door · 唔該' : 'Open the door · 有落';
}
doorButton.addEventListener('click', () => setDoor(!bus.classList.contains('door-open')));
function hideSpeech() {
  clearTimeout(speechTimer);
  speech.classList.remove('is-visible');
  speech.textContent = '';
  bus.classList.remove('stop-requested');
}
function showSpeech() {
  clearTimeout(speechTimer);
  speech.textContent = zh() ? '有落，唔該' : 'next stop please';
  speech.classList.add('is-visible');
  bus.classList.add('stop-requested');
  speechTimer = setTimeout(hideSpeech, 4000);
}
motionPreference.addEventListener('change', event => {
  reducedMotion = event.matches;
  if (reducedMotion) {
    [...backdrops, ...wheels, ferry, ...layers.flat()].forEach(layer => layer.style.removeProperty('transform'));
    bus.classList.remove('moving');
  }
  layout();
});
// Horizontal trackpad swipe, shift-wheel or touch drag drives the same scroll position.
addEventListener('wheel', event => {
  if (dialog.open) return;
  if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
  event.preventDefault();
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
  scrollBy({top: event.deltaX * unit, behavior: 'instant'});
}, {passive: false});
// Vertical touch pans natively; .route-viewport's touch-action:pan-y leaves horizontal pans
// unclaimed, so their touchmoves stay cancelable and are mapped onto the vertical scroll here.
let touch;
addEventListener('touchstart', event => {
  cancelAnimationFrame(glide);
  touch = event.touches.length === 1 && !dialog.open
    ? {x: event.touches[0].clientX, y: event.touches[0].clientY, horizontal: null, moves: []} : null;
}, {passive: true});
addEventListener('touchmove', event => {
  if (!touch || event.touches.length !== 1) { touch = null; return; }
  const dx = touch.x - event.touches[0].clientX, dy = touch.y - event.touches[0].clientY;
  if (touch.horizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) touch.horizontal = Math.abs(dx) > Math.abs(dy);
  if (!touch.horizontal) return;
  event.preventDefault();
  scrollBy({top: dx, behavior: 'instant'});
  touch.x = event.touches[0].clientX;
  touch.moves = [...touch.moves.slice(-4), {dx, t: event.timeStamp}];
}, {passive: false});
// A horizontal flick keeps gliding with decaying velocity, like native momentum scrolling.
addEventListener('touchend', event => {
  const moves = touch?.horizontal ? touch.moves.filter(move => event.timeStamp - move.t < 100) : [];
  touch = null;
  if (moves.length < 2) return;
  // px per ms, over at least a frame and capped, so coalesced moves with near-equal timestamps can't fling to the terminus.
  let velocity = moves.slice(1).reduce((sum, move) => sum + move.dx, 0) / Math.max(moves.at(-1).t - moves[0].t, 16);
  velocity = Math.max(-5, Math.min(velocity, 5));
  let then = performance.now();
  const step = now => {
    if (dialog.open) return;
    const elapsed = Math.max(0, now - then); // a frame's timestamp can precede the performance.now() taken before it
    velocity *= .95 ** (elapsed / 16);
    if (Math.abs(velocity) < .02) return;
    scrollBy({top: velocity * elapsed, behavior: 'instant'});
    then = now;
    glide = requestAnimationFrame(step);
  };
  glide = requestAnimationFrame(step);
});
addEventListener('touchcancel', () => { touch = null; });
document.addEventListener('langchange', () => { renderPin(); setDoor(bus.classList.contains('door-open')); current = -1; render(); });
