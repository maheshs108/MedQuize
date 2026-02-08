"use client";

import { useState } from "react";

export default function AIToolsPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");

  // AI Tutor
  const askTutor = async () => {
    const r = await fetch("/api/mega", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "tutor",
        question,
      }),
    });
    const d = await r.json();
    setAnswer(d.answer || "No response");
  };

  // Quiz generator
  const generateQuiz = async () => {
    const r = await fetch("/api/mega", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "quiz",
        notes,
        style: "MCQ",
      }),
    });
    const d = await r.json();

    // Safely convert quiz to string
    setResult(
      typeof d.questions === "string"
        ? d.questions
        : JSON.stringify(d.questions, null, 2)
    );
  };

  // Voice input (Chrome only)
  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input not supported in this browser");
      return;
    }

    const rec = new (window as any).webkitSpeechRecognition();
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      setQuestion(e.results[0][0].transcript);
    };
    rec.start();
  };

  // PDF generator (browser-safe)
  const downloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const pdf = new jsPDF();
    pdf.text(answer || "No notes", 10, 10);
    pdf.save("notes.pdf");
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-medical-dark">
        AI Tutor & Quiz
      </h1>

      {/* Tutor */}
      <div className="bg-white p-4 rounded-xl border">
        <h2 className="font-semibold mb-2">Ask AI Tutor</h2>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your medical doubt..."
          className="w-full border rounded-lg p-2"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={askTutor}
            className="px-4 py-2 bg-medical-primary text-white rounded"
          >
            Ask
          </button>
          <button
            onClick={startVoice}
            className="px-4 py-2 bg-slate-200 rounded"
          >
            🎤 Voice
          </button>
        </div>
        {answer && <p className="mt-3 text-slate-700">{answer}</p>}
      </div>

      {/* Quiz */}
      <div className="bg-white p-4 rounded-xl border">
        <h2 className="font-semibold mb-2">Generate Quiz from Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste notes here..."
          className="w-full border rounded-lg p-2"
        />
        <button
          onClick={generateQuiz}
          className="mt-2 px-4 py-2 bg-medical-primary text-white rounded"
        >
          Generate Quiz
        </button>

        {result && (
          <pre className="mt-3 text-xs bg-slate-100 p-2 rounded overflow-x-auto">
            {result}
          </pre>
        )}
      </div>

      {/* PDF */}
      <button
        onClick={downloadPDF}
        className="px-4 py-2 bg-slate-800 text-white rounded"
      >
        Download Notes as PDF
      </button>
    </div>
  );
}
