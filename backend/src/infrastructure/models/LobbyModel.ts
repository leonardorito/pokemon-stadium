import mongoose, { Schema, type Types } from 'mongoose';
import type { LobbyStatusValue } from '../../domain/entities/Lobby.js';

export interface LobbyParticipantDoc {
  playerId: Types.ObjectId;
  isReady: boolean;
}

const lobbyParticipantSchema = new Schema<LobbyParticipantDoc>(
  {
    playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    isReady: { type: Boolean, default: false },
  },
  { _id: false },
);

export interface LobbyDoc {
  code: string;
  players: LobbyParticipantDoc[];
  status: LobbyStatusValue;
}

const lobbySchema = new Schema<LobbyDoc>(
  {
    code: { type: String, required: true, unique: true },
    players: { type: [lobbyParticipantSchema], default: [] },
    status: {
      type: String,
      enum: ['waiting', 'ready', 'battling', 'finished'],
      default: 'waiting',
    },
  },
  { timestamps: true },
);

export const LobbyModel = mongoose.model<LobbyDoc>('Lobby', lobbySchema);
