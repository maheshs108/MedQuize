import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    subject: { type: String, default: "" },
    userId: { type: String, default: "anonymous" },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Note =
  mongoose.models.Note || mongoose.model("Note", NoteSchema);
