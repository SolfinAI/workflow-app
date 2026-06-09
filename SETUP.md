# WorkFlow Pro — Setup Guide

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## Cross-Device Sync with Supabase (required for iPhone/iPad sync)

### 1. Create a Supabase project
1. Go to https://supabase.com and create a free account
2. Create a new project (free tier is fine)
3. Go to **Project Settings → API**
4. Copy your **Project URL** and **anon public** key

### 2. Create a `.env` file in this folder
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run the database schema
Open the **SQL Editor** in your Supabase project and run the SQL shown in the app's Settings page (or from `schema.sql`).

### 4. Restart the dev server
```bash
npm run dev
```

---

## Deploy to Vercel (free — required for iPhone install)

1. Push this folder to a GitHub repo
2. Go to https://vercel.com and import your GitHub repo
3. Add your Supabase environment variables in Vercel's project settings
4. Deploy — you'll get a URL like `https://your-app.vercel.app`

---

## Install on iPhone / iPad

1. Open your Vercel URL in **Safari** (must be Safari, not Chrome)
2. Tap the **Share** button (square with arrow pointing up)
3. Tap **"Add to Home Screen"**
4. Tap **Add** — the app installs like a native app

The app works offline and syncs automatically when back online.

---

## Project Structure

```
src/
  components/     UI components
  pages/          Dashboard, Projects, ProjectDetail, Settings
  lib/            Supabase client, storage layer, workflow templates
  hooks/          useProjects hook
  types/          TypeScript types
```
