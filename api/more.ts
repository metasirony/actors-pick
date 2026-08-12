import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Vercel serverless function.
 * Set GEMINI_API_KEY in Vercel Project → Settings → Environment Variables.
 * Key never ships to the browser.
 */

const SYSTEM = `You help with the Mandarin Blueprint Hanzi Movie Method.
Suggest famous actors, celebrities, historical figures, or fictional characters
whose name OR well-known role/alias sounds like the given pinyin initial.
Phonetic match beats spelling. Prefer globally famous names.
Return ONLY valid JSON array, no markdown:
[{"name":"...","wiki":"English Wikipedia page title","hint":"short phonetic link"}]
Category rules:
- male: real men or live-action male roles
- female: real women or live-action female roles
- fictional: anime/cartoon/game/myth characters (not real celebrities)
- wildcard: anything memorable
Never suggest names in the exclude list. Give 10 fresh suggestions.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const key = process.env.GEMINI_API_KEY
  if (!key) {
    res.status(503).json({
      error:
        'GEMINI_API_KEY is not set. Add it in Vercel → Project Settings → Environment Variables, then redeploy.',
    })
    return
  }

  const { initial, category, exclude = [] } = (req.body || {}) as {
    initial?: string
    category?: string
    exclude?: string[]
  }

  if (!initial || !category) {
    res.status(400).json({ error: 'initial and category required' })
    return
  }

  const userPrompt = `Initial: "${initial}"
Category: ${category}
Already shown (do not repeat): ${exclude.slice(0, 80).join(', ') || '(none)'}
Suggest 10 new options.`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`
    const gRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: SYSTEM + '\n\n' + userPrompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!gRes.ok) {
      const t = await gRes.text()
      res.status(502).json({ error: `Gemini error: ${gRes.status} ${t.slice(0, 200)}` })
      return
    }

    const gData = (await gRes.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const text = gData.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      const m = text.match(/\[[\s\S]*\]/)
      parsed = m ? JSON.parse(m[0]) : []
    }

    const arr = Array.isArray(parsed) ? parsed : (parsed as { actors?: unknown[] }).actors || []
    const excludeSet = new Set(exclude.map((e) => e.toLowerCase()))
    const actors = (arr as { name?: string; wiki?: string; hint?: string }[])
      .filter((a) => a?.name && !excludeSet.has(String(a.name).toLowerCase()))
      .map((a) => ({
        name: String(a.name),
        wiki: String(a.wiki || a.name),
        hint: String(a.hint || ''),
      }))
      .slice(0, 12)

    res.status(200).json({ actors })
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' })
  }
}
