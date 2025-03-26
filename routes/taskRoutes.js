import express from "express";
import Task from "../models/Task.js";
import mongoose from "mongoose";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import Notification from "../models/Notification.js";
import Category from "../models/Category.js";

const router = express.Router();

const notifyUsers = async (userIds, taskId, message) => {
  const notifications = userIds.map((userId) => ({
    userId,
    taskId,
    message,
  }));
  await Notification.insertMany(notifications);
};

// Create a task
router.post("/create", async (req, res) => {
  try {
    const { name, description, day, priority, assignees, creator, category } = req.body;

    if (!name || !creator) {
      return res.status(400).json({ message: "Task name and creator are required." });
    }

    const newTask = await Task.create({
      name,
      description,
      day,
      priority,
      assignees,
      creator,
      category, // Assign category
    });

    if (assignees.length > 0) {
      await notifyUsers(assignees, newTask._id, "You have been assigned a new task.");
    }

    res.status(201).json({ message: "Task created successfully!", task: newTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



router.get("/", authenticateUser, async (req, res) => {
  try {
      const userId = req.user.id; 
      const userRole = req.user.role;

      let tasks;
      if (userRole === "admin") {
          tasks = await Task.find()
              .populate("creator", "name email")
              .populate("assignees", "name email");
      } else {
          tasks = await Task.find({
              $or: [{ creator: userId }, { assignees: userId }],
          })
          .populate("creator", "name email")
          .populate("assignees", "name email");
      }

      res.status(200).json(tasks);
  } catch (error) {
      res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
});
  

// Get tasks by creator/user ID
router.get("/user/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const objectId = new mongoose.Types.ObjectId(userId);
  
      const tasks = await Task.find({
        $or: [{ creator: objectId }, { assignees: objectId }],
      })
        .populate("creator", "name email")
        .populate("assignees", "name email");
  
      res.json(tasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });
  

  router.put("/update-status/:id", async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      );
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task);
    } catch (err) {
      res.status(500).json({ message: "Error updating task status" });
    }
  });

  // Delete a task by ID
  router.delete("/delete/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      const task = await Task.findById(id);
      if (!task) return res.status(404).json({ message: "Task not found" });
  
      await Task.findByIdAndDelete(id);
      await notifyUsers(task.assignees, id, "A task you were assigned to has been deleted.");
  
      res.status(200).json({ message: "Task deleted successfully!" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Error deleting task", error: error.message });
    }
  });
  

router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, day, priority, assignees, status,category } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const oldAssignees = task.assignees.map((assignee) => assignee.toString());

    task.name = name || task.name;
    task.description = description || task.description;
    task.day = day || task.day;
    task.priority = priority || task.priority;
    task.assignees = assignees || task.assignees;
    task.status = status || task.status;
    task.category = category || task.category;

    await task.save();

    // Notify users only if assignees are changed
    if (assignees) {
      const newAssignees = assignees.map((assignee) => assignee.toString());
      const addedAssignees = newAssignees.filter((id) => !oldAssignees.includes(id));
      if (addedAssignees.length > 0) {
        await notifyUsers(addedAssignees, id, "You have been added to a task.");
      }
    }

    res.status(200).json({ message: "Task updated successfully!", task });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
});

// Assign multiple users to a task
router.put("/assign/:id", async (req, res) => {
  try {
    const { userIds } = req.body;
    const taskId = req.params.id;

    const task = await Task.findByIdAndUpdate(
      taskId,
      { $addToSet: { assignees: { $each: userIds } } },
      { new: true }
    ).populate("assignees", "name email");

    if (!task) return res.status(404).json({ message: "Task not found" });

    await notifyUsers(userIds, taskId, "You have been assigned a new task.");

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error assigning users", error });
  }
});


router.get("/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const tasks = await Task.find({ category: categoryId })
      .populate("creator", "name email")
      .populate("assignees", "name email")
      .populate("category", "name description");

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
});

router.get("/category/:categoryId/count", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const taskCount = await Task.countDocuments({ category: categoryId });

    res.status(200).json({ categoryId, taskCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching task count", error: error.message });
  }
});

router.get("/pending", async (req, res) => {
  try {
    const pendingTasks = await Task.find({ status: { $ne: "Completed" } })
      .populate("creator", "name email")
      .populate("assignees", "name email");

    res.status(200).json({ count: pendingTasks.length, tasks: pendingTasks });
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending tasks", error: error.message });
  }
});



export default router;
