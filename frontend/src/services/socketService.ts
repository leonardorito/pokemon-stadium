import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentUrl: string | null = null;
const connectionListeners = new Set<() => void>();

function notifyConnection(): void {
  for (const fn of connectionListeners) fn();
}

export function connect(url?: string): Socket {
  const target = url ?? import.meta.env.VITE_BACKEND_URL;
  if (!target) throw new Error('No backend URL configured');
  if (socket && currentUrl === target) {
    // Same URL — reuse the existing socket instance so listeners stay bound.
    // If it's been disconnected (e.g., user hit "Exit Lobby"), reconnect it.
    if (!socket.connected) socket.connect();
    return socket;
  }
  socket?.disconnect();
  currentUrl = target;
  socket = io(target, {
    transports: ['websocket', 'polling'],
    reconnection: true,
  });
  socket.on('connect', notifyConnection);
  socket.on('disconnect', notifyConnection);
  return socket;
}

export function subscribeConnection(listener: () => void): () => void {
  connectionListeners.add(listener);
  return () => {
    connectionListeners.delete(listener);
  };
}

export function disconnect(): void {
  // Disconnects the underlying socket but keeps the singleton + listener
  // bindings intact so a later connect() with the same URL reconnects cleanly.
  // Used by the "Exit Lobby" flow: server runs its disconnect cleanup, then
  // when the user joins a fresh lobby we re-attach via socket.connect().
  socket?.disconnect();
}

export function emit(event: string, data?: unknown): void {
  socket?.emit(event, data);
}

export function on<T = unknown>(event: string, cb: (payload: T) => void): void {
  socket?.on(event, cb as (...args: unknown[]) => void);
}

export function off(event: string, cb?: (...args: unknown[]) => void): void {
  if (!socket) return;
  if (cb) socket.off(event, cb);
  else socket.off(event);
}

export function getSocket(): Socket | null {
  return socket;
}

export function isConnected(): boolean {
  return socket?.connected ?? false;
}
