import mongoose, { Schema } from 'mongoose';

export interface PlayerDoc {
  name: string;
  socketId: string | null;
}

const playerSchema = new Schema<PlayerDoc>(
  {
    name: { type: String, required: true },
    socketId: { type: String, default: null },
  },
  { timestamps: true },
);

export const PlayerModel = mongoose.model<PlayerDoc>('Player', playerSchema);
