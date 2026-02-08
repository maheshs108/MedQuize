import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { User as UserModel } from "@/models/User";
import { sendPasswordResetEmail, isEmailConfigured } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectDb();

    // ✅ FIX: Cast User model correctly for TypeScript
    const User =
      (mongoose.models.User as mongoose.Model<any>) ||
      UserModel;

    const user = await User.findOne({ email }).lean();

    if (!user) {
      // Security best practice: don't reveal existence
      return NextResponse.json(
        {
          message:
            "If an account exists with this email, you will receive a password reset link.",
        },
        { status: 200 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashed = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.updateOne(
      { _id: user._id },
      {
        resetPasswordToken: hashed,
        resetPasswordExpires: expires,
      }
    );

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : null) ||
      request.headers.get("origin") ||
      request.nextUrl.origin;

    const resetLink = `${baseUrl.replace(
      /\/$/,
      ""
    )}/auth/reset-password?token=${token}`;

    if (!isEmailConfigured()) {
      return NextResponse.json(
        {
          message:
            "Email is not configured. Contact support to reset your password.",
          resetLink:
            process.env.NODE_ENV === "development"
              ? resetLink
              : undefined,
        },
        { status: 200 }
      );
    }

    const sent = await sendPasswordResetEmail(
      email,
      resetLink,
      user.mobile
    );

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send email. Try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Request failed" },
      { status: 500 }
    );
  }
}
