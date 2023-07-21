import express from "express";
import http from "http";
import { Server } from "socket.io";
import ViteExpress from "vite-express";

const app = express();
const server = http.createServer(app);
// socket.io guide claims that cors might be necessary, but it does not seem so for me
// const io = new Server(server, { cors: { origin: "http://localhost:3000" } });
const io = new Server(server);

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.emit("hello from server", { name: "test" });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("queue", (data) => {
    console.log("queue received");
    console.log(data);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});

ViteExpress.bind(app, server);
