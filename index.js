import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import locationRoutes from "./src/routes/locationRoutes.js";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import Location from "./src/models/locationModel.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", locationRoutes);

// WebSocket Server
const wss = new WebSocketServer({ port: 8080 });
wss.on("connection", (ws) => {
  console.log("Client Connected");

  const sendLocationUpdate = async () => {
    const currentTime = new Date().getTime();
    try {
      const closestLocation = await Location.findOne({
        timestamp: { $lte: currentTime },
      })
        .sort({ timestamp: -1 })
        .select("latitude longitude timestamp -_id");

      if (closestLocation) {
        ws.send(JSON.stringify(closestLocation));
      }
    } catch (error) {
      console.log("Error is:", error);
    }
  };
  const intervalId = setInterval(sendLocationUpdate, 3000);

  ws.on("close", () => {
    console.log("client Disconnected");
    clearInterval(intervalId);
  });
});

// Connect to MongoDB
mongoose
  .connect(`${process.env.dbUrl}/${process.env.dbName}`)
  .then(() => {
    console.log("Database connected Successfully");

    app.listen(PORT, () =>
      console.log(`Server is running on the port ${PORT}`)
    );
  })
  .catch((err) => console.log(err));
