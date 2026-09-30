import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);

connectToSocket(server);

const corsOptions = {
    origin: "https://link-up-video-call-sly1.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "40kb" }));

app.use(
    express.urlencoded({
        limit: "40kb",
        extended: true
    })
);

app.use("/api/v1/users", userRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "LinkUp backend is running"
    });
});

mongoose
    .connect(process.env.MONGO_URI)
    .then((connectionDb) => {
        console.log(
            `MONGO connected DB Host: ${connectionDb.connection.host}`
        );
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`LISTENING ON PORT ${PORT}`);
});