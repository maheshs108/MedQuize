"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";

export function Nav() {
  const { user, token, signOut, loading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4 flex items-center justify-between h-14 sm:h-16">
        <Logo className="text-slate-800" />

        <div className="hidden sm:flex items-center gap-6">
          <Link
            href="/notes"
            className="text-slate-600 hover:text-medical-primary transition font-medium"
          >
            Notes
          </Link>
          <Link
            href="/quiz"
            className="text-slate-600 hover:text-medical-primary transition font-medium"
          >
            Quiz
          </Link>
          <Link
            href="/anatomy"
            className="text-slate-600 hover:text-medical-primary transition font-medium"
          >
            3D Anatomy
          </Link>
          {!loading && (
            token && user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <span className="text-slate-600 text-sm hidden md:inline">{user.username}</span>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1 text-slate-600 hover:text-red-600 transition text-sm"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-slate-600 hover:text-medical-primary transition font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-xl bg-medical-primary text-white font-medium hover:bg-medical-dark transition"
                >
                  Sign up
                </Link>
              </>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="sm:hidden border-t border-slate-200 bg-white py-4 px-4 space-y-2">
          <Link
            href="/notes"
            className="block py-2 text-slate-700 font-medium"
            onClick={() => setOpen(false)}
          >
            Notes
          </Link>
          <Link
            href="/quiz"
            className="block py-2 text-slate-700 font-medium"
            onClick={() => setOpen(false)}
          >
            Quiz
          </Link>
          <Link
            href="/anatomy"
            className="block py-2 text-slate-700 font-medium"
            onClick={() => setOpen(false)}
          >
            3D Anatomy
          </Link>
          {!loading && (
            token && user ? (
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-slate-700 font-medium"
                  onClick={() => setOpen(false)}
                >
                  <User className="w-4 h-4 text-slate-500" />
                  {user.username}
                </Link>
                <button
                  onClick={() => { signOut(); setOpen(false); }}
                  className="ml-auto text-red-600 text-sm font-medium"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-200 flex gap-2">
                <Link
                  href="/auth/signin"
                  className="block flex-1 py-2 text-center rounded-xl border border-slate-300 font-medium"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="block flex-1 py-2 text-center rounded-xl bg-medical-primary text-white font-medium"
                  onClick={() => setOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
}
