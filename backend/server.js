import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/user.routes.js";
import http from "http";
import cors from "cors";
import {initializeSocket} from "./sockets/socket.js"


dotenv.config();
const app = express();
const server = http.createServer(app);
initializeSocket(server);

const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(userRoutes);

server.listen(PORT, async () => {
  try {
    console.log(`listening on port ${PORT}`);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to mongodb");
  } catch (e) {
    console.log(e);
  }
});
