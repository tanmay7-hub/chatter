import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    replyTo: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
      type: {
        type: String,
        enum: ["text", "image", "audio"],
      },
      message: String,

      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      senderName: String,

      imageUrl: String,
      audioUrl: String,
    },
    deletedforEveryone: {
      type: Boolean,
      default: false,
    },
    reactions: {
      type: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          emoji: String,
        },
      ],
      default: [],
    },
    message: {
      type: {
        type: String,
        enum: ["text", "image", "audio"],
        default: "text",
      },
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },

    message: String,

    imageUrl: String,

    audioUrl: String,
    delivered: {
      type: Boolean,
      default: false,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    seenBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);
messageSchema.index({
  senderId: 1,
  receiverId: 1,
  createdAt: -1,
});

messageSchema.index({
  receiverId: 1,
  senderId: 1,
  createdAt: -1,
});

messageSchema.index({
  groupId: 1,
  createdAt: -1,
});

const Message =  mongoose.model("Message", messageSchema);
export default Message;
