# AatoZen.AI - Where AI Meets Effortless Editing

A production-ready monorepo for AI-orchestrated video editing and BGM generation.

## Project Structure

```
AatoZen.AI/
├── backend/            # FastAPI Backend
│   ├── app/
│   │   ├── main.py     # Entry point & Routes
│   │   ├── core/       # Config & Security
│   │   ├── services/   # Video & Music Logic
│   │   └── utils/      # FFmpeg & Metadata
│   ├── uploads/        # Input storage
│   ├── outputs/        # Processed results
│   ├── .env            # Credentials (API Keys)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/           # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/ # AI-molecule Background, Glass UI
│   │   └── lib/        # API Client
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   └── tailwind.config.ts
└── README.md
```

## Setup Instructions

### Backend (FastAPI)
1. Navigate to `backend/`.
2. Install dependencies: `pip install -r requirements.txt`.
3. Add your `GEMINI_API_KEY` and `STABILITY_API_KEY` to `.env`.
4. Run the server: `uvicorn app.main:app --reload`.

### Frontend (Next.js)
1. Navigate to `frontend/`.
2. Install dependencies: `npm install`.
3. Run the development server: `npm run dev`.
4. Open [http://localhost:3000](http://localhost:3000).

## Features
- **AI Video Orchestration**: Gemini-powered FFmpeg command generation.
- **AI Background Music**: Stability AI-powered BGM synthesis.
- **Premium UI**: Glassmorphism design with animated AI molecule background.
- **Streamlined Workflow**: Upload -> Orchestrate -> Preview -> Download.

---
© 2026 AatoZen.AI
