"use client";

import { useState, useEffect } from "react";

export function ConnectionCheck() {
  const [online, setOnline] = useState(true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOnline(navigator.onLine);

    const handleOnline = () => {
      setOnline(true);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
    };
    const handleOffline = () => {
      setOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online && !showBackOnline) return null;

  if (!online) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 py-2 px-4 text-center text-sm font-medium shadow-lg"
        role="alert"
      >
        No internet connection. Check your network and try again.
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] bg-green-600 text-white py-2 px-4 text-center text-sm font-medium shadow-lg"
      role="status"
    >
      Back online. You can continue.
    </div>
  );
}
