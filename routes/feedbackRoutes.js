import express from "express";
import Feedback from "../models/Feedback.js";
import sendFeedbackEmail from "../utils/sendFeedbackEmail.js"; // Using the new file

const router = express.Router();

// Submit Feedback
router.post("/submit", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Save feedback to database
    const feedback = new Feedback({ name, email, subject, message });
    await feedback.save();

    // Send Email Notification to Admin
    const adminEmail = process.env.EMAIL_USER;
    const emailContent = `
      <h2>New Feedback Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong> ${message}</p>
    `;

    await sendFeedbackEmail(adminEmail, `New Feedback: ${subject}`, emailContent);

    res.status(201).json({ message: "Feedback submitted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting feedback", error: error.message });
  }
});

export default router;
