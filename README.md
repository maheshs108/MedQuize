# MedQuize – Medical Education Platform

A free, full-stack website for **MBBS and Nursing students** with:

- **Chatbot** – Generates quizzes from your notes (using free AI)
- **Notes** – One place to save and organize study notes
- **3D Anatomy** – Interactive body and organ viewer with basic-to-advanced info

**No paid APIs.** Uses **MongoDB Atlas** (free tier) and free AI/LLM options.

---

## Requirements

| Requirement | Version / Note |
|------------|-----------------|
| **Node.js** | 18.x or 20.x (LTS) |
| **npm** or **pnpm** | Latest |
| **MongoDB Atlas** | Free cluster (you have this) |
| **Free AI for quizzes** | Groq (free API key) or Ollama (local, no key) |

---

## Deploy (Vercel / Android & all devices)

- **Responsive:** Layout and viewport are set for mobile, tablet, and desktop. Use on Android or any device; the UI adjusts automatically.
- **Vercel:** Connect your repo to [Vercel](https://vercel.com), set env vars (`MONGODB_URL`, `DB=MedQuize`, `JWT_SECRET`, optional `MISTRAL_API_KEY`), and deploy.
- **Environment:** Ensure `MONGODB_URI` or `MONGODB_URL` + `DB`, `JWT_SECRET`, and optional AI keys are set in your deployment environment.

---

## Quick Setup (Commands for Cursor / Terminal)

Run these in order in your project folder (`MedQuize`).

### 1. Install dependencies

```bash
cd c:\Users\A\Desktop\MedQuize
npm install
```

### 2. Environment variables

Create a `.env.local` file in the project root (see `.env.example`). Minimum:

```bash
# Copy example and edit
copy .env.example .env.local
```

Then edit `.env.local` and set:

- `MONGODB_URI` – Your MongoDB Atlas connection string (database name: **MedQuize**), or use `MONGODB_URL` + `DB=MedQuize`
- (Optional) `GROQ_API_KEY` – From [console.groq.com](https://console.groq.com) for free quiz generation

### 3. Run development server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### 4. Build for production

```bash
npm run build
npm start
```

---

## Project Structure

```
MedQuize/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (notes, quiz, auth)
│   ├── (auth)/             # Login / signup
│   ├── notes/              # Notes list & editor
│   ├── quiz/               # Quiz from notes
│   ├── anatomy/            # 3D body/organ viewer
│   └── layout.tsx
├── components/             # Reusable UI & 3D
├── lib/                    # DB, auth, quiz logic
├── models/                 # Mongoose models (Note, User, etc.)
└── public/                 # Static assets, 3D models (e.g. .glb)
```

---

## Features Overview

### 1. Quiz from notes (free AI)

- **Option A – Groq (recommended, free):** Get a free API key at [console.groq.com](https://console.groq.com). Used in `/api/quiz/generate` to turn note text into MCQs.
- **Option B – Ollama (local):** Install [Ollama](https://ollama.ai), run a model (e.g. `ollama run llama3.2`). App can call `localhost:11434` for quiz generation (no API key).

Quiz API accepts note content and returns multiple-choice questions with options and correct answer.

### 2. Notes (MongoDB Atlas)

- Notes stored in MongoDB (title, content, subject, userId, createdAt).
- CRUD APIs: create, list, get one, update, delete.
- UI: list view and editor page.

### 3. 3D anatomy (free assets)

- **Tech:** Three.js + `@react-three/fiber` + `@react-three/drei`.
- **Models:** Use free, education-friendly sources:
  - [BodyParts3D](https://lifesciencedb.jp/bp3d/) (CC BY-SA)
  - [Open 3D Model / AnatomyTool](https://anatomytool.org/open3dmodel) (CC BY-SA)
- Place `.glb` / `.gltf` files in `public/models/` and load them in the anatomy viewer. Each organ can have a detail panel with basic → advanced info (stored in JSON or in DB).

---

## MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free cluster (if you haven’t).
2. Create a database user (username + password).
3. **Network Access:** Add `0.0.0.0/0` (or your IP) so the app can connect.
4. **Connect:** Choose “Connect your application” and copy the connection string.
5. Put it in `.env.local` as:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/MedQuize?retryWrites=true&w=majority
   ```
6. Replace `<user>`, `<password>`, and `<cluster>` with your values.

**If you see `querySrv ECONNREFUSED` or "Sign up failed" (database connection):**
- In Atlas → **Network Access**: add `0.0.0.0/0` (allow from anywhere) for development.
- If the error persists, use the **direct connection** string from Atlas (Driver → Connect → "Drivers" → see "Direct connection" or "Connection string" options). Set that as `MONGODB_DIRECT_URI=...` in `.env.local` (and keep or remove `MONGODB_URL`). The app tries explicit DNS (8.8.8.8, 1.1.1.1) first; the direct URI avoids SRV lookups.

---

## Free AI Options (Quiz Generation)

| Option | Setup | Use in app |
|--------|--------|------------|
| **Groq** | Free key at [console.groq.com](https://console.groq.com) | Set `GROQ_API_KEY` in `.env.local`; API route calls Groq with a “generate quiz from this text” prompt. |
| **Ollama** | Install from [ollama.ai](https://ollama.ai), run e.g. `ollama run llama3.2` | Set `OLLAMA_BASE_URL=http://localhost:11434`; API route calls local Ollama. |

If neither is set, the app can show a “Configure Groq or Ollama” message or use a simple template-based quiz from keywords in the note.

---

## Cursor / AI Usage

- **“Generate quiz from this note”** – Implement by calling your `/api/quiz/generate` with the note body and rendering the returned questions.
- **“Add a new organ to 3D viewer”** – Add a new `.glb` in `public/models/` and an entry in your anatomy list (name, model path, basic/advanced text).
- **“Add notes CRUD”** – Use the `Note` model and the suggested API routes under `app/api/notes/`.

---

## License

MIT. For 3D models, respect their licenses (e.g. CC BY-SA for BodyParts3D / AnatomyTool).
