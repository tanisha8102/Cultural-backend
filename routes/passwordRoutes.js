import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Token from "../models/Token.js";
import sendEmail from "../utils/sendEmail.js"; // Function to send emails

const router = express.Router();

// Forgot Password - Send Reset Link
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User with this email does not exist" });
    }

    // Generate Token
    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    // Reset Password Link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token.token}`;

    // Send Email
    await sendEmail(user.email, "Password Reset Request", `Click the link to reset password: ${resetLink}`);

    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (error) {
    res.status(500).json({ message: "Error in forgot password", error: error.message });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find Token
    const tokenData = await Token.findOne({ token });
    if (!tokenData) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Find User
    const user = await User.findById(tokenData.userId);
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Hash New Password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete Token after successful reset
    await Token.findByIdAndDelete(tokenData._id);

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error in resetting password", error: error.message });
  }
});

export default router;
