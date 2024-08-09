const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const format = require("./utils/FormatMSG");

const app = express();

app.use(cors());

const server = app.listen(4000, (_) => {
  console.log("Server is running on 4000");
});

const io = socketIO(server, {
  cors: "*",
});

io.on("connection", (socket) => {
  console.log("Client connected");
  const Bot = "Room Manager";
  socket.emit("message", format(Bot, "Welcomt to the Room !"));
  socket.broadcast.emit(
    "message",
    format(Bot, "Anonymous User joined the room.")
  );
  socket.on("disconnect", () => {
    io.emit("message", format(Bot, "Anonymous User left the room."));
  });
});
