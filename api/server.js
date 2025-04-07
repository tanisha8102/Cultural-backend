import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "../routes/authRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import taskRoutes from "../routes/taskRoutes.js";
import notificationsRouter from "../routes/notificationsRouter.js";
import categoryRoutes from "../routes/categoryRoutes.js";
import eventRoutes from "../routes/eventRoutes.js";
import passwordRoutes from "../routes/passwordRoutes.js";
import anoucementRoutes from "../routes/announcementRoutes.js";
import feedbackRoutes from "../routes/feedbackRoutes.js";
import cookieParser from "cookie-parser";

// Load env variables
dotenv.config();

// DB connection outside handler to avoid reconnect on every request
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => {
      console.error("❌ MongoDB Connection Error:", err.message);
    });
}

const app = express();

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationsRouter);
app.use("/api/categories", categoryRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", passwordRoutes);
app.use("/api/announcements", anoucementRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Task Manager API Running on Vercel..." });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Vercel expects a handler export
export default app;
