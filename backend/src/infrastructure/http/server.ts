import http from 'node:http';
import express, { type Application, type ErrorRequestHandler } from 'express';
import cors from 'cors';
import { Server as SocketIoServer } from 'socket.io';

export interface ServerHandle {
  app: Application;
  httpServer: http.Server;
  io: SocketIoServer;
}

export function createServer(): ServerHandle {
  const app = express();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  app.use(cors({ origin: clientUrl }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const status = (err as { status?: number }).status ?? 500;
    const message = (err as { message?: string }).message ?? 'Internal error';
    res.status(status).json({ error: message });
  };
  app.use(errorHandler);

  const httpServer = http.createServer(app);

  const io = new SocketIoServer(httpServer, {
    cors: { origin: clientUrl },
  });

  return { app, httpServer, io };
}
