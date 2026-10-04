'use strict';
const $ = (id) => document.getElementById(id);
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
const dialog = $('break-dialog');
let seconds = 20;
let paused = false;
let away = false;
let previousFocus;
let lastTick = Date.now();
let presses = 0;
const replies = ['You pressed it. A promising start to Never Press Start.', 'Still unnecessary. But lovely enthusiasm.', 'The curator is making a note.', 'Okay. You are now part of the exhibition.'];
function render() {
  $('countdown').textContent = `00:${String(seconds).padStart(2, '0')}`;
  $('pause').textContent = paused ? 'Resume demo' : 'Pause demo';
  document.querySelector('.demo-bar').classList.toggle('is-paused', paused);
}
// The interruption demonstrates the app; Pause, Escape and Return keep the demo controllable.
function showBreak() {
  if (dialog.open) return;
  previousFocus = document.activeElement;
  dialog.showModal();
  document.body.style.overflow = 'hidden';
  $('dismiss').focus();
}
function closeBreak() { dialog.close(); }
dialog.addEventListener('close', () => {
  document.body.style.overflow = '';
  restart('Break over. A fresh 20 minutes started on its own.');
  if (previousFocus instanceof HTMLElement && previousFocus !== document.body) previousFocus.focus();
});
$('dismiss').addEventListener('click', closeBreak);
dialog.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') { event.preventDefault(); closeBreak(); }
});
$('preview').addEventListener('click', showBreak);
$('start-button').addEventListener('click', () => {
  $('button-response').textContent = replies[Math.min(presses++, replies.length - 1)];
});
$('pause').addEventListener('click', () => {
  paused = !paused;
  if (away && !paused) restart('Welcome back. A fresh 20 minutes.');
  else { $('demo-status').textContent = paused ? 'Demo paused.' : 'You’re here. It’s ticking.'; lastTick = Date.now(); render(); }
});
function restart(status) {
  away = false; paused = false; seconds = 20;
  $('away').textContent = 'Pretend to step away ↗';
  $('demo-status').textContent = status;
  $('demo-detail').textContent = '20-second website demo. The Mac app gives you 20 minutes.';
  lastTick = Date.now(); render();
}
$('away').addEventListener('click', () => {
  if (away) { restart('Welcome back. A fresh 20 minutes.'); return; }
  away = true; paused = true; seconds = 20;
  $('away').textContent = 'I’m back at my desk ↗';
  $('demo-status').textContent = 'Away from your desk? That’s a break.';
  $('demo-detail').textContent = 'Simulating 5 minutes away.';
  render();
});
setInterval(() => {
  const now = Date.now();
  if (!paused && !dialog.open && !document.hidden && now - lastTick >= 1000) {
    const n = Math.floor((now - lastTick) / 1000);
    seconds = Math.max(0, seconds - n);
    lastTick += n * 1000; render();
    if (seconds === 0) showBreak();
  } else if (paused || dialog.open || document.hidden) lastTick = now;
}, 200);
document.addEventListener('visibilitychange', () => { lastTick = Date.now(); });
render();
