import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  day: String,
  priority: String,
  status: { type: String, default: "To-Do" },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Reference to Category
});

const Task = mongoose.model("Task", taskSchema);
export default Task;
