# HMM Actors

Personal picker for **Mandarin Blueprint Hanzi Movie Method** actors (55 pinyin initials).

## Features

- 4 category columns (Male / Female / Fictional / Wildcard) + frequency sort view
- ~15 curated suggestions per initial with Wikimedia photos
- **Choose** locks one actor per initial (localStorage)
- **Custom** name + **More** (Gemini via Vercel serverless — key stays on server)
- Export / import JSON for backup or Anki prep

## Local dev

```bash
npm install
npm run dev
```

`More` only works after deploy with `GEMINI_API_KEY`, or with `vercel dev`.

## Deploy on Vercel

1. Push this folder to GitHub (or use Vercel CLI).
2. **New Project** → import repo → Framework: Vite.
3. Project **Settings → Environment Variables**:
   - Name: `GEMINI_API_KEY`
   - Value: your key from [Google AI Studio](https://aistudio.google.com/apikey)
4. Deploy.

The serverless function lives at `api/more.ts`. The browser never sees the key.

### CLI alternative

```bash
npm i -g vercel
vercel
vercel env add GEMINI_API_KEY
vercel --prod
```

## API note (Gemini vs OpenAI)

- Mandarin Blueprint’s custom GPT **cannot** be called via OpenAI API.
- Gemini Flash free tier is a good fit for “More” suggestions.
- Key must live in Vercel env (not in frontend code / localStorage).

## Stack

Vite + React + TypeScript + Tailwind · Vercel Serverless · Wikimedia REST API
