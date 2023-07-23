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

export interface ReceiveJamEvent {
  jam: Note[];
}
