"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ShareButton } from "@/components/ShareButton";

interface QuizAttemptItem {
  _id: string;
  topic: string;
  sourceType: string;
  score: number;
  total: number;
  completedAt: string;
  questions?: {
    question: string;
    correct: boolean;
    explanation?: string;
    expectedAnswer?: string;
    userWrittenAnswer?: string;
  }[];
}

export default function ProfilePage() {
  const { user, token, loading, setUser } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttemptItem[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) {
      setLoadingAttempts(false);
      return;
    }
    fetch("/api/quiz/results", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setAttempts(data.attempts || []);
      })
      .catch(() => setAttempts([]))
      .finally(() => setLoadingAttempts(false));
  }, [token]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-medical-dark mb-4">My Profile</h1>
        <p className="text-slate-600 mb-4">Sign in to view your profile and quiz performance history.</p>
        <Link
          href="/auth/signin"
          className="inline-block px-4 py-2 bg-medical-primary text-white rounded-lg hover:bg-medical-dark"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const formatDate = (d: string) => {
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
    return d;
  };

  const profileImageUrl = (user as { profileImageUrl?: string }).profileImageUrl;
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file (JPEG, PNG, etc.).");
      return;
    }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) {
        alert(data.error || "Upload failed.");
        return;
      }
      const patchRes = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profileImageUrl: data.url }),
      });
      if (!patchRes.ok) {
        alert("Failed to update profile picture.");
        return;
      }
      const updated = await patchRes.json();
      setUser({ ...user, ...updated });
      if (typeof window !== "undefined") {
        localStorage.setItem("medquize_user", JSON.stringify({ ...user, ...updated }));
      }
    } catch {
      alert("Upload failed.");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-medical-dark">My Profile</h1>
        <ShareButton title="My MedQuize Profile" url="/profile" />
      </div>

      <section className="mb-8 p-4 rounded-xl border border-slate-200 bg-white">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Account</h2>
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-slate-300">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-slate-500 font-semibold">{user.username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              aria-label="Upload profile picture"
            />
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
              className="mt-2 text-sm text-medical-primary font-medium hover:underline disabled:opacity-50"
            >
              {uploadingAvatar ? "Uploading…" : "Change profile picture"}
            </button>
          </div>
        </div>
        <p className="text-slate-600"><span className="font-medium">Name:</span> {user.username}</p>
        <p className="text-slate-600"><span className="font-medium">Email:</span> {user.email}</p>
        {user.collegeName && (
          <p className="text-slate-600"><span className="font-medium">College:</span> {user.collegeName}</p>
        )}
        {user.stream && (
          <p className="text-slate-600"><span className="font-medium">Stream:</span> {user.stream}</p>
        )}
        {user.yearOfStudying && (
          <p className="text-slate-600"><span className="font-medium">Year:</span> {user.yearOfStudying}</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Quiz Performance</h2>
        <p className="text-slate-600 text-sm mb-4">
          All your quiz attempts are saved here. Review past results and see where you need to improve.
        </p>

        {loadingAttempts ? (
          <p className="text-slate-500">Loading history...</p>
        ) : attempts.length === 0 ? (
          <p className="text-slate-500">No quiz attempts yet. Take a quiz from the Quiz page and your results will appear here.</p>
          <Link href="/quiz" className="inline-block mt-2 text-medical-primary font-medium hover:underline">Go to Quiz</Link>
        ) : (
          <ul className="space-y-3">
            {attempts.map((a) => (
              <li key={a._id} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === a._id ? null : a._id)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-800">
                    {a.topic || (a.sourceType === "note" ? "From note" : "Quiz")}
                  </span>
                  <span className="text-slate-600">
                    {a.score}/{a.total} ({a.total ? Math.round((a.score / a.total) * 100) : 0}%)
                  </span>
                </button>
                <p className="px-4 pb-2 text-xs text-slate-400">{formatDate(a.completedAt)}</p>
                {expandedId === a._id && a.questions && a.questions.length > 0 && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-100 space-y-3">
                    <p className="text-sm font-medium text-slate-700 pt-2">Questions you got wrong:</p>
                    {a.questions
                      .filter((q) => !q.correct)
                      .map((q, idx) => (
                        <div key={idx} className="text-sm p-3 rounded-lg bg-amber-50 border border-amber-200">
                          <p className="font-medium text-slate-800">{q.question}</p>
                          {q.expectedAnswer != null && q.expectedAnswer !== "" && (
                            <p className="mt-1 text-green-800"><span className="font-medium">Expected:</span> {q.expectedAnswer}</p>
                          )}
                          {q.userWrittenAnswer != null && q.userWrittenAnswer !== "" && (
                            <p className="mt-0.5 text-slate-700"><span className="font-medium">Your answer:</span> {q.userWrittenAnswer}</p>
                          )}
                          {q.explanation && (
                            <p className="mt-1 text-amber-900">{q.explanation}</p>
                          )}
                        </div>
                      ))}
                    {a.questions.every((q) => q.correct) && (
                      <p className="text-sm text-green-600">All correct in this attempt.</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
