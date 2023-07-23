import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import ViteExpress from "vite-express";

const app = express();
const server = http.createServer(app);
// socket.io guide claims that cors might be necessary, but it does not seem so for me
// const io = new Server(server, { cors: { origin: "http://localhost:3000" } });
const io = new Server(server);

const queue: Socket[] = [];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRoomID(player1: Socket, player2: Socket) {
  // looks like "abcde-vwxyz"
  return [player1, player2]
    .map((el) => el.id)
    .sort()
    .join("-");
}

// ENSURE THIS STAYS IN SYNC with client/components/game GameState
enum GameState {
  Start,
  FirstPlayer,
  Improv,
  AwaitImprov,
  Replay,
  AwaitReplay,
  Results,
}

async function handleGame(roomID: string, player1: Socket, player2: Socket) {
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
  // let's get this working once before we swap roles and repeat
  while (player1.data.health > 0 && player2.data.health > 0) {
    // improv player jam
    // replay player wait
    improvPlayer.emit("game-state", { state: GameState.Improv });
    replayPlayer.emit("game-state", { state: GameState.AwaitImprov });

    await delay(10_000);

    // improv player wait
    // replay player jam
    improvPlayer.emit("game-state", { state: GameState.AwaitReplay });
    replayPlayer.emit("game-state", { state: GameState.Replay });

    await delay(10_000);

    const randomDamage = Math.floor(Math.random() * 80 + 50);
    replayPlayer.data.health -= randomDamage;

    const healthData: Record<string, number> = {};
    healthData[improvPlayer.id] = improvPlayer.data.health;
    healthData[replayPlayer.id] = replayPlayer.data.health;
    io.to(roomID).emit("health-state", healthData);

    await delay(1_000);

    // swap roles and repeat!
    [improvPlayer, replayPlayer] = [replayPlayer, improvPlayer];
  }

  io.to(roomID).emit("game-state", { state: GameState.Results });
}

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

io.on("connection", (socket) => {
  socket.emit("server-ack", { id: socket.id });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    if (queue.includes(socket)) {
      queue.shift();
    }
  });

  socket.on("start-queue", async () => {
    console.log("queue received");
    const opponent = queue.shift();
    if (opponent) {
      const roomID = getRoomID(socket, opponent);
      // let both sockets know the match has been found
      socket.emit("match-found", { roomID, opponentID: opponent.id });
      opponent.emit("match-found", { roomID, opponentID: socket.id });
      // add both sockets to a shared room, which all future events can go to
      socket.join(roomID);
      opponent.join(roomID);
      // allow some time for switching to game page
      delay(500);
      handleGame(roomID, socket, opponent);
    } else {
      queue.push(socket);
    }
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});

ViteExpress.bind(app, server);
