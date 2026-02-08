import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { QuizAttempt } from "@/models/QuizAttempt";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "") ?? null;
  const payload = token ? await verifyToken(token) : null;
  if (!payload?.userId) {
    return NextResponse.json({ error: "Sign in to view your quiz history." }, { status: 401 });
  }
  try {
    await connectDb();
    const attempts = await QuizAttempt.find({ userId: payload.userId })
      .sort({ completedAt: -1 })
      .limit(50)
      .lean();
    return NextResponse.json({ attempts });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load quiz history." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "") ?? null;
  const payload = token ? await verifyToken(token) : null;
  if (!payload?.userId) {
    return NextResponse.json({ error: "Sign in to save quiz results to your profile." }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const { sourceType, topic, noteId, score, total, questions } = body;
    if (typeof score !== "number" || typeof total !== "number" || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid quiz result data." }, { status: 400 });
    }
    await connectDb();
    const attempt = await QuizAttempt.create({
      userId: payload.userId,
      sourceType: sourceType === "note" ? "note" : "topic",
      topic: typeof topic === "string" ? topic : "",
      noteId: noteId || null,
      score,
      total,
      questions: questions.map((q: {
        question: string;
        options?: string[];
        correctIndex?: number;
        userAnswerIndex?: number;
        correct: boolean;
        explanation?: string;
        expectedAnswer?: string;
        userWrittenAnswer?: string;
      }) => ({
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [],
        correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : -1,
        userAnswerIndex: typeof q.userAnswerIndex === "number" ? q.userAnswerIndex : -1,
        correct: !!q.correct,
        explanation: q.explanation || "",
        expectedAnswer: typeof q.expectedAnswer === "string" ? q.expectedAnswer : "",
        userWrittenAnswer: typeof q.userWrittenAnswer === "string" ? q.userWrittenAnswer : "",
      })),
    });
    return NextResponse.json({ saved: true, attemptId: attempt._id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save quiz result." }, { status: 500 });
  }
}
