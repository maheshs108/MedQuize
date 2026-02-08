import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Note } from "@/models/Note";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

async function getUserId(request: NextRequest): Promise<string> {
  const token = getTokenFromRequest(request);
  if (!token) return "anonymous";
  const payload = await verifyToken(token);
  return payload?.userId ?? "anonymous";
}

export async function GET(request: NextRequest) {
  try {
    await connectDb();
    const userId = await getUserId(request);
    const notes = await Note.find({ userId }).sort({ updatedAt: -1 }).lean();
    return NextResponse.json(notes);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const userId = await getUserId(request);
    const body = await request.json();
    const { title, content, subject, imageUrl } = body;
    const hasContent = content && String(content).trim();
    const hasImage = imageUrl && String(imageUrl).trim();
    if (!title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }
    if (!hasContent && !hasImage) {
      return NextResponse.json(
        { error: "content or an uploaded file (image/PDF/Word) is required" },
        { status: 400 }
      );
    }
    const note = await Note.create({
      title,
      content: hasContent ? String(content).trim() : "(Note from file)",
      subject: subject || "",
      userId,
      imageUrl: imageUrl || "",
    });
    return NextResponse.json(note);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
