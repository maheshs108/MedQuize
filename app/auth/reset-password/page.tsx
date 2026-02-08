"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid reset link. Request a new one from the forgot password page.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Password updated. You can sign in now.");
        setTimeout(() => router.push("/auth/signin"), 2000);
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
          <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">Set new password</h1>
          <p className="text-slate-500 text-center text-sm mb-6">
            Enter your new password below.
          </p>
          {!token ? (
            <p className="text-red-600 text-sm text-center mb-4">{error}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
              )}
              {message && (
                <div className="p-3 rounded-lg bg-green-50 text-green-800 text-sm">{message}</div>
              )}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-medical-primary focus:border-medical-primary outline-none transition"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-medical-primary focus:border-medical-primary outline-none transition"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-medical-primary text-white font-medium hover:bg-medical-dark disabled:opacity-60 transition"
              >
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
          <p className="text-center text-slate-500 text-sm mt-6">
            <Link href="/auth/signin" className="text-medical-primary font-medium hover:underline">
              Back to sign in
            </Link>
            {" · "}
            <Link href="/auth/forgot-password" className="text-medical-primary font-medium hover:underline">
              Forgot password
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
