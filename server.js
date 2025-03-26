import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import notificationsRouter from "./routes/notificationsRouter.js"
import categoryRoutes from "./routes/categoryRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import passwordRoutes from "./routes/passwordRoutes.js";
import anoucementRoutes from "./routes/announcementRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import cookieParser from "cookie-parser";


// Load environment variables
dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Middleware (Order matters)
app.use(cors({ origin: "http://localhost:3000", credentials: true })); // Enables Cross-Origin Resource Sharing

// API Routes

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationsRouter);
app.use("/api/categories", categoryRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", passwordRoutes);
app.use("/api/announcements", anoucementRoutes);
app.use("/api/feedback", feedbackRoutes);



// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Reduce timeout to 5 seconds
  connectTimeoutMS: 10000, // Increase connection timeout to 10s
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });


// Default Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Task Manager API Running..." });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
