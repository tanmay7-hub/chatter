import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const registerPresenceHandlers = (
  io,
  socket,
  onlineUser,
  socketToUser
) => {


  socket.on("user-logged-in", async (data) => {
    const userId = socket.user.id;

    await User.updateOne(
      { _id: userId },
      { $set: { isOnline: true } }
    );

    onlineUser[userId] = socket.id;
    socketToUser[socket.id] = userId;


    const messages = await Message.find({
      receiverId: userId,
      delivered: false,
    });

    await Message.updateMany(
      {
        receiverId: userId,
        delivered: false,
      },
      {
        $set: { delivered: true },
      }
    );

    for (const msg of messages) {
      const senderSocketId = onlineUser[msg.senderId];

      if (senderSocketId) {
        io.to(senderSocketId).emit("message-delivered", {
          messageId: msg._id,
        });
      }
    }

    io.emit("refresh-users");
  });


  socket.on("disconnect", async () => {
    console.log(`socket disconnected: ${socket.id}`);

    const userId = socketToUser[socket.id];

    if (!userId) {
      return;
    }

    await User.updateOne(
      { _id: userId },
      {
        $set: {
          lastSeen: new Date(),
          isOnline: false,
        },
      }
    );

    delete onlineUser[userId];
    delete socketToUser[socket.id];

    io.emit("refresh-users");
  });

};