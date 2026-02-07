import express from "express";
import cors from "cors";
import path from "path";

import connectDB from "./config/db.js";
import config from "./config/config.js";

import authRoutes from "./routes/authRoutes.js";
import householdRoutes from "./routes/householdRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

// serve uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/households", householdRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => res.send("API Running"));

app.listen(config.port, () => console.log(`🚀 Server running on ${config.port}`));
