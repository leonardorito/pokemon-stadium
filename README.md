# Pokémon Stadium Lite

## Overview

Multiplayer real-time Pokémon battler — two trainers each roll a team of three random Pokémon, then trade attacks until one side has no Pokémon left. Built with Node.js + Express + Socket.IO + MongoDB on the backend and React + Vite on the frontend, all wired together via Docker Compose.

## Prerequisites

- Docker + Docker Compose (nothing else needed — Node, MongoDB, and tooling all run inside containers)

## Quick Start

```bash
docker compose up --build
open http://localhost:5173
```

## Dev Mode (hot reload)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

The dev override bind-mounts `./backend` and `./frontend` into their containers, runs `tsx watch` for the backend and `npm run dev` for the frontend.

## How to Play

1. Open `http://localhost:5173` in two browser tabs (use incognito for the second tab so the two players have independent sessionStorage).
2. Each player enters a nickname and clicks **Battle Now**.
3. Click **Roll Team** to get 3 random Pokémon.
4. Click **Ready** when you're set.
5. Attack on your turn — last team standing wins.

## Architecture

Clean Architecture — domain and application layers have **zero** framework dependencies. Mongoose, Express, and Socket.IO live exclusively under `infrastructure/`.

- `domain/` — plain JS entities (`Player`, `Lobby`, `Battle`, `PokemonState`) + repository interfaces
- `application/` — use cases (`JoinLobby`, `AssignPokemon`, `SetReady`) + services (`PokemonCatalogService`, `BattleEngine`)
- `infrastructure/` — Express + Socket.IO transport, Mongoose schemas, concrete repositories

The Socket.IO handler module is the composition root for the live battle protocol — every server event flows through one `registerSocketHandlers.ts` and delegates to the use cases.

### Socket events

| Direction | Event | Purpose |
|-----------|-------|---------|
| Client → Server | `join_lobby` | Enter a lobby (or rejoin via `playerId`) |
| Client → Server | `assign_pokemon` | Roll a 3-Pokémon team |
| Client → Server | `ready` | Mark the player ready; flips lobby to `battling` when both ready |
| Client → Server | `attack` | Take a turn |
| Client → Server | `sync_battle` | Request a private snapshot of the live battle (used on reconnect) |
| Server → Client | `joined` | Private — confirms `playerId` + `lobbyId` after `join_lobby` |
| Server → Client | `lobby_status` | Broadcast — current participants, teams, status |
| Server → Client | `battle_start` | Broadcast — battle created, who moves first |
| Server → Client | `turn_result` | Broadcast — damage dealt, defender HP, next turn |
| Server → Client | `pokemon_defeated` | Broadcast — a Pokémon hit 0 HP |
| Server → Client | `pokemon_enter` | Broadcast — auto-swap to next bench Pokémon |
| Server → Client | `turn_change` | Broadcast — turn handed off |
| Server → Client | `battle_end` | Broadcast — winner declared, lobby flips to `finished` |
| Server → Client | `battle_sync` | Private — battle snapshot on reconnect |
| Server → Client | `error` | Private — error envelope `{ message: string }` |

## Environment Variables

### Backend
- `MONGO_URI` — MongoDB connection string (`mongodb://mongo:27017/pokemon-stadium` in compose)
- `PORT` — backend HTTP/Socket.IO port (default `8080`)
- `CLIENT_URL` — frontend URL for CORS (`http://localhost:5173` in compose)
- `POKEMON_API_URL` — external Pokémon API base URL

### Frontend
- `VITE_BACKEND_URL` — backend URL for the browser's Socket.IO client (`http://localhost:8080`). Baked into the production bundle at Docker build time via `ARG VITE_BACKEND_URL`; injected at runtime in dev mode via `environment:`.

## Tech Stack

- **Backend**: Node.js 24, Express 5, Socket.IO 4, Mongoose 8, TypeScript
- **Frontend**: Vite 8, React 19, TailwindCSS 4, Zustand 5, TypeScript
- **Database**: MongoDB 7
- **Infra**: Docker Compose

## Live Demo

[https://pokemon-stadium-frontend-production.up.railway.app](https://pokemon-stadium-frontend-production.up.railway.app)

> Open in two browser tabs to play a full match.