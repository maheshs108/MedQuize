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
        <h1 className="text-xl font-bold">My Profile</h1>
        <Link href="/auth/signin">Sign in</Link>
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
      <h1 className="text-xl font-bold mb-4">My Profile</h1>
      <ShareButton title="My MedQuize Profile" url="/profile" />

      <ul className="mt-4 space-y-2">
        {attempts.map((a) => (
          <li key={a._id} className="border p-2">
            {a.topic} — {a.score}/{a.total}
            <div className="text-sm text-gray-500">
              {formatDate(a.completedAt)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
