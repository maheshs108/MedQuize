"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ShareButton } from "@/components/ShareButton";

interface NoteItem {
  _id: string;
  title: string;
  content: string;
  subject?: string;
  updatedAt: string;
}

export default function NotesPage() {
  const { token } = useAuth();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch("/api/notes", { headers })
      .then((r) => r.json())
      .then((data) => {
        setNotes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-medical-dark">My Notes</h1>
        <Link
          href="/notes/new"
          className="inline-flex justify-center px-5 py-2.5 rounded-xl bg-medical-primary text-white font-medium hover:bg-medical-dark transition w-full sm:w-auto"
        >
          New Note / Upload notes
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading notes...</p>
      ) : notes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-slate-500 mb-4">No notes yet. Create one or upload images, PDF, or Word.</p>
          <Link href="/notes/new" className="inline-block px-5 py-2.5 rounded-xl bg-medical-primary text-white font-medium hover:bg-medical-dark transition">
            Create note
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4">
          {notes.map((n) => (
            <li key={n._id} className="group relative">
              <Link href={"/notes/" + n._id} className="block p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-medical-primary hover:shadow-md transition">
                <h2 className="font-semibold text-medical-dark text-lg">{n.title}</h2>
                {n.subject && <span className="text-sm text-slate-500">{n.subject}</span>}
                <p className="text-slate-600 text-sm mt-1 line-clamp-2">{n.content}</p>
              </Link>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
                <ShareButton
                  title={n.title}
                  url={`/notes/${n._id}`}
                  text={`Note: ${n.title}`}
                  className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 shadow"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
