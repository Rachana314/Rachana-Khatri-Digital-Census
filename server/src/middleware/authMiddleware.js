import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/config.js";

/**
 * Authentication Middleware
 * Verifies the JWT token and attaches the user object to the request.
 */
export default async function authMiddleWare(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Support different ID naming conventions (userId, id, or _id)
    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Find user and exclude password from the attached object
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request object
    req.user = user;
    return next();
  } catch (err) {
    // Specific check for expired tokens
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}