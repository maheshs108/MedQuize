import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const u = user.toObject() as Record<string, unknown>;
    delete u.password;
    delete u.resetPasswordToken;
    delete u.resetPasswordExpires;

    return NextResponse.json(
      { user: u, token },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Sign in failed" },
      { status: 500 }
    );
  }
}
