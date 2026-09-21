import User from "../models/user.model.js";
import Message from "../models/message.model.js";
export const registerPresenceHandlers = (
  io,
  socket,
  socketToUser,
  redis_client
) => {


  socket.on("user-logged-in", async (data) => {
    const userId = socket.user.id;

    await User.updateOne(
      { _id: userId },
      { $set: { isOnline: true } }
    );
    
    const oldSocketId = await redis_client.get(`online:${userId}`);
    if(oldSocketId && oldSocketId !== socket.id){
       await redis_client.del(`online:${userId}`);
    }
    // onlineUser[userId] = socket.id;
    await redis_client.set(`online:${userId}` , socket.id);
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
      const {senderId} = msg;
      
      const senderSocketId = await redis_client.get(`online:${senderId}`);
      
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

    const currentSocketId = await redis_client.get(`online:${userId}`);
    if(currentSocketId === socket.id){
         await redis_client.del(`online:${userId}`);
    }
    delete socketToUser[socket.id];

    io.emit("refresh-users");
  });

};