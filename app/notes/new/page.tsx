"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, FileText, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Not in browser"));
      return;
    }
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load script"));
    document.head.appendChild(script);
  });
}

async function loadTesseract(): Promise<{
  recognize: (image: string, lang: string, opts?: { logger?: (m: unknown) => void }) => Promise<{ data: { text: string } }>;
}> {
  type Worker = { recognize: (img: string) => Promise<{ data: { text: string } }>; terminate: () => Promise<void> };
  type TesseractAPI = { createWorker: (lang?: string) => Promise<Worker> };
  const w = typeof window !== "undefined" ? (window as unknown as { Tesseract?: TesseractAPI }) : null;
  if (w?.Tesseract) {
    return {
      recognize: async (image, lang) => {
        const worker = await w.Tesseract!.createWorker(lang || "eng");
        try {
          return await worker.recognize(image);
        } finally {
          await worker.terminate();
        }
      },
    };
  }
  await loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js");
  const T = (window as unknown as { Tesseract?: TesseractAPI }).Tesseract;
  if (!T) throw new Error("Tesseract not loaded");
  return {
    recognize: async (image, lang) => {
      const worker = await T.createWorker(lang || "eng");
      try {
        return await worker.recognize(image);
      } finally {
        await worker.terminate();
      }
    },
  };
}

export default function NewNotePage() {
  const router = useRouter();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    const isWord = file.type.includes("wordprocessingml") || file.type === "application/msword";
    if (!isImage && !isPdf && !isWord) {
      alert("Please select an image, PDF, or Word (DOC/DOCX) file.");
      return;
    }
    if (isImage) setImagePreview(URL.createObjectURL(file));
    else setImagePreview(null);
    setUploadedFileName(file.name);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
        if (data.extractedText) setContent((prev) => (prev ? prev + "\n\n" + data.extractedText : data.extractedText).trim());
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleExtractText = async () => {
    if (!imagePreview) return;
    setExtracting(true);
    try {
      const Tesseract = await loadTesseract();
      const { data } = await Tesseract.recognize(imagePreview, "eng", {
        logger: () => {},
      });
      setContent((prev) => (prev ? prev + "\n\n" + data.text : data.text).trim());
    } catch {
      alert("Could not extract text from image. Check your connection and try again.");
    } finally {
      setExtracting(false);
    }
  };

  const handleRemoveUpload = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageUrl("");
    setUploadedFileName(null);
  };

  const handleGenerateFromTopic = async () => {
    const t = topic.trim();
    if (!t) {
      setGenerateError("Enter a topic name");
      return;
    }
    setGenerateError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, provider: "auto" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenerateError(data.error || "Generate failed");
        return;
      }
      setTitle(data.title || t);
      setContent(data.content || "");
      setTopic("");
    } catch {
      setGenerateError("Network error. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalContent = content.trim() || (imageUrl ? "(Note from image)" : "");
    if (!finalContent && !imageUrl) {
      alert("Add some content or upload an image from your gallery.");
      return;
    }
    setSaving(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/notes", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: title || "Note from gallery",
          content: finalContent,
          subject,
          imageUrl: imageUrl || undefined,
        }),
      });
      const data = await res.json();
      if (data._id) router.push(`/notes/${data._id}`);
      else alert(data.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-medical-dark mb-6">New Note</h1>

      {/* Generate notes from topic */}
      <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Generate notes from topic
        </h2>
        <p className="text-sm text-slate-500 mb-3">
          Enter a topic name and we&apos;ll generate study notes for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerateFromTopic()}
            placeholder="e.g. Cardiac cycle, Anatomy of liver"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            disabled={generating}
          />
          <button
            type="button"
            onClick={handleGenerateFromTopic}
            disabled={generating}
            className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-60 transition flex items-center justify-center gap-1"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Generating…" : "Generate"}
          </button>
        </div>
        {generateError && <p className="text-sm text-red-600">{generateError}</p>}
      </div>

      {/* Upload notes (PDF, Word, images) */}
      <div className="mb-6 p-4 rounded-xl border-2 border-dashed border-medical-primary/40 bg-teal-50/50">
        <h2 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <ImagePlus className="w-5 h-5 text-medical-primary" />
          Upload notes (PDF, Word, or images)
        </h2>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload notes file"
        />
        <button
          type="button"
          onClick={handleGalleryClick}
          disabled={uploading}
          className="flex items-center gap-2 w-full justify-center py-3 px-4 rounded-lg bg-medical-primary text-white hover:bg-medical-dark disabled:opacity-60 transition"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <ImagePlus className="w-5 h-5" />
              Upload from gallery or file (images, PDF, Word)
            </>
          )}
        </button>
        <p className="text-sm text-slate-500 mt-2 text-center">
          Images, PDF, or Word (DOC/DOCX). Text is extracted from PDF/Word automatically.
        </p>
      </div>

      {(imagePreview || uploadedFileName) && (
        <div className="mb-6">
          <div className="relative inline-block">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Uploaded note"
                className="max-h-48 rounded-lg border border-slate-200 object-contain"
              />
            ) : (
              <div className="flex items-center gap-2 p-4 rounded-lg border border-slate-200 bg-slate-50">
                <FileText className="w-10 h-10 text-medical-primary" />
                <span className="text-slate-600">{uploadedFileName}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleRemoveUpload}
              className="absolute top-2 right-2 rounded-full bg-red-500 text-white w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600"
              aria-label="Remove file"
            >
              ×
            </button>
          </div>
          {imagePreview && (
            <button
              type="button"
              onClick={handleExtractText}
              disabled={extracting}
              className="mt-2 text-sm text-medical-primary hover:underline disabled:opacity-50 flex items-center gap-1"
            >
              {extracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting text…
                </>
              ) : (
                "Extract text from image"
              )}
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            placeholder="e.g. Cardiac cycle"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Subject (optional)
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            placeholder="e.g. Physiology, Anatomy"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            placeholder="Paste or type your study notes here, or extract text from an image above. You can later generate a quiz from this note."
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-medical-primary text-white rounded-lg hover:bg-medical-dark disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save Note"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/notes")}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
