# CropXai Deployment Plan (GitHub + Render + Vercel)

This plan is based on the current project structure:
- `backend` is a Node.js/Express API (`server.js`, `npm start`)
- `frontend` is a React + Vite app (`npm run build`)

---

## 1) Pre-Deployment Checklist (Local)

1. Confirm local runs:
   - Backend:
     - `cd backend`
     - `npm install`
     - `npm start`
   - Frontend:
     - `cd frontend`
     - `npm install`
     - `npm run dev`
2. Verify backend health endpoint locally:
   - `http://localhost:4000/api/health`
3. Ensure `.env` files are not committed:
   - Keep `backend/.env` and `frontend/.env` private.
   - Commit only example env files (`.env.example`).

---

## 2) Upload Project to GitHub

From project root (`d:\cropXai`):

1. Initialize git if needed:
   - `git init`
2. Create/update `.gitignore` and ensure these are ignored:
   - `backend/.env`
   - `frontend/.env`
   - `backend/node_modules`
   - `frontend/node_modules`
   - `frontend/dist`
3. Stage and commit:
   - `git add .`
   - `git commit -m "Initial project setup"`
4. Create a GitHub repository (via GitHub UI), then connect and push:
   - `git remote add origin https://github.com/<your-username>/<your-repo>.git`
   - `git branch -M main`
   - `git push -u origin main`

---

## 3) Deploy Backend on Render

### 3.1 Create Web Service

1. Open Render Dashboard -> **New** -> **Web Service**.
2. Connect your GitHub repo.
3. Configure service:
   - **Name**: `cropxai-backend` (or any name)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3.2 Set Environment Variables (Render)

Add these in Render -> Service -> **Environment**:

- `NODE_ENV=production`
- `PORT=4000` (Render also injects its own port; keeping this is okay)
- `MONGO_URI=<your mongodb connection string>`
- `MONGO_DNS_SERVERS=8.8.8.8,1.1.1.1`
- `JWT_SECRET=<strong secret>`
- `GROQ_API_KEY=<your groq key>`
- `GROQ_MODEL=llama-3.1-8b-instant` (or preferred supported model)
- `GROQ_VISION_MODEL=llama-3.2-11b-vision-preview` (or supported vision model)
- `OPENWEATHER_API_KEY=<your key>`
- `OPENWEATHER_CITY=Delhi` (or your city)
- `DATA_GOV_API_KEY=<your key>`
- `GEMINI_API_KEY=<your key>`
- `CORS_ORIGINS=https://<your-vercel-domain>`
  - If multiple domains are needed, use comma-separated values.

### 3.3 Deploy and Verify Backend

1. Trigger deploy.
2. After deploy, verify:
   - `https://<your-render-service>.onrender.com/api/health`
3. Save backend base URL for frontend setup:
   - Example: `https://cropxai-backend.onrender.com`

---

## 4) Deploy Frontend on Vercel

### 4.1 Import Project

1. Open Vercel -> **Add New** -> **Project**.
2. Import same GitHub repository.
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4.2 Set Frontend Environment Variable

In Vercel Project Settings -> **Environment Variables**:

- `VITE_API_URL=https://<your-render-service>.onrender.com`

Important:
- Do not add trailing slash.
- This project resolves API calls from `VITE_API_URL` in production.

### 4.3 SPA Route Handling (React Router)

Because frontend uses client-side routes (`react-router-dom`), add a `frontend/vercel.json` file:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

This prevents 404 on page refresh for routes like `/dashboard`, `/ai-chat`, etc.

### 4.4 Deploy and Verify Frontend

1. Trigger Vercel deployment.
2. Open deployed URL and test:
   - Login/Register flow
   - Dashboard pages
   - Features that call backend (`/api/...`)

---

## 5) Final Cross-Platform Configuration

1. Copy Vercel production domain.
2. Update Render backend env:
   - `CORS_ORIGINS=https://<your-vercel-domain>`
3. Redeploy backend in Render so CORS policy includes frontend domain.
4. Re-test end-to-end from Vercel frontend.

---

## 6) Smoke Test Checklist (After Both Deployments)

1. `GET /api/health` returns success on Render URL.
2. Frontend loads without blank screen/errors.
3. Auth endpoints work (`register`, `login`, `auth/me`).
4. Protected routes open after login.
5. AI/weather/market-related APIs return expected responses.
6. Browser console has no CORS errors.

---

## 7) Ongoing Deployment Workflow

1. Push changes to GitHub (`main` or deployment branch).
2. Render auto-deploys backend when `backend` changes.
3. Vercel auto-deploys frontend when `frontend` changes.
4. Keep env vars in Render/Vercel updated whenever API keys or domains change.

---

## 8) Notes for This Repository

- Backend uses `server.js` and exposes static uploads via `/uploads`.
- Frontend local dev uses Vite proxy (`/api` -> `http://localhost:4000`), but production must use `VITE_API_URL`.
- Never commit real secrets from `.env` files; manage all production secrets in Render/Vercel dashboards.
