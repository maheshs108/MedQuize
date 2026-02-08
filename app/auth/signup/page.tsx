"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    username: "",
    mobile: "",
    gender: "male",
    collegeName: "",
    yearOfStudying: "",
    stream: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signUp(form);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">Create account</h1>
          <p className="text-slate-500 text-center text-sm mb-6">
            For MBBS & Nursing students
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-medical-primary focus:border-medical-primary outline-none transition"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 mb-1">
                Mobile number
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-medical-primary focus:border-medical-primary outline-none transition"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-medical-primary focus:border-medical-primary outline-none transition bg-white"
              >
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="collegeName" className="block text-sm font-medium text-slate-700 mb-1">
                College name
              </label>
              <input
                id="collegeName"
                name="collegeName"
                type="text"
                value={form.collegeName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-medical-primary focus:border-medical-primary outline-none transition"
                placeholder="Your college"
              />
            </div>
            <div>
              <label htmlFor="yearOfStudying" className="block text-sm font-medium text-slate-700 mb-1">
                Year of studying
              </label>
              <input
                id="yearOfStudying"
                name="yearOfStudying"
                type="text"
                value={form.yearOfStudying}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-medical-primary focus:border-medical-primary outline-none transition"
                placeholder="e.g. 2nd year, 3rd year"
              />
            </div>
            <div>
              <label htmlFor="stream" className="block text-sm font-medium text-slate-700 mb-1">
                Stream
              </label>
              <input
                id="stream"
                name="stream"
                type="text"
                value={form.stream}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-medical-primary focus:border-medical-primary outline-none transition"
                placeholder="e.g. MBBS, B.Sc Nursing"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-medical-primary focus:border-medical-primary outline-none transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-medical-primary focus:border-medical-primary outline-none transition"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-medical-primary text-white font-medium hover:bg-medical-dark disabled:opacity-60 transition"
            >
              {loading ? "Creating account…" : "Sign up"}
            </button>
          </form>
          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-medical-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
