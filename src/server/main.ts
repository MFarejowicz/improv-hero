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
    if (queue.includes(socket)) {
      queue.shift();
    }
  });

  socket.on("start-queue", () => {
    console.log("queue received");
    const opponent = queue.shift();
    if (opponent) {
      const roomID = getRoomID(socket, opponent);
      socket.emit("match-found", { roomID, opponentID: opponent.id });
      opponent.emit("match-found", { roomID, opponentID: socket.id });
      socket.join(roomID);
      opponent.join(roomID);
    } else {
      queue.push(socket);
    }
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});

ViteExpress.bind(app, server);
