import { NextRequest, NextResponse } from "next/server";

export type Difficulty = "easy" | "normal" | "hard" | "expert";

export interface QuizQuestionMcq {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface QuizQuestionWritten {
  question: string;
  expectedAnswer: string;
  explanation?: string;
}

export type QuizQuestion = QuizQuestionMcq | QuizQuestionWritten;

export function isWrittenQuestion(q: QuizQuestion): q is QuizQuestionWritten {
  return "expectedAnswer" in q && typeof (q as QuizQuestionWritten).expectedAnswer === "string";
}

const NOTES_SYSTEM = `You are a medical education assistant for MBBS and Nursing students. Given a topic name, write clear, structured study notes suitable for revision. Include key definitions, important points, and clinical relevance. Write only the notes content, no preamble.`;

async function getNotesFromTopic(topic: string): Promise<string> {
  const userPrompt = `Write study notes on this topic for MBBS/Nursing students: ${topic}`;

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [{ role: "system", content: NOTES_SYSTEM }, { role: "user", content: userPrompt }],
          max_tokens: 1500,
          temperature: 0.5,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const t = data.choices?.[0]?.message?.content?.trim();
        if (t) return t;
      }
    } catch (_) {}
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-1.5-flash"}:generateContent?key=${encodeURIComponent(geminiKey)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: NOTES_SYSTEM + "\n\n" + userPrompt }] }],
          generationConfig: { maxOutputTokens: 1500, temperature: 0.5 },
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
        const t = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (t) return t;
      }
    } catch (_) {}
  }

  const mistralKey = process.env.MISTRAL_API_KEY;
  if (mistralKey) {
    try {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${mistralKey}` },
        body: JSON.stringify({
          model: process.env.MISTRAL_MODEL || "mistral-tiny",
          messages: [{ role: "system", content: NOTES_SYSTEM }, { role: "user", content: userPrompt }],
          max_tokens: 1500,
          temperature: 0.5,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const t = data.choices?.[0]?.message?.content?.trim();
        if (t) return t;
      }
    } catch (_) {}
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "system", content: NOTES_SYSTEM }, { role: "user", content: userPrompt }],
          max_tokens: 1500,
          temperature: 0.5,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const t = data.choices?.[0]?.message?.content?.trim();
        if (t) return t;
      }
    } catch (_) {}
  }

  return `Topic: ${topic}. Key points: revise from your textbooks. Use this as a prompt to test yourself.`;
}

const DIFFICULTY_PROMPTS: Record<Difficulty, string> = {
  easy: "Easy level: simple recall, basic definitions, suitable for beginners. Avoid trick questions.",
  normal: "Normal level: standard MBBS/nursing revision questions with clear single best answer.",
  hard: "Hard level: application and clinical scenario based questions; may include differentials.",
  expert: "Expert level: complex clinical scenarios, differential diagnosis, and advanced concepts.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    let noteText = typeof body.noteText === "string" ? body.noteText.trim() : "";
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const difficulty: Difficulty = ["easy", "normal", "hard", "expert"].includes(body.difficulty) ? body.difficulty : "normal";
    const questionStyle = body.questionStyle === "written" ? "written" : "mcq";

    if (topic && !noteText) {
      noteText = await getNotesFromTopic(topic);
    }

    if (!noteText) {
      return NextResponse.json(
        { error: "Paste your notes or enter a topic name to generate a quiz." },
        { status: 400 }
      );
    }

    const mistralKey = process.env.MISTRAL_API_KEY;
    if (mistralKey) {
      const questions = await generateWithMistral(noteText, mistralKey, difficulty, questionStyle);
      if (questions.length > 0) return NextResponse.json({ questions, questionStyle });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      const questions = await generateWithGroq(noteText, groqKey, difficulty, questionStyle);
      return NextResponse.json({ questions, questionStyle });
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

async function generateWithMistral(
  noteText: string,
  apiKey: string,
  difficulty: Difficulty,
  questionStyle: "mcq" | "written"
): Promise<QuizQuestion[]> {
  const model = process.env.MISTRAL_MODEL || "mistral-tiny";
  const truncated = noteText.slice(0, 4000);
  const diffText = DIFFICULTY_PROMPTS[difficulty];

  const systemPrompt =
    questionStyle === "written"
      ? `You are a medical education assistant. Given study notes, generate exactly 5 short-answer questions (no multiple choice). ${diffText} Return ONLY a valid JSON array of objects, no other text. Each object must have: "question" (string), "expectedAnswer" (string: concise key answer, one phrase or short sentence), "explanation" (string: 1-2 sentences teaching the concept).`
      : `You are a medical education assistant. Given study notes, generate exactly 5 multiple-choice questions. ${diffText} Return ONLY a valid JSON array of objects, no other text. Each object must have: "question" (string), "options" (array of 4 strings), "correctIndex" (number 0-3), "explanation" (string: 1-3 sentences teaching why the correct answer is right).`;
  const userPrompt =
    questionStyle === "written"
      ? `Generate 5 short-answer questions from these notes:\n\n${truncated}`
      : `Generate 5 MCQs from these notes:\n\n${truncated}`;

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim() || "";
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  return Array.isArray(parsed) ? parsed : [];
}

async function generateWithGroq(
  noteText: string,
  apiKey: string,
  difficulty: Difficulty,
  questionStyle: "mcq" | "written"
): Promise<QuizQuestion[]> {
  const truncated = noteText.slice(0, 4000);
  const diffText = DIFFICULTY_PROMPTS[difficulty];

  const systemPrompt =
    questionStyle === "written"
      ? `You are a medical education assistant. Given study notes, generate exactly 5 short-answer questions (no multiple choice). ${diffText} Return ONLY a valid JSON array of objects, no other text. Each object must have: "question" (string), "expectedAnswer" (string: concise key answer), "explanation" (string: 1-2 sentences teaching the concept).`
      : `You are a medical education assistant. Given study notes, generate exactly 5 multiple-choice questions. ${diffText} Return ONLY a valid JSON array of objects, no other text. Each object must have: "question" (string), "options" (array of 4 strings), "correctIndex" (number 0-3), "explanation" (string: 1-3 sentences teaching why the correct answer is right).`;
  const userPrompt =
    questionStyle === "written"
      ? `Generate 5 short-answer questions from these notes:\n\n${truncated}`
      : `Generate 5 MCQs from these notes:\n\n${truncated}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim() || "";
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  return Array.isArray(parsed) ? parsed : [];
}

function generateTemplateQuiz(noteText: string, difficulty: Difficulty, questionStyle: "mcq" | "written"): QuizQuestion[] {
  const sentences = noteText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
  const q: QuizQuestion[] = [];

  if (questionStyle === "written") {
    for (let i = 0; i < Math.min(5, sentences.length); i++) {
      const s = sentences[i];
      const words = s.split(/\s+/).filter((w) => w.length > 3);
      const keyWord = words[Math.min(2, words.length - 1)] || "key concept";
      q.push({
        question: `What is the main point of: "${s.slice(0, 80)}${s.length > 80 ? "..." : ""}"?`,
        expectedAnswer: keyWord + (words.length > 3 ? " — " + words.slice(3, 6).join(" ") : ""),
        explanation: `Review: ${s.slice(0, 120)}...`,
      });
    }
    if (q.length === 0) {
      q.push({
        question: "Summarize the key idea of these notes in one sentence.",
        expectedAnswer: "Key concept from the notes.",
        explanation: "Add more content to your notes to generate meaningful questions.",
      });
    }
    return q;
  }

  for (let i = 0; i < Math.min(3, sentences.length); i++) {
    const s = sentences[i];
    const words = s.split(/\s+/).filter((w) => w.length > 4);
    const blank = words[Math.min(2, words.length - 1)] || "_____";
    q.push({
      question: s.replace(blank, "______") + " (fill in)",
      options: [blank, "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanation: `The correct answer is "${blank}". Review the sentence in your notes to understand the context.`,
    });
  }
  if (q.length === 0) {
    q.push({
      question: "This note is too short. Add more content and try again.",
      options: ["OK", "Skip", "Edit", "Cancel"],
      correctIndex: 0,
      explanation: "Add more content to your notes to generate meaningful quiz questions.",
    });
  }
  return q;
}
