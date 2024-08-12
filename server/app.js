const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const format = require("./utils/FormatMSG");
const { getDisconnectUser, getRoomUsers, saveUser } = require("./user");
const mongooe = require("mongoose");
require("dotenv").config();
const Message = require("./models/message");
const messageController = require("./controllers/messageController");

const app = express();

mongooe.connect(process.env.MONGO_URL).then(() => {
  console.log("Connected to DB.");
});

app.use(cors());

app.get("/chat/:roomName", messageController.getOldMessage);

const server = app.listen(4000, (_) => {
  console.log("Server is running on 4000");
});

const io = socketIO(server, {
  cors: "*",
});

io.on("connection", (socket) => {
  console.log("Client connected");
  const Bot = "Room Manager";

  socket.on("joined_room", (data) => {
    const { userName, room } = data;
    const user = saveUser(socket.id, userName, room);
    socket.join(user.room);

    socket.emit("message", format(Bot, "Welcomt to the Room !"));
    socket.broadcast
      .to(user.room)
      .emit("message", format(Bot, user.username + ` joined the room.`));

    // Listen Message from client
    socket.on("message_send", (data) => {
      io.to(user.room).emit("message", format(user.username, data));
      // stored messages in DB
      Message.create({
        username: user.username,
        message: data,
        room: user.room,
      });
    });

    io.to(user.room).emit("room_users", getRoomUsers(user.room));
  });

  socket.on("disconnect", () => {
    const user = getDisconnectUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        format(Bot, user.username + ` left the room.`)
      );
      io.to(user.room).emit("room_users", getRoomUsers(user.room));
    }
  });
});
