"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ShareButton } from "@/components/ShareButton";

type Difficulty = "easy" | "normal" | "hard" | "expert";
type QuestionStyle = "mcq" | "written";

interface QuizQuestionMcq {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizQuestionWritten {
  question: string;
  expectedAnswer: string;
  explanation?: string;
}

type QuizQuestion = QuizQuestionMcq | QuizQuestionWritten;

function isWritten(q: QuizQuestion): q is QuizQuestionWritten {
  return "expectedAnswer" in q && typeof (q as QuizQuestionWritten).expectedAnswer === "string";
}

interface QuizAttemptSummary {
  score: number;
  total: number;
  topic?: string;
  completedAt?: string;
}

function getFeedbackMessage(score: number, total: number, previousAttempts: QuizAttemptSummary[]): string {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const avgPrevious =
    previousAttempts.length > 0
      ? previousAttempts.reduce((s, a) => s + (a.total ? (a.score / a.total) * 100 : 0), 0) / previousAttempts.length
      : null;

  if (pct >= 90) return "Excellent! You've mastered this material. Keep revising to stay sharp.";
  if (pct >= 75) return "Well done! You're on the right track. Review the questions you missed to strengthen weak areas.";
  if (pct >= 60) return "Good effort. Focus on the explanations below for the questions you got wrong—you'll do even better next time.";
  if (pct >= 40)
    return "Keep going! Use the 'Learn' sections below to understand each topic, then try 'Continue Quiz' for more practice.";
  if (avgPrevious !== null && pct > avgPrevious) return "You're improving compared to your last attempts. Review the wrong answers and try again.";
  return "Don't give up! Study the explanations for each wrong answer—understanding beats memorization.";
}

function matchWrittenAnswer(userAnswer: string, expectedAnswer: string): boolean {
  const u = userAnswer.trim().toLowerCase().replace(/\s+/g, " ");
  const e = expectedAnswer.trim().toLowerCase().replace(/\s+/g, " ");
  if (!u) return false;
  if (u === e) return true;
  if (e.length <= 3) return u.includes(e);
  const eWords = e.split(/\s+/).filter((w) => w.length > 2);
  const matchCount = eWords.filter((w) => u.includes(w)).length;
  return matchCount >= Math.max(1, Math.ceil(eWords.length * 0.5));
}

export default function QuizPage() {
  const { token } = useAuth();
  const [noteId, setNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [topicName, setTopicName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [questionStyle, setQuestionStyle] = useState<QuestionStyle>("mcq");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionStyleFromQuiz, setQuestionStyleFromQuiz] = useState<QuestionStyle>("mcq");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [writtenAnswers, setWrittenAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState<QuizAttemptSummary[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "skip">("idle");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const id = u.get("noteId");
    const topicParam = u.get("topic");
    if (topicParam) setTopicName(topicParam);
    if (id) {
      setNoteId(id);
      fetch(`/api/notes/${id}`)
        .then((r) => r.json())
        .then((d) => setNoteContent(d.content || ""))
        .catch(() => {});
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/quiz/results", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPreviousAttempts((data.attempts || []).slice(0, 10));
      }
    } catch (_) {}
  }, [token]);

  const generateQuiz = useCallback(async () => {
    const text = noteContent.trim();
    const topic = topicName.trim();
    if (!text && !topic) {
      alert("Paste your notes, upload a note and open it from Notes, or enter a topic name.");
      return;
    }
    setLoading(true);
    setSaveStatus("idle");
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic || undefined,
          noteText: text || undefined,
          difficulty,
          questionStyle,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to generate quiz.");
        return;
      }
      setQuestions(data.questions || []);
      setQuestionStyleFromQuiz(data.questionStyle === "written" ? "written" : "mcq");
      setSelected({});
      setWrittenAnswers({});
      setSubmitted(false);
      await fetchHistory();
    } catch (e) {
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [noteContent, topicName, difficulty, questionStyle, fetchHistory]);

  const handleSubmit = async () => {
    setSubmitted(true);
    const isWrittenQuiz = questionStyleFromQuiz === "written";

    const score = isWrittenQuiz
      ? questions.reduce((acc, q, i) => {
          if (!isWritten(q)) return acc;
          const userAns = writtenAnswers[i] ?? "";
          return acc + (matchWrittenAnswer(userAns, q.expectedAnswer) ? 1 : 0);
        }, 0)
      : questions.reduce((acc, q, i) => acc + (selected[i] === (q as QuizQuestionMcq).correctIndex ? 1 : 0), 0);
    const total = questions.length;

    if (!token) {
      setSaveStatus("skip");
      return;
    }
    setSaveStatus("saving");
    const topic = topicName.trim();
    const questionsPayload = questions.map((q, i) => {
      if (isWritten(q)) {
        const userAns = writtenAnswers[i] ?? "";
        const correct = matchWrittenAnswer(userAns, q.expectedAnswer);
        return {
          question: q.question,
          options: [],
          correctIndex: -1,
          userAnswerIndex: -1,
          correct,
          explanation: q.explanation || "",
          expectedAnswer: q.expectedAnswer,
          userWrittenAnswer: userAns,
        };
      }
      const mcq = q as QuizQuestionMcq;
      return {
        question: mcq.question,
        options: mcq.options,
        correctIndex: mcq.correctIndex,
        userAnswerIndex: selected[i] ?? -1,
        correct: selected[i] === mcq.correctIndex,
        explanation: mcq.explanation || "",
      };
    });
    try {
      const res = await fetch("/api/quiz/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sourceType: topic ? "topic" : "note",
          topic: topic || (noteId ? "From note" : "From notes"),
          noteId: noteId || undefined,
          score,
          total,
          questions: questionsPayload,
        }),
      });
      if (res.ok) setSaveStatus("saved");
      else setSaveStatus("skip");
      await fetchHistory();
    } catch (_) {
      setSaveStatus("skip");
    }
  };

  const handleContinue = () => {
    generateQuiz();
  };

  const handleEndQuiz = () => {
    setQuestions([]);
    setSelected({});
    setWrittenAnswers({});
    setSubmitted(false);
    setSaveStatus("idle");
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setUploadError(null);
    const parts: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setUploadError(data.error || `Upload failed for ${file.name}`);
          setUploading(false);
          e.target.value = "";
          return;
        }
        if (data.extractedText?.trim()) {
          parts.push(data.extractedText.trim());
        } else if (data.url && file.type.startsWith("image/")) {
          parts.push(`[Image: ${file.name} — add or paste text from this image below if needed]`);
        } else if (data.url) {
          parts.push(`[Uploaded: ${file.name}. Add or paste content below.]`);
        }
      }
      if (parts.length > 0) {
        setNoteContent((prev) => (prev ? prev + "\n\n" + parts.join("\n\n") : parts.join("\n\n")));
      } else {
        const names = Array.from(files).map((f) => f.name).join(", ");
        setNoteContent((prev) => (prev ? prev + "\n\n" : "") + `[Uploaded: ${names}. Add or paste content below.]`);
      }
    } catch {
      setUploadError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const score =
    submitted && questions.length > 0
      ? questionStyleFromQuiz === "written"
        ? questions.reduce((acc, q, i) => {
            if (!isWritten(q)) return acc;
            return acc + (matchWrittenAnswer(writtenAnswers[i] ?? "", q.expectedAnswer) ? 1 : 0);
          }, 0)
        : questions.reduce((acc, q, i) => acc + (selected[i] === (q as QuizQuestionMcq).correctIndex ? 1 : 0), 0)
      : 0;
  const total = questions.length;

  const quizPageUrl = typeof window !== "undefined" ? window.location.href : "/quiz";

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold text-medical-dark">Quiz from Notes</h1>
        <ShareButton title="MedQuize Quiz" url={quizPageUrl} text="Try this quiz on MedQuize" />
      </div>
      <p className="text-slate-600 mb-4">
        Upload notes and paste them here, or open a note from the Notes page and click &quot;Generate Quiz from this
        Note&quot;. You can also enter a topic name to generate a quiz directly.
      </p>

      {questions.length === 0 && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (paste or from uploaded note)
            </label>
            <input
              id="quiz-upload-notes"
              type="file"
              accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple
              className="sr-only"
              onChange={handleFileSelect}
              aria-label="Choose files from your device"
            />
            <div className="flex flex-wrap gap-2 mb-2 items-center">
              <label
                htmlFor={uploading ? undefined : "quiz-upload-notes"}
                className={`inline-block px-4 py-2 border border-medical-primary text-medical-primary rounded-lg hover:bg-medical-primary hover:text-white transition cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                {uploading ? "Uploading…" : "Upload notes"}
              </label>
              <span className="text-sm text-slate-500 self-center">
                Opens your device to choose PDF, Word, or images
              </span>
            </div>
            {uploadError && (
              <p className="text-sm text-red-600 mb-2" role="alert">
                {uploadError}
              </p>
            )}
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Paste your study notes here, or click Upload notes to choose files from your device..."
              rows={5}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-primary"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Or enter a topic to generate quiz
            </label>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="e.g. Cardiac cycle, Anatomy of liver"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-primary"
            />
          </div>

          <div className="mb-4 flex flex-wrap gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-primary"
              >
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Question type</label>
              <select
                value={questionStyle}
                onChange={(e) => setQuestionStyle(e.target.value as QuestionStyle)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-primary"
              >
                <option value="mcq">Multiple choice</option>
                <option value="written">Written answer (no options)</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateQuiz}
            disabled={loading || (!noteContent.trim() && !topicName.trim())}
            className="px-4 py-2 bg-medical-primary text-white rounded-lg hover:bg-medical-dark disabled:opacity-50 transition mb-8"
          >
            {loading ? "Generating..." : "Generate Quiz"}
          </button>
        </>
      )}

      {questions.length > 0 && !submitted && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setQuestions([]);
              setSelected({});
              setWrittenAnswers({});
            }}
            className="text-slate-600 text-sm underline hover:text-medical-primary"
          >
            Back to input
          </button>
        </div>
      )}

      {questions.length > 0 && (
        <div className="space-y-6">
          {questions.map((q, i) => {
            const written = isWritten(q);
            const correct = submitted
              ? written
                ? matchWrittenAnswer(writtenAnswers[i] ?? "", q.expectedAnswer)
                : selected[i] === (q as QuizQuestionMcq).correctIndex
              : false;

            return (
              <div
                key={i}
                className={`p-4 rounded-lg border ${
                  submitted ? (correct ? "border-green-500 bg-green-50" : "border-red-200 bg-red-50") : "border-slate-200 bg-white"
                }`}
              >
                <p className="font-medium text-slate-800 mb-2">
                  {i + 1}. {q.question}
                </p>

                {written ? (
                  <div className="mt-2">
                    <label className="block text-sm text-slate-600 mb-1">Your answer</label>
                    <textarea
                      value={writtenAnswers[i] ?? ""}
                      onChange={(e) => setWrittenAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                      disabled={submitted}
                      placeholder="Write your answer..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-primary disabled:bg-slate-50"
                    />
                    {submitted && (
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-green-700">
                          <span className="font-medium">Expected:</span> {(q as QuizQuestionWritten).expectedAnswer}
                        </p>
                        {(q as QuizQuestionWritten).explanation && (
                          <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900">
                            <span className="font-medium">Learn: </span>
                            {(q as QuizQuestionWritten).explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <ul className="space-y-2">
                      {(q as QuizQuestionMcq).options.map((opt, j) => (
                        <li key={j}>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`q-${i}`}
                              checked={selected[i] === j}
                              onChange={() => !submitted && setSelected((s) => ({ ...s, [i]: j }))}
                              disabled={submitted}
                            />
                            <span>{opt}</span>
                            {submitted && j === (q as QuizQuestionMcq).correctIndex && (
                              <span className="text-green-600 text-sm">(correct)</span>
                            )}
                            {submitted && selected[i] !== (q as QuizQuestionMcq).correctIndex && selected[i] === j && (
                              <span className="text-red-600 text-sm">(your answer)</span>
                            )}
                          </label>
                        </li>
                      ))}
                    </ul>
                    {submitted && selected[i] !== (q as QuizQuestionMcq).correctIndex && (
                      <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <p className="text-sm font-semibold text-amber-900 mb-1">Learn</p>
                        <p className="text-sm text-amber-900">
                          {(q as QuizQuestionMcq).explanation ||
                            `The correct answer is: ${(q as QuizQuestionMcq).options[(q as QuizQuestionMcq).correctIndex]}. Review this topic in your notes.`}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-medical-dark text-white rounded-lg hover:opacity-90"
            >
              Submit Answers
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-lg font-medium text-medical-dark">
                Score: {score} / {total}
                {total > 0 && ` (${Math.round((score / total) * 100)}%)`}
              </p>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {getFeedbackMessage(score, total, previousAttempts)}
              </p>
              {saveStatus === "saved" && (
                <p className="text-sm text-green-600">Quiz result saved to your profile.</p>
              )}
              {saveStatus === "skip" && token && (
                <p className="text-sm text-amber-600">
                  This result could not be saved to your profile. You can try again next time.
                </p>
              )}
              {!token && (
                <p className="text-sm text-slate-500">
                  Sign in to save quiz results to your profile and see your progress over time.
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="px-4 py-2 bg-medical-primary text-white rounded-lg hover:bg-medical-dark disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Continue Quiz"}
                </button>
                <button
                  onClick={handleEndQuiz}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  End Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
