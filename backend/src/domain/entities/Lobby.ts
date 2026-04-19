export const LobbyStatus = {
  WAITING: 'waiting',
  READY: 'ready',
  BATTLING: 'battling',
  FINISHED: 'finished',
} as const;

export type LobbyStatusValue = (typeof LobbyStatus)[keyof typeof LobbyStatus];

export interface LobbyParticipant {
  playerId: string;
  isReady: boolean;
}

export interface LobbyProps {
  id: string;
  code: string;
  players?: LobbyParticipant[];
  status?: LobbyStatusValue;
}

export class Lobby {
  id: string;
  code: string;
  players: LobbyParticipant[];
  status: LobbyStatusValue;

  constructor({ id, code, players = [], status = LobbyStatus.WAITING }: LobbyProps) {
    this.id = id;
    this.code = code;
    this.players = players;
    this.status = status;
  }
}
