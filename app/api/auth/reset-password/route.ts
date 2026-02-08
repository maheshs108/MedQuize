import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password.trim() : "";
    if (!token || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Valid token and password (min 6 characters) are required" },
        { status: 400 }
      );
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    await connectDb();
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Request a new one." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: user._id },
      { password: hashedPassword, resetPasswordToken: "", resetPasswordExpires: null }
    );

    return NextResponse.json({ message: "Password updated. You can sign in now." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
