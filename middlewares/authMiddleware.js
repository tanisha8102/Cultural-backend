import User from "../models/User.js";
import jwt from "jsonwebtoken";



export const verifyAdmin = async (req, res, next) => {
  try {
    // Ensure user is authenticated first
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next(); // Allow request to proceed
  } catch (error) {
    res.status(500).json({ message: "Error checking admin role", error: error.message });
  }
};




export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Access Token Expired", error: "jwt expired" });
        }
        return res.status(401).json({ message: "Invalid token", error: err.message });
      }

      req.user = await User.findById(decoded.id).select("-password");
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Authentication failed", error: error.message });
  }
};
