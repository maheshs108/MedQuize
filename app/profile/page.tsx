"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ShareButton } from "@/components/ShareButton";

interface QuizAttemptItem {
  _id: string;
  topic: string;
  score: number;
  total: number;
  completedAt: string;
}

export default function ProfilePage() {
  const { user, token, loading } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttemptItem[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoadingAttempts(false);
      return;
    }

    fetch("/api/quiz/results", {
      headers: { Authorization: Bearer  },
    })
      .then((r) => r.json())
      .then((data) => setAttempts(data.attempts || []))
      .catch(() => setAttempts([]))
      .finally(() => setLoadingAttempts(false));
  }, [token]);

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  if (!user) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-2">My Profile</h1>
        <Link href="/auth/signin" className="text-blue-600 underline">
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
    } catch {
      return d;
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">My Profile</h1>
        <ShareButton title="My MedQuize Profile" url="/profile" />
      </div>

      <h2 className="font-semibold mb-2">Quiz Attempts</h2>

      {loadingAttempts ? (
        <p>Loading attempts...</p>
      ) : attempts.length === 0 ? (
        <p>No quiz attempts yet.</p>
      ) : (
        <ul className="space-y-2">
          {attempts.map((a) => (
            <li key={a._id} className="border p-2 rounded">
              <div className="font-medium">
                {a.topic} — {a.score}/{a.total}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(a.completedAt)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}