export type AudioTrack = 'opening' | 'battle' | 'victory';

const SOURCES: Record<AudioTrack, string> = {
  opening: '/audio/opening.mp3',
  battle: '/audio/battle.mp3',
  victory: '/audio/victory.mp3',
};

const LOOP: Record<AudioTrack, boolean> = {
  opening: true,
  battle: true,
  victory: false,
};

const TARGET_VOLUME = 0.45;
const FADE_MS = 200;
const FADE_STEPS = 10;
const MUTE_KEY = 'audioMuted';

type Entry = { track: AudioTrack; el: HTMLAudioElement };

let current: Entry | null = null;
let fadeTimer: number | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  for (const fn of listeners) fn();
}

function readMuted(): boolean {
  try {
    const raw = sessionStorage.getItem(MUTE_KEY);
    if (raw === null) return true;
    return raw !== 'false';
  } catch {
    return true;
  }
}

function writeMuted(value: boolean): void {
  try {
    sessionStorage.setItem(MUTE_KEY, value ? 'true' : 'false');
  } catch {
    // storage unavailable — ignore
  }
}

let muted = readMuted();

function clearFade(): void {
  if (fadeTimer !== null) {
    window.clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

function stopElement(el: HTMLAudioElement): void {
  try {
    el.pause();
    el.src = '';
    el.load();
  } catch {
    // ignore teardown errors
  }
}

function fadeOutAndStop(entry: Entry): void {
  clearFade();
  const el = entry.el;
  const startVolume = el.volume;
  const tick = startVolume / FADE_STEPS;
  let step = 0;

  fadeTimer = window.setInterval(() => {
    step += 1;
    try {
      el.volume = Math.max(0, startVolume - tick * step);
    } catch {
      // ignore
    }
    if (step >= FADE_STEPS) {
      clearFade();
      stopElement(el);
    }
  }, FADE_MS / FADE_STEPS);
}

function startTrack(track: AudioTrack): void {
  const el = new Audio(SOURCES[track]);
  el.loop = LOOP[track];
  el.preload = 'auto';
  el.volume = TARGET_VOLUME;

  el.addEventListener('error', () => {
    // file missing or decode failed — fail silently
    if (current?.el === el) current = null;
  });

  const next: Entry = { track, el };
  current = next;

  const attempt = el.play();
  if (attempt && typeof attempt.catch === 'function') {
    attempt.catch(() => {
      // autoplay blocked or load failure — fail silently, clear reference if unchanged
      if (current === next) current = null;
    });
  }
}

export function play(track: AudioTrack): void {
  if (muted) return;
  if (current && current.track === track) {
    if (!current.el.paused || current.el.ended) return;
  }

  if (current) {
    const previous = current;
    current = null;
    fadeOutAndStop(previous);
  }

  startTrack(track);
}

export function stop(): void {
  if (!current) return;
  const previous = current;
  current = null;
  fadeOutAndStop(previous);
}

export function setMuted(value: boolean): void {
  if (muted === value) return;
  muted = value;
  writeMuted(value);

  if (value && current) {
    const previous = current;
    current = null;
    fadeOutAndStop(previous);
  }

  notify();
}

export function isMuted(): boolean {
  return muted;
}

export function currentTrack(): AudioTrack | null {
  return current?.track ?? null;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
