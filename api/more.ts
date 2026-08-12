import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Vercel serverless — GEMINI_API_KEY in Project Settings (never in client).
 * Model: gemini-3.5-flash-lite (fast / cheap tier for high-throughput).
 * Docs: https://ai.google.dev/gemini-api/docs/models
 */

const MODEL = 'gemini-3.5-flash-lite'

const SYSTEM = `You are a casting assistant for the Mandarin Blueprint "Hanzi Movie Method".

GOAL
Suggest 10 globally famous people or characters the learner can lock to ONE pinyin initial.
Each pick must be easy to remember as a movie "actor" for that initial.

PHONETIC RULES (most important)
- Match by SOUND, not spelling. The first stressed syllable (or a well-known nickname/role) must sound like the pinyin initial.
- Examples of good phonetic links:
  - initial "zh" → Joe Rogan (Joe ~ "joh/zh-ish"), Jackie Chan
  - initial "s" → Sylvester Stallone, Shakira
  - initial "r" → Robert Downey Jr., Rihanna
  - initial "xi" → Scarlett Johansson (Scar- ~ xi-ish), Zendaya is WRONG for xi
  - initial "b" → Brad Pitt, Batman (role OK if category allows)
  - initial "ø" (null/zero initial) → names starting with a vowel sound: Iron Man, Oprah, Elon Musk, Audrey Hepburn
- Prefer the START of the common English name / stage name / iconic role.
- Multi-syllable pinyin (yi, bi, wu, zhu, nü, lü, ju…) should match the WHOLE syllable sound, not just the first letter.
  - "zhu" → Jude Law, Judi Dench, Jupiter (character) — NOT "Zhang" unless the English call-name starts with ju/zhu
  - "nü" / "lü" → names with "new/nyu/nü" or "loo/lü/lu" + ü-ish quality (e.g. Newt Scamander, Luna Lovegood for lu/lü-ish when category fits)
- Write hint as a short English cue: which part of the name sounds like the initial (e.g. "Brad — 'buh'", "Scar-lett ~ xi").

FAME RULES
- Only household names: A-list film/TV, top musicians, iconic athletes, legendary historical figures, or globally known fictional characters.
- Prefer faces most adults would recognize from a photo.
- Avoid obscure YouTubers, minor supporting cast, niche influencers, or names only famous in one small country unless truly international.
- Prefer living or widely depicted people so Wikipedia has a portrait.

CATEGORY RULES (strict — wrong category = invalid)
- male: real men OR live-action male roles/aliases (e.g. Tony Stark, James Bond). No anime-only, no real women.
- female: real women OR live-action female roles/aliases (e.g. Wonder Woman as Gal Gadot OK if you list the actress OR the role consistently). No anime-only, no real men.
- fictional: ONLY anime / cartoon / game / myth / comic characters that are NOT primarily known as real-world celebrities. Do NOT return real actors here.
- wildcard: anything memorable (real or fictional) with a strong phonetic link.

NAME FIELD
- Use the common English billing name the learner would search (e.g. "Robert Downey Jr.", "Scarlet Witch" only if fictional category).
- Roles/aliases allowed when they are more memorable than the legal name, but do not assign the same real person under many different initials in one batch.
- wiki: exact English Wikipedia page title if you know it; else the same as name.
- Never invent nonsense names.

OUTPUT
Return ONLY a JSON array of exactly 10 objects (no markdown fences, no commentary):
[{"name":"…","wiki":"…","hint":"…"}]

Never include anyone from the exclude list (case-insensitive). Prefer variety (mix actors, musicians, athletes, iconic roles) while staying in-category.`

function categoryBrief(category: string, initial: string): string {
  const map: Record<string, string> = {
    male: `CATEGORY = male → only real men or live-action male heroes/roles. Initial "${initial}".`,
    female: `CATEGORY = female → only real women or live-action female heroes/roles. Initial "${initial}".`,
    fictional: `CATEGORY = fictional → only anime/cartoon/game/myth/comic characters (not real celebrities). Initial "${initial}".`,
    wildcard: `CATEGORY = wildcard → any memorable face/character. Initial "${initial}".`,
  }
  return map[category] || `CATEGORY = ${category}. Initial "${initial}".`
}

