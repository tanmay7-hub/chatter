import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { registerMessageHandlers } from "./message.socket.js";
import { registerGroupHandlers } from "./group.socket.js";
import { registerCallHandlers } from "./call.socket.js";
import { registerPresenceHandlers } from "./presence.socket.js";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
export const initializeSocket = async(server) => {

  const pubClient = createClient({
    url:process.env.REDIS_URL
  });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  const redis_client = createClient({
     url:process.env.REDIS_URL
  });
  
  await redis_client.connect();
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  io.adapter(createAdapter(pubClient , subClient));
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
    
    // redis_client.set(`online:${}`)
    socket.emit("user-logged-in");
    console.log(`socket connected: ${socket.id}`);
    registerMessageHandlers(io, socket,  socketToUser , redis_client);
    registerGroupHandlers(io, socket,  redis_client);
    registerCallHandlers(io, socket,  redis_client);
    registerPresenceHandlers(io, socket,  socketToUser , redis_client);
  });

  const closeSocket = async()=>{
       await io.close();
       await pubClient.quit();
       await subClient.quit();
       await redis_client.quit();
  };

  return {io , closeSocket};
};
