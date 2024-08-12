const Message = require("../models/message");
const Chat_Rooms = ["node", "react", "javascript"];

exports.getOldMessage = (req, res, next) => {
  const { roomName } = req.params;
  if (Chat_Rooms.includes(roomName)) {
    Message.find({ room: roomName })
      .select("username message send_at")
      .then((messages) => {
        res.status(200).json(messages);
      });
  } else {
    res.status(403).json("Room not found.");
  }
};
