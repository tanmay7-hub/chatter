import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
export const registerMessageHandlers = (
  io,
  socket,
  socketToUser,
  redis_client,
) => {
  socket.on("chat-opened", async (data) => {
    const { senderId } = data;
    const receiverId = socketToUser[socket.id];

    if (!senderId) {
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return;
    }
    await Message.updateMany(
      {
        senderId,
        receiverId,
      },
      { $set: { seen: true } },
    );

    const senderSocketId = await redis_client.get(`online:${senderId}`);

    if (senderSocketId) {
      socket.to(senderSocketId).emit("update-seen", {
        senderId,
        receiverId,
      });
    }
  });

  socket.on("emoji-reaction", async (data) => {
    const { messageId, emoji } = data;
    const userId = socket.user.id;

    if (!messageId || !emoji) {
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return;
    }
    const msg = await Message.findById(messageId);

    if (!msg) {
      return;
    }
    // console.log(typeof(msg.senderId) , msg.senderId , typeof(msg.receiverId) , msg.receiverId );
    // console.log(typeof(userId) , userId );
    const isParticipant = msg.senderId?.toString() === userId ||  msg.receiverId?.toString() === userId;

    if (!isParticipant) {
      return;
    }
    const existingReaction = msg.reactions.find(
      (r) => r.userId.toString() === userId,
    );

    if (!existingReaction) {
      msg.reactions.push({
        userId,
        emoji,
      });
    } else if (existingReaction.emoji === emoji) {
      msg.reactions = msg.reactions.filter(
        (r) => r.userId.toString() !== userId,
      );
    } else {
      existingReaction.emoji = emoji;
    }

    await msg.save();

    const user1 = await redis_client.get(`online:${msg.senderId}`);
    const user2 = await redis_client.get(`online:${msg.receiverId}`);

    if (user1) {
      io.to(user1).emit("reaction-updated", {
        messageId: msg._id,
        reactions: msg.reactions,
      });
    }

    if (user2) {
      io.to(user2).emit("reaction-updated", {
        messageId: msg._id,
        reactions: msg.reactions,
      });
    }
  });

  socket.on("delete-message", async (data) => {
    const { msgId } = data;
    const userId = socket.user.id;

    if (!msgId) {
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(msgId)) {
      return;
    }

    const msg = await Message.findById(msgId);

    if (!msg) {
      return;
    }

    if (msg.senderId.toString() !== userId) {
      return;
    }

    if (msg.deletedforEveryone) {
      return;
    }

    await Message.updateOne(
      { _id: msgId },
      {
        $set: {
          deletedforEveryone: true,
        },
      },
    );

    const receiverSocketId = await redis_client.get(`online:${msg.receiverId}`);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message-deleted", {
        msgId,
      });
    }

    socket.emit("message-deleted", {
      msgId,
    });
  });

  socket.on("msg-send", async (data) => {
  try {
    const senderId = socket.user.id;
    const { receiverId, message, image, audio, replyTo } = data;



    if (!receiverId) return;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) return;

    const receiver = await User.findById(receiverId);

    if (!receiver) return;

    if (!message && !image && !audio) return;

    if (message && message.length > 5000) return;

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      imageUrl: image,
      audioUrl: audio,
      replyTo,
    });

    await newMessage.save();

    await newMessage.populate("senderId", "profilePic username");

    const receiverSocketId = await redis_client.get(
      `online:${receiverId}`
    );

    const senderSocketId = await redis_client.get(
      `online:${senderId}`
    );



    if (senderSocketId) {
      io.to(senderSocketId).emit("msg-sent", {
        ...newMessage.toObject(),
        delivered: !!receiverSocketId,
      });
    }

    if (receiverSocketId) {
  

      io.to(receiverSocketId).emit(
        "receive-message",
        newMessage
      );
    } 

  } catch (err) {
    console.error("msg-send error:", err);
  }
});

  socket.on("msg-delivered", async (data) => {
    const { messageId } = data;
    const senderId = socket.user.id;

    if (!messageId) {
      return;
    }
    const msg = await Message.findById(messageId);
    if (!msg) {
      return;
    }
    await Message.updateOne(
      { _id: data.messageId },
      { $set: { delivered: true } },
    );

    // const senderSocketId = onlineUser[senderId];
    const senderSocketId = await redis_client.get(`online:${senderId}`);
    if (senderSocketId) {
      socket.to(senderSocketId).emit("message-delivered", {
        messageId: data.messageId,
      });
    }
  });

  socket.on("user-typing", async (data) => {
    const senderId = socket.user.id;
    const { receiverId } = data;
    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return;
    }
    // const receiverSocketId = onlineUser[receiverId];
    const receiverSocketId = await redis_client.get(`online:${receiverId}`);
    if (!receiverSocketId) {
      return;
    }
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("user-typing", data);
    }
  });

  socket.on("stop-typing", async (data) => {
    const senderId = socket.user.id;
    const { receiverId } = data;
    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return;
    }
    // const receiverSocketId = onlineUser[data.receiverId];
    const receiverSocketId = await redis_client.get(`online:${receiverId}`);
    if (!receiverSocketId) {
      return;
    }
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("stop-typing", data);
    }
  });
};
