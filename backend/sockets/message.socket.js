import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const registerMessageHandlers = (io, socket, onlineUser, socketToUser) => {

  socket.on("chat-opened", async (data) => {
    const {senderId} = data;
    const receiverId = socketToUser[socket.id];
    
    if(!senderId){
      return;
    }
    if(!mongoose.Types.ObjectId.isValid(senderId)){
      return;
    }
    await Message.updateMany(
      {
        senderId,
        receiverId,
      },
      { $set: { seen: true } },
    );

    const senderSocketId = onlineUser[senderId];

    if (senderSocketId) {
      socket.to(senderSocketId).emit("update-seen", {
        senderId,
        receiverId,
      });
    }
  });


 
  socket.on("emoji-reaction", async (data) => {
    const {messageId , emoji} = data;
    const userId = socket.user.id;
    if(!messageId || !emoji){
      return;
    }
    if(!mongoose.Types.ObjectId.isValid(messageId)){
        return;
    }
    const msg = await Message.findById(messageId);
    
    if(!msg){
      return;
    }
    const isParticipant  = msg.senderId.toString() === userId || msg.receiverId.toString() === userId;

    if(!isParticipant){
      return;
    }
    const existingReaction = msg.reactions.find(
      (r) => r.userId.toString() === userId,
    );

    if (!existingReaction) {
      msg.reactions.push({
        userId,
        emoji
      });
    } else if (existingReaction.emoji === emoji) {
      msg.reactions = msg.reactions.filter(
        (r) => r.userId.toString() !== userId,
      );
    } else {
      existingReaction.emoji = emoji;
    }

    await msg.save();

    const user1 = onlineUser[msg.senderId];
    const user2 = onlineUser[msg.receiverId];

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
    }
  );

  const receiverSocketId =
    onlineUser[msg.receiverId.toString()];

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
    const senderId = socket.user.id;
    const { receiverId, message, image, audio, replyTo } = data;
    const receiver = await User.findById(receiverId);

    if(!receiver){
      return;
    }
    if(!receiverId){
      return ;
    }
    if(!mongoose.Types.objectId.isValid(receiverId)){
      return;
    }
    if(!message && !image && !audio){
       return;
    }

    if(message && message.lenght > 5000){
      return;
    }
    const newMessage = new Message({
      senderId: data.senderId,
      receiverId: data.receiverId,
      message: data.message,
      imageUrl: data.image,
      audioUrl: data.audio,
      replyTo: data.replyTo,
    });

    await User.updateOne(
      { _id: senderId },
      { $set: { lastMessage: data.message } },
    );

    await User.updateOne(
      { _id: data.receiverId },
      { $set: { lastMessage: data.message } },
    );

    await newMessage.save();

    await newMessage.populate(
      "senderId",
      "profilePic username"
    );

    const receiverSocketId = onlineUser[data.receiverId];
    const senderSocketId = onlineUser[senderId];

    io.to(senderSocketId).emit("msg-sent", {
      ...newMessage.toObject(),
      delivered: receiverSocketId ? true : false,
    });

    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "receive-message",
        newMessage
      );
    }
  });


  socket.on("msg-delivered", async (data) => {
    const {messageId} = data;
    const senderId = socket.user.id;

    if(!messageId){
      return;
    }
    const msg = await Message.findById(messageId);
    if(!msg){
      return;
    }
    await Message.updateOne(
      { _id: data.messageId },
      { $set: { delivered: true } },
    );

    const senderSocketId = onlineUser[senderId];

    if (senderSocketId) {
      socket
        .to(senderSocketId)
        .emit("message-delivered", {
          messageId: data.messageId,
        });
    }
  });


  socket.on("user-typing", async (data) => {
    const senderId = socket.user.id;
    const {receiverId} = data;
    if(!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)){
      return;
    }
    const receiverSocketId = onlineUser[receiverId];
    if(!receiverSocketId){
      return;
    }
    if (receiverSocketId) {
      socket
        .to(receiverSocketId)
        .emit("user-typing", data);
    }
  });

  socket.on("stop-typing", async (data) => {
    const senderId = socket.user.id;
    const { receiverId } = data;
    if(!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)){
      return;
    }
    const receiverSocketId = onlineUser[data.receiverId];
    if(!receiverSocketId){
        return;
    }
    if (receiverSocketId) {
      socket
        .to(receiverSocketId)
        .emit("stop-typing", data);
    }
  });

};