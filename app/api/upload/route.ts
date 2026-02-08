import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const PDF_TYPE = "application/pdf";
const WORD_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

function getExt(mime: string, name: string): string {
  if (IMAGE_TYPES.includes(mime)) return path.extname(name) || ".jpg";
  if (mime === PDF_TYPE) return ".pdf";
  if (WORD_TYPES.includes(mime)) return name.toLowerCase().endsWith(".doc") ? ".doc" : ".docx";
  return path.extname(name) || ".bin";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !file.size) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const allowed = [...IMAGE_TYPES, PDF_TYPE, ...WORD_TYPES];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Only images (JPEG, PNG, WebP, GIF), PDF, and Word (DOC/DOCX) are allowed" },
        { status: 400 }
      );
    }

    const ext = getExt(file.type, file.name);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(UPLOAD_DIR, name);
    await writeFile(filePath, buffer);
    const url = `/uploads/${name}`;

    let extractedText: string | undefined;

    if (file.type === PDF_TYPE) {
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const data = await pdfParse(buffer);
        extractedText = data?.text?.trim();
      } catch (_) {
        // PDF text extraction unavailable if pdf-parse not installed
      }
    } else if (WORD_TYPES.includes(file.type)) {
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result?.value?.trim();
      } catch (_) {
        // Word text extraction unavailable if mammoth not installed
      }
    }

    return NextResponse.json({ url, extractedText });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
