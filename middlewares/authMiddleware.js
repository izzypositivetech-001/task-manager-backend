import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../services/tokenService.js";
import User from "../models/User.js";

// Middleware to protect routes
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer")) {
    return res.status(401).json({
      message: "Access token required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (!user)
      return res.status(404).json({
        message: "User not found",
      });

    //Check if tokenVersion still matches
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ message: "Token expired or invalid" });
    }

    req.user = { id: user._id, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

//Middleware for Admin-only access
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied, admin only" });
  }
};

export { protect, adminOnly };
