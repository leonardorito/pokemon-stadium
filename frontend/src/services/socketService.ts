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
  if (socket && currentUrl === target) return socket;
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
  socket?.disconnect();
  socket = null;
  currentUrl = null;
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
