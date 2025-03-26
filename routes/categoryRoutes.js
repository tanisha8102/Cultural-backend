import express from "express";
import Category from "../models/Category.js";

const router = express.Router();

// Create a Category
router.post("/create", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required." });

    const category = await Category.create({ name, description });
    res.status(201).json({ message: "Category created successfully!", category });
  } catch (error) {
    res.status(500).json({ message: "Error creating category", error: error.message });
  }
});

// Get All Categories
router.get("/all", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
});

// Get Category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error: error.message });
  }
});

// Delete a Category
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: "Category deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error: error.message });
  }
});




export default router;
