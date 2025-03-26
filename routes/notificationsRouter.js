import express from "express";
import Notification from "../models/Notification.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get user's notifications with populated task details
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "taskId",
        select: "name creator",
        populate: { path: "creator", select: "name" }, // Get creator's name
      });

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// Mark notifications as read
router.put("/mark-as-read", authenticateUser, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { isRead: true });

    res.status(200).json({ message: "Notifications marked as read." });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Error marking notifications as read" });
  }
});

// Delete a notification by ID
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const notificationId = req.params.id;

    const deletedNotification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: req.user.id, // Ensure user can delete only their notifications
    });

    if (!deletedNotification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.status(200).json({ message: "Notification deleted successfully." });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Error deleting notification" });
  }
});


export default router;
