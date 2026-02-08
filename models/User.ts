import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: ["male", "female", "other"] },
    collegeName: { type: String, required: true, trim: true },
    yearOfStudying: { type: String, required: true, trim: true },
    stream: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String, default: "" },
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model("User", UserSchema);
