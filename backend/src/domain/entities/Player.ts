export interface PlayerProps {
  id: string;
  name: string;
  socketId?: string | null;
}

export class Player {
  id: string;
  name: string;
  socketId: string | null;

  constructor({ id, name, socketId = null }: PlayerProps) {
    this.id = id;
    this.name = name;
    this.socketId = socketId;
  }
}
