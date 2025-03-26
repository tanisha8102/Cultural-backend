import express from "express";
import Event from "../models/EventModel.js"; 
import { authenticateUser, verifyAdmin } from "../middlewares/authMiddleware.js"; // ✅ Corrected imports

const router = express.Router();

// Create Event (Admin Only)
router.post("/", authenticateUser, verifyAdmin, async (req, res) => {
  try {
    const event = new Event({ ...req.body, createdBy: req.user.id });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Events (Public)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ Fetch upcoming events (Date after today)
router.get("/upcoming", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = await Event.find({ dateTime: { $gte: today } }); // ✅ Correct field

    res.status(200).json({ count: upcomingEvents.length, events: upcomingEvents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get Event by ID (Public)
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Event (Admin Only)
router.put("/:id", authenticateUser, verifyAdmin, async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEvent) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Event (Admin Only)
router.delete("/:id", authenticateUser, verifyAdmin, async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



export default router;
