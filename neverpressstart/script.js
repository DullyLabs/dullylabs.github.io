'use strict';
const $ = (id) => document.getElementById(id);
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
const dialog = $('break-dialog');
let seconds = 20;
let paused = false;
let completed = false;
let away = false;
let previousFocus;
let lastTick = Date.now();
let presses = 0;
const replies = ['You pressed it. A promising start to Never Press Start.', 'Still unnecessary. But lovely enthusiasm.', 'The curator is making a note.', 'Okay. You are now part of the exhibition.'];
function render() {
  $('countdown').textContent = `00:${String(seconds).padStart(2, '0')}`;
  $('pause').textContent = completed ? 'Replay demo' : paused ? 'Resume demo' : 'Pause demo';
  document.querySelector('.demo-bar').classList.toggle('is-paused', paused || completed);
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
  completed = true;
  $('demo-status').textContent = 'That was hard to ignore.';
  $('demo-detail').textContent = 'The Mac app does this after 20 minutes of work.';
  render();
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
  if (completed) {
    seconds = 20; completed = false; paused = false; away = false;
    $('away').textContent = 'Pretend to step away ↗';
    $('demo-status').textContent = 'Already going. No start button required.';
    $('demo-detail').textContent = '20-second website demo. The Mac app gives you 20 minutes.';
  } else {
    paused = !paused;
    if (away && !paused) returnFromAway();
    else $('demo-status').textContent = paused ? 'Demo paused.' : 'You’re here. It’s ticking.';
  }
  lastTick = Date.now(); render();
});
function returnFromAway() {
  away = false; paused = false; completed = false; seconds = 20;
  $('away').textContent = 'Pretend to step away ↗';
  $('demo-status').textContent = 'Welcome back. A fresh 20 minutes.';
  $('demo-detail').textContent = '20-second website demo. The Mac app gives you 20 minutes.';
  lastTick = Date.now(); render();
}
$('away').addEventListener('click', () => {
  if (away) { returnFromAway(); return; }
  away = true; paused = true; completed = false; seconds = 20;
  $('away').textContent = 'I’m back at my desk ↗';
  $('demo-status').textContent = 'Away from your desk? That’s a break.';
  $('demo-detail').textContent = 'Simulating 5 minutes away.';
  render();
});
setInterval(() => {
  const now = Date.now();
  if (!paused && !completed && !dialog.open && !document.hidden && now - lastTick >= 1000) {
    seconds = Math.max(0, seconds - Math.floor((now - lastTick) / 1000));
    lastTick = now; render();
    if (seconds === 0) { completed = true; showBreak(); }
  } else if (paused || completed || dialog.open || document.hidden) lastTick = now;
}, 200);
document.addEventListener('visibilitychange', () => { lastTick = Date.now(); });
render();
