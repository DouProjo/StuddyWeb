# StudyGenius — PUSD AI Grade Tracker

AI-powered grade tracker that connects directly to PUSD Synergy (StudentVUE),
plus an AI Tutor, Quiz, Homework Help, and Exam Prep tool.

---

## 🚀 Deploy in 5 Minutes (Free)

### Option 1 — Render.com (Recommended, Free)

1. Upload this folder to a GitHub repo
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build command:** `npm install`
   - **Start command:** `node server.js`
5. Click Deploy → Get a live URL like `https://studygenius-xxxx.onrender.com`

### Option 2 — Railway.app (Free Tier)

1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select your repo
3. Railway auto-detects Node.js and deploys
4. Get your URL from the dashboard

### Option 3 — Vercel (Free)

1. Install Vercel CLI: `npm i -g vercel`
2. In this folder run: `vercel`
3. Follow prompts → get live URL instantly

### Option 4 — Run Locally

```bash
npm install
node server.js
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
studygenius/
├── server.js          ← Express server + Synergy CORS proxy
├── package.json       ← Dependencies
├── .env               ← Optional config (PORT)
└── public/
    └── index.html     ← Full frontend app
```

---

## ⚙️ How It Works

1. **Login page** — Student enters PUSD StudentVUE username/password
2. **Server proxy** — `POST /api/synergy` forwards the SOAP request to
   `https://sis.powayusd.com/Service/PXPCommunication.asmx` server-side
   (no CORS issues since it's server-to-server)
3. **Real grades** — Gradebook, all classes, all assignments fetched live
4. **AI features** — Claude AI analyzes real grades for personalized advice

**Privacy:** Credentials are never stored. Each request forwards them directly
to PUSD's servers and discards them. Same model as GradeCompass.

---

## 🔧 Environment Variables

Create a `.env` file (optional):

```
PORT=3000
```

---

## 📦 Dependencies

- `express` — Web server
- `node-fetch` — Server-side HTTP requests to Synergy
- `cors` — CORS headers
- `dotenv` — Environment variables
