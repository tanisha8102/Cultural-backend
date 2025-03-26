import express from "express";
import multer from "multer";
import User from "../models/User.js";
import {authenticateUser, verifyAdmin } from "../middlewares/authMiddleware.js"; // Middleware to check admin access

const router = express.Router();

// Configure Multer to handle image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all registered users (Admin Only)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "name email role _id profilePhoto"); // Include profilePhoto

    const usersWithProfilePhoto = users.map((user) => {
      let profilePhoto = null;
      if (user.profilePhoto && user.profilePhoto.data) {
        profilePhoto = `data:${user.profilePhoto.contentType};base64,${user.profilePhoto.data.toString("base64")}`;
      }
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto, // Base64 encoded image
      };
    });

    res.status(200).json(usersWithProfilePhoto);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

// Get total number of users (including admins and regular users)
router.get("/users/count", async (req, res) => {
  try {
    const userCount = await User.countDocuments(); // Counts all users in the database
    res.status(200).json({ count: userCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user count", error: error.message });
  }
});


// Get a specific user (Allow all authenticated users)
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let profilePhoto = null;
    if (user.profilePhoto && user.profilePhoto.data) {
      profilePhoto = `data:${user.profilePhoto.contentType};base64,${user.profilePhoto.data.toString("base64")}`;
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber, // Ensure correct field mapping
      dob: user.dob,             // Add dob
      address: user.address,     // Add address
      profilePhoto,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
});



router.put("/users/:id", async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Debugging log

    const { id } = req.params;
    const { name, password, role, phoneNumber, jobTitle, profilePhoto, dob, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, password, role, phoneNumber, jobTitle, profilePhoto, dob, address },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});



// Update User Role (Admin Only)
router.put("/users/update-role/:id", verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User role updated successfully!", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating role", error: error.message });
  }
});

// Upload profile photo (Raw Image Storage)
router.put("/users/:id/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { profilePhoto: { data: req.file.buffer, contentType: req.file.mimetype } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile photo updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error uploading image", error: error.message });
  }
});

// Delete User (Admin Only)
router.delete("/users/:id", authenticateUser, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});

export default router;
