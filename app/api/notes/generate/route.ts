import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a medical education assistant for MBBS and Nursing students. Given a topic name, write clear, structured study notes suitable for revision. Include:
- Key definitions and concepts
- Important points (bullet or numbered where helpful)
- Clinical or practical relevance when useful
- Keep language precise and suitable for medical/nursing exams
Write only the notes content, no extra preamble or "Here are your notes" style text.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const topic = body.topic != null ? String(body.topic).trim() : "";
    const provider = body.provider as string | undefined; // "openai" | "gemini" | "auto"

    if (!topic) {
      return NextResponse.json(
        { error: "Topic name is required" },
        { status: 400 }
      );
    }

    const userPrompt = `Write study notes on this topic for MBBS/Nursing students: ${topic}`;

    // Try OpenAI if key is set
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && (provider === "openai" || provider === "auto" || !provider)) {
      try {
        const text = await generateWithOpenAI(openaiKey, userPrompt);
        if (text) return NextResponse.json({ title: topic, content: text });
      } catch (_) {}
    }

    // Try Gemini if key is set
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && (provider === "gemini" || provider === "auto" || !provider)) {
      try {
        const text = await generateWithGemini(geminiKey, userPrompt);
        if (text) {
          return NextResponse.json({ title: topic, content: text });
        }
      } catch (_) {}
    }

    // Try Mistral (same key as quiz)
    const mistralKey = process.env.MISTRAL_API_KEY;
    if (mistralKey && (provider === "auto" || !provider)) {
      try {
        const text = await generateWithMistral(mistralKey, userPrompt);
        if (text) return NextResponse.json({ title: topic, content: text });
      } catch (_) {}
    }

    // Try Groq (free tier)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && (provider === "auto" || !provider)) {
      try {
        const text = await generateWithGroq(groqKey, userPrompt);
        if (text) return NextResponse.json({ title: topic, content: text });
      } catch (_) {}
    }

    // Fallback: simple template notes so something always generates
    const templateContent = templateNotes(topic);
    return NextResponse.json({ title: topic, content: templateContent });
  } catch (e) {
    console.error("Notes generate error:", e);
    return NextResponse.json(
      { error: "Failed to generate notes. Please try again." },
      { status: 500 }
    );
  }
}

async function generateWithOpenAI(apiKey: string, userPrompt: string): Promise<string | null> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.5,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI: ${res.status} ${t.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  return content || null;
}

async function generateWithGemini(apiKey: string, userPrompt: string): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-1.5-flash"}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT + "\n\n" + userPrompt },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.5,
      },
    }),
  });

  if (!res.ok) {
    await res.text();
    throw new Error("Gemini request failed");
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  return text || null;
}

async function generateWithMistral(apiKey: string, userPrompt: string): Promise<string | null> {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.MISTRAL_MODEL || "mistral-tiny",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.5,
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function generateWithGroq(apiKey: string, userPrompt: string): Promise<string | null> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.5,
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

function templateNotes(topic: string): string {
  return `# ${topic}

## Definition
${topic} is an important topic in medical and nursing education. Review your textbooks and lectures for accurate definitions and scope.

## Key points
- Core concept 1: revise from your notes
- Core concept 2: revise from your notes
- Clinical relevance: apply to practice

## Summary
Use this as a starting outline. Add details from your course materials, and generate a quiz from this note to test yourself.`;
}
