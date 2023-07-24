import { Note } from "./game";

export interface ServerAckEvent {
  id: string;
}

export interface MatchFoundEvent {
  roomID: string;
  opponentID: string;
}

export interface StartingPlayerEvent {
  startingPlayer: string;
}

export interface GameStateEvent {
  state: number;
}

export interface HealthStateEvent {
  [id: string]: number;
}

export interface SendImprovEvent {
  test: string;
}

export interface ReceiveImprovEvent {
  improv: Note[];
}

export interface SendReplayEvent {
  test: string;
}