function phoneticGuide(initial: string): string {
  const i = initial.toLowerCase()
  const guides: Record<string, string> = {
    ø: 'Null initial: vowel-onset names (A/E/I/O/U sounds) — Oprah, Iron Man, Elon, Audrey, Ethan.',
    b: 'buh/bee — Brad, Bruce, Ben, Beyoncé (if female cat), Batman.',
    p: 'puh/pee — Peter, Paul, Penelope, Pikachu (fictional).',
    m: 'muh/mee — Michael, Morgan, Meryl, Mario.',
    f: 'fuh — Frank, Ford, Fiona, Frodo.',
    d: 'duh/dee — Daniel, Dwayne, Diana, Dory.',
    t: 'tuh/tee — Tom, Tony Stark, Taylor, Thor.',
    n: 'nuh/nee — Nick, Neo, Natalie, Nemo.',
    l: 'luh/lee — Leonardo, Liam, Luna, Link.',
    z: 'dz/zuh — Zac, Zendaya (female), Zorro.',
    c: 'ts-ish / suh-adjacent — Cesar, Cillian, Cinderella; favor "ts/c" onset.',
    s: 'sss — Sam, Stallone, Scarlett only if s-onset is clear; Shakira, Sonic.',
    zh: 'j/zh — Joe, Jude, Jackie, George (soft j), Jarvis.',
    ch: 'ch — Charlie, Chris, Chuck, Chewbacca.',
    sh: 'sh — Shawn, Shakira, Sherlock, Shrek.',
    r: 'r — Robert, Ryan, Rihanna, Rocky.',
    g: 'guh — George, Gandalf, Goku (fictional).',
    k: 'kuh — Keanu, Kevin, Katniss, Kirby.',
    h: 'huh — Harry, Hugh, Hermione, Hulk.',
    yi: 'ee / yi — Ian, Yelena, Eevee, Yoda-ish "ee"; NOT random Y unless ee-glide.',
    bi: 'bee — Beatrice, Beyoncé, Beast, BB-8-ish only if "bee".',
    pi: 'pee — Peter Parker short Pee?, Pink, Pikachu, Peach.',
    mi: 'mee — Mila, Michelle, Minnie, Mario "mi".',
    di: 'dee — Diana, Dicaprio as Dee?, Dory, Dio.',
    ti: 'tee — Tilda, Timothée, Tinker Bell, Teemo.',
    ni: 'nee — Nicole, Neo, Nia, Nemo.',
    li: 'lee — Lisa, Leonardo short Lee, Link, Elsa no; prefer Lee/Li onset.',
    ji: 'jee — Gina only if jee; Jean, Gigi, Giyu (fictional), Jesus in some accents — prefer clear "jee".',
    qi: 'chee — Chiara, Cheadle, Chi-Chi, Q from Bond is weak; prefer chee/qi onset.',
    xi: 'shee/see/xi — Scarlett (Scar~), She-Hulk, Ciri, C-3PO weak; favor shee/xi.',
    wu: 'woo — Woody, Wolverine, Wukong, Ursula no.',
    bu: 'boo — Bruce "Boo"?, Buzz, Boo (Monsters), Buddha.',
    pu: 'poo/pu — Po (Kung Fu Panda), Pumbaa, Putin only if male+famous — prefer Po/Pu.',
    mu: 'moo — Mulan, Moana, Mufasa, Muhammad Ali.',
    fu: 'foo — Fox, Fury, Fù characters; Foo Fighters only as brand-weak — prefer Foo/Fu onset names.',
    du: 'doo — Dumbledore, Doom, Dua (female), Dude.',
    tu: "too — TChalla weak; prefer Toad, Tutankhamun, Two-Face.",
    nu: 'noo — Newt, No-Face, Nutella no; Newt Scamander, Noa.',
    lu: 'loo — Luke, Luna, Luigi, Luffy.',
    zu: 'zoo/dzu — Zeus, Zuko, Zooey.',
    cu: 'tsoo/coo — Cooper, Cupid, Coolio.',
    su: 'soo — Susan, Superman, Sulu, Suzy.',
    zhu: 'joo/jew — Jude, Judi, Jupiter, Zuko weaker; Jude Law, Judy Hopps.',
    chu: 'choo — Cho Chang, Chewbacca, Chuck.',
    shu: 'shoo — Shuri, Shohei, Shrek "sh", Shu characters.',
    ru: 'roo — Ruby, Ruth, Rubeus, Groot "roo" weak — Ruby Rose, Robin Hood roo?.',
    gu: 'goo — Goku, Goofy, Goodall.',
    ku: 'koo — Coolio, Kratos, Cookie Monster, Kujo.',
    hu: 'hoo — Hulk, Hook, Whoopi (hu/hoo), Hugh.',
    yu: 'yoo — Yuki, Yoda "yo", Ursula no; Yuri, Yuh- names, YouTube mascots.',
    nü: 'nyoo/nü — Newt, Nuclear- nicknames, Nüwa (myth), "new" onset.',
    lü: 'lyoo/lü — Luke weak; prefer Lou/Lü/Ly — Lyanna, Lucius, Luffy lyoo-ish carefully.',
    ju: 'jyoo/joo — Jude, Judi, Jupiter, Jinx.',
    qu: 'chyoo/qyu — Q from Bond, Quinn, Cupid chyoo?, Quorra.',
    xu: 'shyoo/syu — Shohei, Shu, Susan weak; prefer Shu/Xu onset or "shoe".',
  }
  return guides[i] || `Match English onset to pinyin "${initial}" by ear.`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const key = process.env.GEMINI_API_KEY
  if (!key) {
    res.status(503).json({
      error:
        'GEMINI_API_KEY is not set. Add it for Production + Preview in Vercel → Settings → Environment Variables, then Redeploy.',
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

  const excludeList = (Array.isArray(exclude) ? exclude : [])
    .map((e) => String(e).trim())
    .filter(Boolean)
    .slice(0, 100)

  const userPrompt = [
    categoryBrief(category, initial),
    `Pinyin initial to cast: "${initial}"`,
    `Phonetic guide: ${phoneticGuide(initial)}`,
    `Already shown — DO NOT repeat (any spelling): ${excludeList.join(', ') || '(none)'}`,
    `Return exactly 10 NEW globally famous options as a pure JSON array.`,
    `Each object: name (billing name), wiki (EN Wikipedia title), hint (how it sounds like "${initial}").`,
  ].join('\n')

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`
    const gRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM }],
        },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.75,
          topP: 0.9,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!gRes.ok) {
      const t = await gRes.text()
      // common: 404 = model id wrong/unavailable on this key; 429 = quota
      res.status(502).json({
        error: `Gemini error ${gRes.status} (${MODEL}): ${t.slice(0, 400)}`,
      })
      return
    }

    const gData = (await gRes.json()) as {
      candidates?: {
        content?: { parts?: { text?: string }[] }
        finishReason?: string
      }[]
      error?: { message?: string }
    }

    if (gData.error?.message) {
      res.status(502).json({ error: `Gemini: ${gData.error.message}` })
      return
    }

    const text = gData.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      const m = text.match(/\[[\s\S]*\]/)
      try {
        parsed = m ? JSON.parse(m[0]) : []
      } catch {
        parsed = []
      }
    }

    const arr = Array.isArray(parsed)
      ? parsed
      : (parsed as { actors?: unknown[] }).actors ||
        (parsed as { suggestions?: unknown[] }).suggestions ||
        []

    const excludeSet = new Set(excludeList.map((e) => e.toLowerCase()))
    const actors = (arr as { name?: string; wiki?: string; hint?: string }[])
      .filter((a) => a?.name && !excludeSet.has(String(a.name).toLowerCase()))
      .map((a) => ({
        name: String(a.name).trim(),
        wiki: String(a.wiki || a.name).trim(),
        hint: String(a.hint || '').trim(),
      }))
      .filter((a) => a.name.length > 1)
      // de-dupe within batch
      .filter((a, idx, all) => all.findIndex((b) => b.name.toLowerCase() === a.name.toLowerCase()) === idx)
      .slice(0, 12)

    if (actors.length === 0) {
      res.status(502).json({
        error: 'Model returned no usable suggestions. Try More again.',
      })
      return
    }

    res.status(200).json({ actors, model: MODEL })
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' })
  }
}
