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

const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(userRoutes);

const startServer = async()=>{
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to mongodb");
    await initializeSocket(server);

    server.listen(PORT , ()=>{
          console.log(`listening on port ${PORT}`);
    });
  }catch(e){
     console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}
startServer();

