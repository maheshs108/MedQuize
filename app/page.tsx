import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
      <section className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
          Study smarter for MBBS & Nursing: generate quizzes from your notes,
          keep all notes in one place (PDF, Word, images), and explore 3D anatomy
          from basic to advanced.
        </p>
      </section>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
        <Link
          href="/notes"
          className="group p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-medical-primary transition duration-200"
        >
          <h2 className="text-xl font-semibold text-medical-dark mb-2 group-hover:text-medical-dark">
            Notes
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Save and organize study notes. Upload from gallery: images, PDF, Word.
          </p>
        </Link>
        <Link
          href="/quiz"
          className="group p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-medical-primary transition duration-200"
        >
          <h2 className="text-xl font-semibold text-medical-dark mb-2 group-hover:text-medical-dark">
            Quiz from Notes
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Generate MCQs from your notes to test yourself.
          </p>
        </Link>
        <Link
          href="/anatomy"
          className="group p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-medical-primary transition duration-200 sm:col-span-2 lg:col-span-1"
        >
          <h2 className="text-xl font-semibold text-medical-dark mb-2 group-hover:text-medical-dark">
            3D Anatomy
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Click organs to view 3D diagrams and basic to advanced info.
          </p>
        </Link>
      </div>
    </div>
  );
}
