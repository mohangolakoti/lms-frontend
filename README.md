# LMS Frontend

React-based Learning Management System UI. Deployed on Vercel.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS |
| Routing | React Router DOM v6 |
| API Client | Axios + axios-retry |
| State/Cache | TanStack Query v5 |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Backend API running (see backend README)

### 1. Install

```bash
git clone <your-frontend-repo-url>
cd frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set VITE_API_BASE_URL to your backend URL
```

For local development with backend on port 3000:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Start development server

```bash
npm run dev
# → http://localhost:3001
```

---

## Environment Variables

See [`.env.example`](.env.example) for full reference.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | ★ Yes | Full URL to the backend API (no trailing slash) |
| `VITE_APP_NAME` | No | Display name shown in browser tab |
| `VITE_APP_ENV` | No | Environment label (`development` / `production`) |

---

## Deployment on Vercel

### Option A — Vercel Dashboard (Recommended for initial setup)

1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. Vercel auto-detects Vite — no build config needed
3. In **Project Settings → Environment Variables**, add:
   ```
   VITE_API_BASE_URL = https://your-backend.railway.app/api
   VITE_APP_NAME    = Your LMS Name
   VITE_APP_ENV     = production
   ```
4. Deploy — Vercel handles everything automatically

### Option B — GitHub Actions Auto-deploy

Add these secrets to your GitHub repo (**Settings → Secrets → Actions**):

| Secret | Where to find it |
|--------|-----------------|
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens → Create Token |
| `VERCEL_ORG_ID` | Run `vercel link` locally → check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Run `vercel link` locally → check `.vercel/project.json` |
| `VITE_API_BASE_URL` | Your Railway backend URL |
| `VITE_APP_NAME` | Display name for the client |

Every push to `main` will:
1. Build and validate the Vite bundle
2. Deploy to Vercel production (only if build passes)

### Getting Vercel IDs

```bash
# Install Vercel CLI
npm install -g vercel

# Link to your Vercel project (run inside the frontend/ directory)
vercel link

# This creates .vercel/project.json with orgId and projectId
cat .vercel/project.json
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `localhost:3001` |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── constants/      # App-wide constants
│   ├── context/        # React Context providers (AuthContext)
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Page shells (AdminLayout, StudentLayout, InstructorLayout)
│   ├── pages/          # Role-based page views (admin/, instructor/, student/)
│   ├── services/       # API service layer (Axios)
│   ├── utils/          # Helper functions
│   ├── App.jsx         # Root component + routes
│   └── main.jsx        # DOM entry point
├── .env.example        # Environment variable reference
├── vercel.json         # Vercel deployment + security headers config
└── vite.config.js      # Vite configuration
```

---

## User Roles

| Role | Access |
|------|--------|
| **Admin** | Full platform management dashboard |
| **Instructor** | Course authoring, assessment management, grading |
| **Student** | Course consumption, assessments, progress tracking, certificates |
