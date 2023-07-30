import { Socket } from "socket.io";
import ViteExpress from "vite-express";
import "dotenv/config";

import { app, server, io } from "./base";
import { calculateHitTiming } from "./game";
import { delay } from "./utils";
import { GameState } from "./GameState";
import { handleGame } from "./handleGame";

type QueueData = { socket: Socket; name: string };

const queue: QueueData[] = [];
// const games: Record<string, Game> = {};

function getRoomID(player1: Socket, player2: Socket) {
  // looks like "abcde-vwxyz"
  return [player1, player2]
    .map((el) => el.id)
    .sort()
    .join("-");
}

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

io.on("connection", (socket) => {
  socket.emit("server-ack", { id: socket.id });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    if (queue.some((item) => item.socket === socket)) {
      queue.shift();
    }
  });

  socket.on("start-queue", async (name: string) => {
    console.log("queue received");
    const opponent = queue.shift();
    if (opponent) {
      const roomID = getRoomID(socket, opponent.socket);
      // let both sockets know the match has been found
      socket.emit("match-found", { roomID, opponentID: opponent.socket.id, opponentName: opponent.name });
      opponent.socket.emit("match-found", { roomID, opponentID: socket.id, opponentName: name });
      // add both sockets to a shared room, which all future events can go to
      socket.join(roomID);
      socket.data.matchRoom = roomID;
      opponent.socket.join(roomID);
      opponent.socket.data.matchRoom = roomID;
      // allow some time for switching to game page
      await delay(500);
      handleGame(roomID, socket, opponent.socket);
    } else {
      queue.push({ socket, name });
    }
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("listening on *:3000");
});

ViteExpress.bind(app, server);
