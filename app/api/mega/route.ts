import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are a medical education assistant for MBBS and Nursing students.
Explain concepts simply, exam-oriented, and clinically relevant.
`;

async function callAI(prompt: string) {
  try {
    if (process.env.OPENAI_API_KEY) {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
        }),
      });
      const d = await r.json();
      return d?.choices?.[0]?.message?.content || null;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const mode = body.mode;

  if (mode === "tutor") {
    const answer = await callAI(
      `Student doubt: ${body.question}\nNotes: ${body.notes || ""}`
    );
    return NextResponse.json({ answer });
  }

  if (mode === "quiz") {
    const q = await callAI(
      `Generate 5 MCQs from notes. Return JSON only.\n${body.notes}`
    );
    return NextResponse.json({ questions: q });
  }

  if (mode === "evaluate") {
    const e = await callAI(
      `Question: ${body.question}
Expected: ${body.expected}
Student: ${body.answer}
Return JSON with score, verdict, feedback, modelAnswer.`
    );
    return NextResponse.json({ evaluation: e });
  }

  if (mode === "analytics") {
    return NextResponse.json({
      accuracy: "68%",
      weakTopics: ["Heart", "Renal"],
      advice: "Revise CVS daily",
    });
  }

  if (mode === "syllabus") {
    return NextResponse.json({
      course: "MBBS",
      year: 1,
      subject: "Anatomy",
      units: ["Cardiovascular", "Nervous"],
    });
  }

  if (mode === "examPredict") {
    return NextResponse.json({
      readiness: "Moderate",
      successChance: "65%",
    });
  }

  if (mode === "notes") {
    const notes = await callAI(
      `Write exam-ready medical notes on ${body.topic}`
    );
    return NextResponse.json({ notes });
  }

  return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
}
