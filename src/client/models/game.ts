export enum PageState {
  Menu,
  Queueing,
  Game,
}

// ENSURE THIS STAYS IN SYNC with server/main GameState
export enum GameState {
  Start,
  FirstPlayer,
  BeforeImprov,
  Improv,
  BeforeAwaitImprov,
  AwaitImprov,
  BeforeReplay,
  Replay,
  BeforeAwaitReplay,
  AwaitReplay,
  RoundResults,
  GameResults,
}

export interface Note {
  time: number;
  sound: string;
}
