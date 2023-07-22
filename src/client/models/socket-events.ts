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
  state: string;
}
