// Sound + notification helpers (same behaviour as the original tracker).
let soundOn = true;
let lastSfxAt = 0;
let appOpenPlayed = false;

const make = (src, volume) => {
  try { const a = new Audio(src); a.preload = 'auto'; a.volume = volume; return a; } catch (e) { return null; }
};
let alertAudio = null;
let questAudio = null;
function ensure() {
  if (!alertAudio) alertAudio = make('./alert.mp3', 0.78);
  if (!questAudio) questAudio = make('./quest.mp3', 0.82);
}

export const setSoundOn = (v) => { soundOn = !!v; };

function play(audio, isAlert) {
  if (!audio) return;
  try {
    audio.pause(); audio.currentTime = 0;
    const p = audio.play();
    if (p && p.then) p.then(() => { if (isAlert) appOpenPlayed = true; }).catch(() => {});
  } catch (e) { /* autoplay blocked */ }
}

export function sfx(kind = 'tap') {
  ensure();
  if (!soundOn || ['tap', 'touch', 'check'].includes(kind)) return;
  const now = performance.now();
  if (now - lastSfxAt < 140) return;
  lastSfxAt = now;
  if (kind === 'quest' || kind === 'checkbox') return play(questAudio, false);
  play(alertAudio, true);
}

// Every enabled button gives the short "quest" blip after its own action.
export function buttonBlip() {
  ensure();
  if (!soundOn) return;
  try { questAudio.pause(); questAudio.currentTime = 0; const p = questAudio.play(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* ignore */ }
}

export function tryAppOpenSound() {
  ensure();
  if (!appOpenPlayed && soundOn) play(alertAudio, true);
}

export function notifyPenalty(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { body, tag: 'arise-penalty', renotify: true, requireInteraction: true, icon: './icon-192.png', badge: './icon-192.png' };
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((r) => r.showNotification(title, opts)).catch(() => { try { new Notification(title, opts); } catch (e) { /* ignore */ } });
  } else {
    try { new Notification(title, opts); } catch (e) { /* ignore */ }
  }
}
