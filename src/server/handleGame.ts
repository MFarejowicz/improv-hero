import { Socket } from "socket.io";

import { io } from "./base";

import { GameState } from "./GameState";
import { calculateHitTiming } from "./game";

const TEMPO = 80;
const ONE_BEAT = (1000 * 60) / 80; // 750

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function handleGame(roomID: string, player1: Socket, player2: Socket) {
  // set each player's starting health
  player1.data.health = 100;
  player2.data.health = 100;

  await delay(1_000);
  const players = [player1, player2];
  const startingPlayerIndex = [0, 1][Math.floor(Math.random() * 2)];
  let improvPlayer = players[startingPlayerIndex];
  let replayPlayer = players[1 - startingPlayerIndex];
  io.to(roomID).emit("starting-player", { startingPlayer: improvPlayer.id });

  await delay(2_000);

  while (player1.data.health > 0 && player2.data.health > 0) {
    // brief break before the improv players improvs
    improvPlayer.emit("game-state", { state: GameState.BeforeImprov });
    replayPlayer.emit("game-state", { state: GameState.BeforeAwaitImprov });
    await delay(8 * ONE_BEAT);

    // improv player go
    // replay player wait
    improvPlayer.emit("game-state", { state: GameState.Improv });
    replayPlayer.emit("game-state", { state: GameState.AwaitImprov });

    await delay(16 * ONE_BEAT);

    // ask the improv player for their improv, then send it to the replay player
    const improv = await improvPlayer.emitWithAck("send-improv", { test: "test" });
    replayPlayer.emit("receive-improv", { improv });

    // brief break before the replay player has to reply
    improvPlayer.emit("game-state", { state: GameState.BeforeAwaitReplay });
    replayPlayer.emit("game-state", { state: GameState.BeforeReplay });

    await delay(8 * ONE_BEAT);

    // improv player wait
    // replay player go
    improvPlayer.emit("game-state", { state: GameState.AwaitReplay });
    replayPlayer.emit("game-state", { state: GameState.Replay });

    await delay(16 * ONE_BEAT);

    // ask the replay player for their replay
    const replay = await replayPlayer.emitWithAck("send-replay", { test: "test" });

    // TODO: score

    const score = calculateHitTiming(improv, replay);

    // round results screen
    improvPlayer.emit("game-state", { state: GameState.RoundResults });
    replayPlayer.emit("game-state", { state: GameState.RoundResults });

    // TODO: change these random numbers with the scored updates
    const damage = 100 - score;
    replayPlayer.data.health -= damage;

    const healthData: Record<string, number> = {};
    healthData[improvPlayer.id] = improvPlayer.data.health;
    healthData[replayPlayer.id] = replayPlayer.data.health;
    io.to(roomID).emit("health-state", healthData);

    await delay(1_000);

    // swap roles and repeat!
    [improvPlayer, replayPlayer] = [replayPlayer, improvPlayer];
  }

  io.to(roomID).emit("game-state", { state: GameState.GameResults });
}
