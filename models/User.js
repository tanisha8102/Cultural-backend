import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    phoneNumber: { type: String },
    jobTitle: { type: String },
    profilePhoto: { data: Buffer, contentType: String },
    dob: { type: Date },
    address: { type: String } // Simple one-liner address
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
