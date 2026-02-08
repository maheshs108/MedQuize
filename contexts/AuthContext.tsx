"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserType {
  _id: string;
  username: string;
  email: string;
  mobile?: string;
  gender?: string;
  collegeName?: string;
  yearOfStudying?: string;
  stream?: string;
  profileImageUrl?: string;
}

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (data: SignUpData) => Promise<{ error?: string }>;
  signOut: () => void;
  setUser: (u: UserType | null) => void;
  setToken: (t: string | null) => void;
}

export interface SignUpData {
  username: string;
  mobile: string;
  gender: string;
  collegeName: string;
  yearOfStudying: string;
  stream: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "medquize_token";
const USER_KEY = "medquize_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (typeof window !== "undefined") {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem(TOKEN_KEY);
    const u = localStorage.getItem(USER_KEY);
    if (t) setTokenState(t);
    if (u) try { setUser(JSON.parse(u)); } catch (_) {}
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Sign in failed" };
    setToken(data.token);
    setUser(data.user);
    if (typeof window !== "undefined" && data.user)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return {};
  };

  const signUp = async (data: SignUpData) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const out = await res.json();
    if (!res.ok) return { error: out.error || "Sign up failed" };
    setToken(out.token);
    setUser(out.user);
    if (typeof window !== "undefined" && out.user)
      localStorage.setItem(USER_KEY, JSON.stringify(out.user));
    return {};
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signUp,
        signOut,
        setUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
