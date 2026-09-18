import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import mongoose from "mongoose";
export const registerGroupHandlers = (
  io,
  socket,
  redis_client,
) => {
  socket.on("group-typing", async (data) => {
    const userId = socket.user.id;
    const { groupId } = data;
    if (!groupId) {
      return;
    }
    const group = await Group.findById(data.groupId);
    if (!group) return;
    const isMember = await group.members.some(
      (member) => member.toString() === userId,
    );
    if (!isMember) {
      return;
    }
    const typingData = {
      groupId,
      senderId: userId,
    };
    for(const member of group.members) {
      const memberId = member.toString();
      if (memberId !== data.senderId) {

        // const memberSocket = onlineUser[memberId];
        const memberSocket = await redis_client.get(`online:${memberId}`);

        if (memberSocket) {
          io.to(memberSocket).emit("group-typing", typingData);
        }
      }
    };
  });

  socket.on("stop-group-typing", async (data) => {
    const { groupId } = data;
    const userId = socket.user.id;
    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return;
    }
    const group = await Group.findById(groupId);
    if (!group) return;

    const isMember = await group.members.some(
      (member) => member.toString() === userId,
    );
    if (!isMember) {
      return;
    }
    const typingData = {
      groupId,
      senderId: userId,
    };
    for(const member of group.members) {
      const memberId = member.toString();
      if (memberId !== data.senderId) {
        // const memberSocket = onlineUser[memberId];
        const memberSocket = await redis_client.get(`online:${memberId}`);


        if (memberSocket) {
          io.to(memberSocket).emit("stop-group-typing", typingData);
        }
      }
    };
  });

  socket.on("group-msg-send", async (data) => {
    const userId = socket.user.id;
    const { groupId, message, image, audio, replyTo } = data;
    if (!groupId) {
      return;
    }

    if (!message && !image && !audio) {
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return;
    }

    const isMember = group.members.some(
      (member) => member.toString() === userId,
    );
    if (!isMember) {
      return;
    }
    const msg = new Message({
      senderId: userId,
      groupId,
      message,
      imageUrl: image,
      audioUrl: audio,
      replyTo,
    });
    await msg.save();

    await msg.populate("senderId", "profilePic username");

    await msg.populate("receiverId", "username profilePic");

    await Group.updateOne(
      { _id: groupId },
      {
        $set: {
          lastMessage: message,
        },
      },
    );

    // const senderSocket = onlineUser[userId];
    const senderSocket = await redis_client.get(`online:${userId}`);

    for(const member of group.members) {
      const memberId = member.toString();
      if (memberId !== userId) {
        // const memberSocket = onlineUser[memberId];
        const memberSocket = await redis_client.get(`online:${memberId}`);

        if (memberSocket) {
          io.to(memberSocket).emit("receive-group-message", msg);
        }
      }
    };

    if (senderSocket) {
      io.to(senderSocket).emit("msg-sent", msg);
    }
  });
};
