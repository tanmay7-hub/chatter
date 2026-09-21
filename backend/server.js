import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/user.routes.js";
import http from "http";
import cors from "cors";
import { initializeSocket } from "./sockets/socket.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(userRoutes);

app.get("/health", async (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
let closeSocket;
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to mongodb");
    const socketInstance = await initializeSocket(server);
    closeSocket = socketInstance.closeSocket;
    server.listen(PORT, () => {
      console.log(`listening on port ${PORT}`);
    });
  } catch (e) {
    console.error("MongoDB connection failed:", e);
    process.exit(1);
  }
};
startServer();

const shutDown = async (signal) => {
  console.log(`${signal} received . Shutting down.`);
  server.close(async () => {
    try {
      await closeSocket();
      await mongoose.connection.close();

      process.exit(0);
    } catch (e) {
      console.log("error in shutting down");
      process.exit(1);
    }
  });
};
process.on("SIGTERM", () => shutDown("SIGTERM"));
process.on("SIGINT", () => shutDown("SIGINT"));
