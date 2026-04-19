import 'dotenv/config';
import { connectDb } from './infrastructure/db/connection.js';
import { createServer } from './infrastructure/http/server.js';
import { MongoPlayerRepository } from './infrastructure/repositories/MongoPlayerRepository.js';
import { MongoLobbyRepository } from './infrastructure/repositories/MongoLobbyRepository.js';
import { MongoBattleRepository } from './infrastructure/repositories/MongoBattleRepository.js';
import { PokemonCatalogService } from './application/services/PokemonCatalogService.js';
import { BattleEngine } from './application/services/BattleEngine.js';
import { JoinLobby } from './application/usecases/JoinLobby.js';
import { AssignPokemon } from './application/usecases/AssignPokemon.js';
import { SetReady } from './application/usecases/SetReady.js';
import { LeaveLobby } from './application/usecases/LeaveLobby.js';
import { registerSocketHandlers } from './infrastructure/socket/registerSocketHandlers.js';

const PORT = Number(process.env.PORT) || 8080;
const MONGO_URI = process.env.MONGO_URI;
const POKEMON_API_URL = process.env.POKEMON_API_URL;

async function main(): Promise<void> {
  if (!POKEMON_API_URL) {
    throw new Error('POKEMON_API_URL env var is required');
  }

  await connectDb(MONGO_URI);

  const playerRepo = new MongoPlayerRepository();
  const lobbyRepo = new MongoLobbyRepository();
  const battleRepo = new MongoBattleRepository();
  const catalog = new PokemonCatalogService(POKEMON_API_URL);

  const joinLobby = new JoinLobby(playerRepo, lobbyRepo);
  const assignPokemon = new AssignPokemon(lobbyRepo, battleRepo, catalog);
  const setReady = new SetReady(lobbyRepo);
  const leaveLobby = new LeaveLobby(lobbyRepo);
  const battleEngine = new BattleEngine(lobbyRepo, battleRepo);

  const { httpServer, io } = createServer();

  registerSocketHandlers({
    io,
    lobbyRepo,
    battleRepo,
    playerRepo,
    joinLobby,
    assignPokemon,
    setReady,
    leaveLobby,
    battleEngine,
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening on 0.0.0.0:${PORT}`);
  });
}

main().catch((err: unknown) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
