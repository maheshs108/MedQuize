"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "If an account exists with this email, you will receive a password reset link at your email and on your registered mobile number.");
        setEmail("");
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">Forgot password</h1>
          <p className="text-slate-500 text-center text-sm mb-6">
            Enter your registered email. We will send a reset link to your email and mobile number.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
            )}
            {message && (
              <div className="p-3 rounded-lg bg-green-50 text-green-800 text-sm">{message}</div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-medical-primary focus:border-medical-primary outline-none transition"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-medical-primary text-white font-medium hover:bg-medical-dark disabled:opacity-60 transition"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
          <p className="text-center text-slate-500 text-sm mt-6">
            <Link href="/auth/signin" className="text-medical-primary font-medium hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
