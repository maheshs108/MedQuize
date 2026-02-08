import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "") ?? null;
  const payload = token ? await verifyToken(token) : null;
  if (!payload?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDb();
    const user = await User.findById(payload.userId).select("-password -resetPasswordToken -resetPasswordExpires").lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "") ?? null;
  const payload = token ? await verifyToken(token) : null;
  if (!payload?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const profileImageUrl = typeof body.profileImageUrl === "string" ? body.profileImageUrl.trim() : undefined;
    if (profileImageUrl === undefined) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }
    await connectDb();
    const user = await User.findByIdAndUpdate(
      payload.userId,
      { profileImageUrl: profileImageUrl || "" },
      { new: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires").lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
