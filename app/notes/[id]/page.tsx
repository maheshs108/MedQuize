"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ShareButton } from "@/components/ShareButton";

interface Note {
  _id: string;
  title: string;
  content: string;
  subject?: string;
  imageUrl?: string;
}

export default function NoteDetailPage() {
  const params = useParams();
  const { token } = useAuth();
  const id = params?.id as string;
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(`/api/notes/${id}`, { headers })
      .then((res) => res.json())
      .then((data) => {
        setNote(data._id ? data : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, token]);

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (!note) return <div className="container mx-auto px-4 py-8">Note not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link href="/notes" className="text-medical-primary hover:underline">
          ← Back to Notes
        </Link>
        <div className="flex items-center gap-2">
          <ShareButton
            title={note.title}
            url={`/notes/${id}`}
            text={`Note: ${note.title}`}
          />
          <Link
            href={`/quiz?noteId=${id}`}
            className="px-4 py-2 bg-medical-primary text-white rounded-lg hover:bg-medical-dark transition"
          >
            Generate Quiz from this Note
          </Link>
        </div>
      </div>
      <article className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-medical-dark">{note.title}</h1>
        {note.subject && (
          <p className="text-slate-500 text-sm mt-1">{note.subject}</p>
        )}
        {note.imageUrl && (
          <img
            src={note.imageUrl}
            alt="Note"
            className="mt-4 max-w-full rounded-lg border border-slate-200 max-h-96 object-contain"
          />
        )}
        <div className="mt-4 text-slate-700 whitespace-pre-wrap">
          {note.content}
        </div>
      </article>
    </div>
  );
}
