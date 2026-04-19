import { useEffect, useState, useSyncExternalStore } from 'react';
import { Outlet } from 'react-router-dom';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { useReconnect } from '../hooks/useReconnect';
import { useAudio } from '../hooks/useAudio';
import { useLobbyStore } from '../store/lobbyStore';
import { isConnected, subscribeConnection } from '../services/socketService';
import * as audioService from '../services/audioService';
import { ScanlineOverlay } from './ScanlineOverlay';

export function AppShell() {
  useSocketEvents();
  useAudio();
  const { isRehydrating } = useReconnect();
  const errorMessage = useLobbyStore((s) => s.errorMessage);
  const clearError = useLobbyStore((s) => s.clearError);
  const code = useLobbyStore((s) => s.code);
  const status = useLobbyStore((s) => s.status);

  const muted = useSyncExternalStore(
    audioService.subscribe,
    audioService.isMuted,
    audioService.isMuted,
  );

  const connected = useSyncExternalStore(subscribeConnection, isConnected, isConnected);

  const [tickerKey, setTickerKey] = useState(0);

  useEffect(() => {
    setTickerKey((k) => k + 1);
  }, [status]);

  useEffect(() => {
    if (!errorMessage) return;
    const t = setTimeout(() => clearError(), 4500);
    return () => clearTimeout(t);
  }, [errorMessage, clearError]);

  return (
    <div className="relative min-h-dvh">
      <ScanlineOverlay />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 border-b border-stadium-edge px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center border-2 border-arc-yellow bg-stadium-base text-arc-yellow shadow-[4px_4px_0_0_#1f2547]">
            <span className="font-display text-2xl">P</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl tracking-[0.18em] text-white uppercase">
              Pokémon Stadium
            </div>
            <div className="font-mono text-[0.6rem] tracking-[0.45em] text-arc-cyan uppercase">
              LITE • BROADCAST FEED
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[0.65rem] tracking-widest uppercase">
          {code && (
            <div className="hud-tag text-arc-yellow">
              ROOM <span className="ml-2 font-mono text-white">{code}</span>
            </div>
          )}
          {status && (
            <div className="hud-tag text-arc-cyan">
              STATUS <span className="ml-2 font-mono text-white">{status}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => audioService.setMuted(!muted)}
            aria-pressed={!muted}
            aria-label={muted ? 'Unmute stadium audio' : 'Mute stadium audio'}
            title={muted ? 'Unmute' : 'Mute'}
            className={`group relative grid h-9 w-9 place-items-center border-2 bg-stadium-base transition-colors duration-150 ${
              muted
                ? 'border-stadium-line text-white/40 hover:border-white/40 hover:text-white/70'
                : 'border-arc-lime text-arc-lime shadow-[0_0_14px_rgba(184,255,60,0.55)] hover:text-white'
            }`}
          >
            <span
              aria-hidden
              className="absolute inset-0 -z-10 opacity-60"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)',
              }}
            />
            {muted ? <SpeakerMutedIcon /> : <SpeakerOnIcon />}
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? 'bg-arc-lime shadow-[0_0_8px_rgba(184,255,60,0.8)]' : 'bg-stadium-edge'
              }`}
            />
            <span className="text-white/55">{connected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
        </div>
      </header>

      <div
        key={tickerKey}
        aria-hidden
        className="pointer-events-none relative z-0 overflow-hidden border-b border-stadium-edge bg-stadium-deep py-1 text-arc-yellow/60"
      >
        <div className="flex w-max gap-12 whitespace-nowrap font-mono text-[0.6rem] tracking-[0.5em] uppercase" style={{ animation: 'ticker 60s linear infinite' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex items-center gap-12">
              ▲ STADIUM CHANNEL ▲ TRAINERS LIVE ▲ ROUND IN PROGRESS ▲ AUTHORIZED FEED ▲ CHANNEL 09 ▲ STAND BY FOR ROAR ▲
            </span>
          ))}
        </div>
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10">
        <Outlet />
      </main>

      {errorMessage && (
        <div
          role="alert"
          className="animate-badge-pop fixed right-6 bottom-6 z-50 max-w-sm border-2 border-arc-magenta bg-stadium-deep p-4 shadow-[6px_6px_0_0_#1f2547]"
        >
          <div className="stencil-label text-arc-magenta">Stadium Error</div>
          <div className="mt-1 font-mono text-sm text-white">{errorMessage}</div>
          <button
            onClick={clearError}
            className="absolute top-2 right-2 font-display text-xs text-white/40 transition hover:text-white"
            aria-label="dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {isRehydrating && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[60] grid place-items-center bg-stadium-deep/95 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 animate-pulse rounded-full bg-arc-cyan shadow-[0_0_12px_rgba(33,212,253,0.9)]" />
              <span className="h-3 w-3 animate-pulse rounded-full bg-arc-yellow shadow-[0_0_12px_rgba(247,202,24,0.9)] [animation-delay:0.15s]" />
              <span className="h-3 w-3 animate-pulse rounded-full bg-arc-magenta shadow-[0_0_12px_rgba(238,58,140,0.9)] [animation-delay:0.3s]" />
            </div>
            <div className="stencil-label text-arc-cyan">▒ Reconnecting</div>
            <div className="font-display text-3xl tracking-widest text-white uppercase md:text-4xl">
              Reconnecting to stadium…
            </div>
            <p className="max-w-sm font-mono text-[0.7rem] tracking-widest text-white/50 uppercase">
              ▸ Restoring session. Stand by.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function SpeakerOnIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
      <rect x="2" y="7" width="3" height="6" fill="currentColor" shapeRendering="crispEdges" />
      <path
        d="M5 7 L10 3 L10 17 L5 13 Z"
        fill="currentColor"
        shapeRendering="crispEdges"
      />
      <path
        d="M12.5 6.5 Q15 10 12.5 13.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M15 4.5 Q18.5 10 15 15.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function SpeakerMutedIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
      <rect x="2" y="7" width="3" height="6" fill="currentColor" shapeRendering="crispEdges" />
      <path
        d="M5 7 L10 3 L10 17 L5 13 Z"
        fill="currentColor"
        shapeRendering="crispEdges"
      />
      <path
        d="M13 7 L18 13 M18 7 L13 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
