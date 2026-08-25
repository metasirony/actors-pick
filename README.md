# HMM Actors

Personal picker for **Mandarin Blueprint Hanzi Movie Method** actors (55 pinyin initials).

## Features

- 4 category columns (Male / Female / Fictional / Wildcard) + frequency sort view
- ~15 curated suggestions per initial with Wikimedia photos
- **Choose** locks one actor per initial (localStorage)
- **Custom** name + **More** (Gemini via Vercel serverless — key stays on server)
- Export / import JSON for backup or Anki prep

## Deploy on Vercel

1. Push this folder to GitHub (or use Vercel CLI).
2. **New Project** → import repo → Framework: Vite.
3. Project **Settings → Environment Variables**:
   - Name: `GEMINI_API_KEY`
   - Value: your key from [Google AI Studio](https://aistudio.google.com/apikey)
4. Deploy.

The serverless function lives at `api/more.ts`. The browser never sees the key.

## Stack

Vite + React + TypeScript + Tailwind · Vercel Serverless · Wikimedia REST API
