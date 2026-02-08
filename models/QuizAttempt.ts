import mongoose from "mongoose";

const QuestionResultSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String }],
    correctIndex: { type: Number, default: -1 },
    userAnswerIndex: { type: Number, default: -1 },
    correct: { type: Boolean, required: true },
    explanation: { type: String, default: "" },
    expectedAnswer: { type: String, default: "" },
    userWrittenAnswer: { type: String, default: "" },
  },
  { _id: false }
);

const QuizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sourceType: { type: String, enum: ["topic", "note"], default: "topic" },
    topic: { type: String, default: "" },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", default: null },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    questions: [QuestionResultSchema],
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const QuizAttempt =
  mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", QuizAttemptSchema);
