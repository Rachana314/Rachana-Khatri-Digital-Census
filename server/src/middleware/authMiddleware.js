console.log("🔥 AUTH MIDDLEWARE FILE LOADED:", import.meta.url);

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/config.js";

export default async function authMiddleware(req, res, next) {
  try {
    // ✅ if next is missing, express is not calling middleware properly
    if (typeof next !== "function") {
      return res.status(500).json({ message: "Middleware error: next is not a function" });
    }

    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
