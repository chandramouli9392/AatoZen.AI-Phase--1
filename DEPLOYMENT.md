# AatoZen.AI Deployment Guide

Follow these steps to make your AatoZen.AI studio available as a public, clickable link.

## 1. Deploy the Backend (Railway)

We recommend **Railway** because it handles Docker and FFmpeg automatically.

1.  **Push to GitHub**: Create a repository for `ai-video-backend`.
2.  **Connect Railway**: Go to [Railway.app](https://railway.app), create a new project, and connect your GitHub repo.
3.  **Environment Variables**: In the Railway dashboard, add these variables:
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `STABILITY_API_KEY`: Your Stability AI API Key.
4.  **Wait for Build**: Railway will detect the `Dockerfile` and deploy it.
5.  **Copy Public URL**: Once finished, Railway will provide a link like `https://backend-production.up.railway.app`.

## 2. Deploy the Frontend (Vercel)

Vercel is the best home for Next.js applications.

1.  **Connect Vercel**: Go to [Vercel.com](https://vercel.com), create a new project, and connect the same repository (or a separate one for the frontend).
2.  **Environment Variables**: During setup, add this Environment Variable:
    *   `NEXT_PUBLIC_API_URL`: Paste your **Railway Backend URL** (e.g., `https://backend-production.up.railway.app`).
3.  **Deploy**: Vercel will build and give you a public URL like `https://aatozen-ai.vercel.app`.

---

## 3. Important Notes
- **CORS**: The backend is already configured to allow requests from your frontend.
- **Persistence**: Temporary files are stored in `outputs/`. If you want to keep them permanently, consider a cloud storage provider (like AWS S3) for the `merged.mp4` files in the future.
- **BGM**: Ensure your `local_music` folder is pushed to GitHub so the fallback tracks are available on the server.
