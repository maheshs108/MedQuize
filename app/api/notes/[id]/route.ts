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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = await getUserId(request);
    await connectDb();
    const note = await Note.findById(id).lean();
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (note.userId && note.userId !== "anonymous" && note.userId !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json(note);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDb();
    const body = await request.json();
    const note = await Note.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).lean();
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(note);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDb();
    const note = await Note.findByIdAndDelete(id);
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
