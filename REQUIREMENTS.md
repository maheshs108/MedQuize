# MedQuize – Requirements & Setup Commands

Use these in **Cursor** (terminal) or any terminal from the project folder.

---

## 1. Prerequisites

- **Node.js** 18 or 20 (LTS): [nodejs.org](https://nodejs.org)
- **MongoDB Atlas** free cluster: [cloud.mongodb.com](https://cloud.mongodb.com)
- (Optional) **Groq** free API key for quiz generation: [console.groq.com](https://console.groq.com)

---

## 2. Commands to Run (in order)

### Install dependencies

```bash
cd c:\Users\A\Desktop\MedQuize
npm install
```

### Create environment file

```bash
copy .env.example .env.local
```

Then edit `.env.local` and set:

- **MONGODB_URI** – Your MongoDB Atlas connection string (required)
- **GROQ_API_KEY** – (Optional) For AI-generated quizzes; get free at console.groq.com

### Start development server

```bash
npm run dev
```

Open **http://localhost:3000**.

### Build for production

```bash
npm run build
npm start
```

---

## 3. Feature Summary

| Feature | Tech | Notes |
|--------|------|--------|
| **Notes** | MongoDB Atlas, Mongoose | CRUD via `/api/notes`; UI at `/notes` |
| **Quiz from notes** | Groq (free) or template fallback | POST `/api/quiz/generate` with `noteText` |
| **3D Anatomy** | Three.js, R3F, free .glb models | List from `/api/anatomy`; add models to `public/models/` |

---

## 4. MongoDB Atlas

1. Create cluster → Connect → “Drivers” → copy connection string.
2. Replace `<password>` with your DB user password.
3. In Network Access, allow `0.0.0.0/0` (or your IP) for development.
4. Set in `.env.local`: `MONGODB_URI=mongodb+srv://...`

---

## 5. No Paid APIs

- **Database:** MongoDB Atlas free tier.
- **Quiz AI:** Groq free API key, or built-in template quiz if no key.
- **3D:** Three.js + free CC-licensed models (e.g. BodyParts3D, anatomytool.org).
