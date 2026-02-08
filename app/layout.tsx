import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConnectionCheck } from "@/components/ConnectionCheck";

export const metadata: Metadata = {
  title: "MedQuize – Medical Study for MBBS & Nursing",
  description:
    "Quiz from notes, notes storage, and 3D anatomy for medical students. Supports PDF, Word, and images.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen">
        <AuthProvider>
          <Nav />
          <main className="min-h-screen">{children}</main>
          <ConnectionCheck />
        </AuthProvider>
      </body>
    </html>
  );
}
