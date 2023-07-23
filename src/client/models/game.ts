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
  Results,
}

export interface Note {
  time: number;
  sound: string;
}
