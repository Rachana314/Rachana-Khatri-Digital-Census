import { ADMIN } from "../constants/roles.js";

export default function adminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const isAdmin =
    req.user.role === ADMIN || req.user.roles?.includes(ADMIN);

  if (!isAdmin) {
    return res.status(403).json({ message: "Admin only" });
  }

  next();
}