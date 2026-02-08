import { NextRequest, NextResponse } from "next/server";

/* =======================
   Internal Types (NOT exported)
======================= */

type Difficulty = "easy" | "normal" | "hard" | "expert";

interface QuizQuestionMcq {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizQuestionWritten {
  question: string;
  expectedAnswer: string;
  explanation?: string;
}

type QuizQuestion = QuizQuestionMcq | QuizQuestionWritten;

function isWrittenQuestion(q: QuizQuestion): q is QuizQuestionWritten {
  return "expectedAnswer" in q && typeof (q as QuizQuestionWritten).expectedAnswer === "string";
}

/* =======================
   Notes generation
======================= */

const NOTES_SYSTEM = `You are a medical education assistant for MBBS and Nursing students. Given a topic name, write clear, structured study notes suitable for revision. Include key definitions, important points, and clinical relevance. Write only the notes content, no preamble.`;

async function getNotesFromTopic(topic: string): Promise<string> {
  const userPrompt = `Write study notes on this topic for MBBS/Nursing students: ${topic}`;

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: NOTES_SYSTEM },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 1500,
          temperature: 0.5,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const t = data?.choices?.[0]?.message?.content?.trim();
        if (t) return t;
      }
    } catch {}
  }

  return `Topic: ${topic}. Revise from standard textbooks.`;
}

/* =======================
   Difficulty prompts
======================= */

const DIFFICULTY_PROMPTS: Record<Difficulty, string> = {
  easy: "Easy level: basic recall and definitions.",
  normal: "Normal level: standard MBBS/Nursing questions.",
  hard: "Hard level: clinical application based questions.",
  expert: "Expert level: advanced clinical reasoning questions.",
};

/* =======================
   API ROUTE (ONLY EXPORT)
======================= */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    let noteText = typeof body.noteText === "string" ? body.noteText.trim() : "";
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const difficulty: Difficulty = ["easy", "normal", "hard", "expert"].includes(body.difficulty)
      ? body.difficulty
      : "normal";
    const questionStyle: "mcq" | "written" =
      body.questionStyle === "written" ? "written" : "mcq";

    if (topic && !noteText) {
      noteText = await getNotesFromTopic(topic);
    }

    if (!noteText) {
      return NextResponse.json(
        { error: "Paste notes or provide a topic name." },
        { status: 400 }
      );
    }

    const questions = generateTemplateQuiz(noteText, difficulty, questionStyle);
    return NextResponse.json({ questions, questionStyle });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Quiz generation failed" },
      { status: 500 }
    );
  }
}

/* =======================
   Fallback Quiz Generator
======================= */

function generateTemplateQuiz(
  noteText: string,
  difficulty: Difficulty,
  questionStyle: "mcq" | "written"
): QuizQuestion[] {
  const sentences = noteText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const q: QuizQuestion[] = [];

  if (questionStyle === "written") {
    for (let i = 0; i < Math.min(5, sentences.length); i++) {
      const s = sentences[i];
      q.push({
        question: `Explain: "${s.slice(0, 80)}..."`,
        expectedAnswer: "Key concept from the sentence.",
        explanation: s.slice(0, 120),
      });
    }
    return q;
  }

  for (let i = 0; i < Math.min(3, sentences.length); i++) {
    q.push({
      question: sentences[i],
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanation: "Refer to the notes for explanation.",
    });
  }

  return q;
}
