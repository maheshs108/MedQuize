import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { signToken } from "@/lib/auth";

const VALID_GENDERS = ["male", "female", "other"] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = body.username != null ? String(body.username).trim() : "";
    const mobile = body.mobile != null ? String(body.mobile).trim() : "";
    const gender = VALID_GENDERS.includes(body.gender) ? body.gender : "other";
    const collegeName = body.collegeName != null ? String(body.collegeName).trim() : "";
    const yearOfStudying = body.yearOfStudying != null ? String(body.yearOfStudying).trim() : "";
    const stream = body.stream != null ? String(body.stream).trim() : "";
    const email = body.email != null ? String(body.email).toLowerCase().trim() : "";
    const password = body.password != null ? String(body.password) : "";

    if (!username || !mobile || !collegeName || !yearOfStudying || !stream || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDb();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      mobile,
      gender,
      collegeName,
      yearOfStudying,
      stream,
      email,
      password: hashed,
    });

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const u = user.toObject() as Record<string, unknown>;
    delete u.password;

    return NextResponse.json(
      { user: u, token },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    const err = e as Error;
    console.error("Signup error:", err);
    const message = err.message || "";
    if (message.includes("E11000") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }
    if (
      message.includes("ECONNREFUSED") ||
      message.includes("querySrv") ||
      message.includes("ENOTFOUND") ||
      message.includes("connection")
    ) {
      return NextResponse.json(
        { error: "Database connection failed. Please try again later or contact support." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Sign up failed. Please try again." },
      { status: 500 }
    );
  }
}
