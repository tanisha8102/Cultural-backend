import express from "express";
import Announcement from "../models/Announcement.js";

const router = express.Router();

// Create a new announcement
router.post("/create", async (req, res) => {
  try {
    const { name, description, dateTime, isActive } = req.body;
    const newAnnouncement = new Announcement({ name, description, dateTime, isActive });
    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

// Get all announcements with count
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find();
    const count = await Announcement.countDocuments();
    res.json({ count, announcements });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});


// Get a single announcement by ID
router.get("/:id", async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ error: "Announcement not found" });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving announcement" });
  }
});

// Update an announcement
router.put("/:id", async (req, res) => {
  try {
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return updated document
    );
    if (!updatedAnnouncement) return res.status(404).json({ error: "Announcement not found" });
    res.json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

// Delete an announcement
router.delete("/:id", async (req, res) => {
  try {
    const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);
    if (!deletedAnnouncement) return res.status(404).json({ error: "Announcement not found" });
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

// Get the count of announcements
router.get("/count", async (req, res) => {
  try {
    const count = await Announcement.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error("Error counting announcements:", error); // Log full error details
    res.status(500).json({ error: "Failed to count announcements", details: error.message });
  }
});



export default router;