import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { registerMessageHandlers } from "./message.socket.js";
import { registerGroupHandlers } from "./group.socket.js";
import { registerCallHandlers } from "./call.socket.js";
import { registerPresenceHandlers } from "./presence.socket.js";
export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
    const onlineUser = {};
    const socketToUser = {};
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = decoded;

      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`socket connected: ${socket.id}`);
    registerMessageHandlers(io, socket, onlineUser, socketToUser);
    registerGroupHandlers(io, socket, onlineUser, socketToUser);
    registerCallHandlers(io, socket, onlineUser, socketToUser);
    registerPresenceHandlers(io, socket, onlineUser, socketToUser);
  });

  return io;
};
