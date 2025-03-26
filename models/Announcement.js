import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Announcement title
    description: { type: String, required: true }, // Detailed announcement text
    dateTime: { type: Date, required: true, default: Date.now }, // Date & time of announcement
    isActive: { type: Boolean, default: true }, // Status of announcement
  },
  { timestamps: true } // Auto-add createdAt and updatedAt fields
);

export default mongoose.model("Announcement", AnnouncementSchema);