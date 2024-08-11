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

const users = [];

const saveUser = (id, username, room) => {
  const user = { id, username, room };
  users.push(user);
  return user;
};

const getDisconnectUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (id !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getRoomUsers = (room) => {
  return users.filter((user) => user.room === room);
};

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

    socket.on("message_send", (data) => {
      io.to(user.room).emit("message", format(user.username, data));
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
    }
  });
});
