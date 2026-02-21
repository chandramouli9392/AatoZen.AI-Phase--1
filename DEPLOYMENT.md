# AatoZen.AI Deployment Guide

This guide provides step-by-step instructions for deploying the AatoZen.AI platform across two services:
1. **Frontend (Next.js)**: Deployed on **Vercel**
2. **Backend (FastAPI)**: Deployed on **Render**

---

## Part 1: Backend Deployment (Render)

Render is an excellent platform for hosting Python/FastAPI applications.

### Prerequisites
- A GitHub repository containing your code (already done).
- A free account on [Render](https://render.com).

### Steps
1. **Log in to Render** and click on the "New" button, then select **Web Service**.
2. **Connect Repository**: Connect your GitHub account and select the `AatoZen.AI` repository.
3. **Configure Service**:
   - **Name**: `aatozen-backend` (or similar)
   - **Root Directory**: `backend` (CRITICAL: Tell Render the backend is in this sub-folder)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**:
   Scroll down to "Environment Variables" and add the following:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `STABILITY_API_KEY`: Your Stability AI API Key.
   - `PYTHON_VERSION`: `3.10.x` (Recommended to ensure compatibility)
5. **Deploy**: Click **Create Web Service**.
6. **Important Note on FFmpeg**: Your backend relies heavily on `ffmpeg`. Render's default Python environment does *not* include FFmpeg. 
   - *Fixing this*: You will likely need to use a Docker deployment on Render, or add a custom build script to download FFmpeg binaries during the Render build phase. The provided `backend/Dockerfile` is the easiest path for this. If using Docker, select `Docker` as the environment in step 3.

---

## Part 2: Frontend Deployment (Vercel)

Vercel is the creator of Next.js and provides the absolute best deployment experience for it.

### Prerequisites
- Your deployed Render backend URL (e.g., `https://aatozen-backend.onrender.com`).
- A free account on [Vercel](https://vercel.com).

### Steps
1. **Log in to Vercel** and click **Add New... > Project**.
2. **Import Repository**: Connect your GitHub and import the `AatoZen.AI` repository.
3. **Configure Project**:
   - **Framework Preset**: Next.js (Vercel usually detects this automatically).
   - **Root Directory**: Click "Edit" and change it to `frontend`.
4. **Environment Variables**:
   Open the "Environment Variables" dropdown and add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your Render URL from Part 1 (e.g., `https://aatozen-backend.onrender.com`). Do not include a trailing slash.
5. **Deploy**: Click the **Deploy** button.
6. Vercel will build your application and provide you with a live URL (e.g., `https://aatozen-ai.vercel.app`).

### Final Testing
Once both are deployed:
1. Go to your new Vercel URL.
2. Upload test clips and run a merge.
3. Ensure the progress bar updates (meaning SSE is working over the deployed connection) and the final video downloads successfully!
