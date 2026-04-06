import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import config from "./config/config.js";

import authRoutes from "./routes/authRoutes.js";
import householdRoutes from "./routes/householdRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.1.112:5173",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/households", householdRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/public", publicRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();