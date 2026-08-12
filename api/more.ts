import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Vercel serverless — GEMINI_API_KEY in Project Settings (never in client).
 * Model: gemini-3.5-flash-lite
 * Docs: https://ai.google.dev/gemini-api/docs/models
 */

const MODEL = 'gemini-3.5-flash-lite'

const SYSTEM = `You are a casting assistant for the Mandarin Blueprint "Hanzi Movie Method".

GOAL
Suggest 10 options the learner can lock to ONE pinyin initial. Every pick must be
easy to remember as a "movie actor" face for that initial.

PHONETIC RULES (highest priority)
- Match by SOUND, not spelling. First stressed syllable of the common English
  name / stage name must sound like the pinyin initial.
- Multi-syllable initials (yi, bi, wu, zhu, nü, ju…) must match the WHOLE syllable.
- hint = short cue of the sound link, e.g. "Brad — 'buh'", "Scar-lett ~ xi".
- initial "ø" (null): vowel-onset names (A/E/I/O/U) — Oprah, Elon, Iron Man (live-action).

FAME RULES — MAINSTREAM NOW
- Prioritize CURRENT mainstream fame (roughly last ~15 years of pop culture):
  A-list film/TV actors, chart-topping musicians, superstar athletes, mega-streamers
  / global celebrities adults would recognize from a photo TODAY.
- Prefer living people with strong English Wikipedia portrait pages.
- Avoid: obscure supporting cast, niche influencers, one-country-only fame,
  ancient history unless still a household name (e.g. Einstein OK, random kings no).
- Include a MIX: not only film actors — musicians, athletes, hosts, internet-famous
  celebrities are welcome when globally known.
- FRESHNESS for roles: if you use a live-action ROLE, pick ones from recent /
  still-iconic franchises (MCU, recent Bond, Dune, Wednesday, Squid Game, etc.),
  not dusty deep-cut characters few people under 40 know.

CATEGORY RULES (strict)

male
- REAL MEN (actors, musicians, athletes, celebs) are the default and preferred.
- Live-action male ROLES allowed only if the role is more memorable than the
  actor AND it is clearly live-action (MCU, Bond, etc.).
- When using a role, DISAMBIGUATE in name:
  prefer "Henry Cavill as Superman" or just the actor "Henry Cavill",
  NEVER bare "Superman" / "Batman" / "Spider-Man" (those are ambiguous —
  comic, cartoon, AND live-action).
- NO pure cartoon / anime / game-only characters. No Muppets. No CGI-only mascots.

female
- Same as male but for women / live-action female roles.
- Prefer real women (Taylor Swift, Zendaya, Margot Robbie, etc.).
- Roles: "Gal Gadot as Wonder Woman" or "Gal Gadot" — not bare "Wonder Woman".
- NO anime-only / cartoon-only characters.

fictional  ← ANIME-FIRST
- DEFAULT to ANIME (and close cousins: manga, popular Japanese game characters
  with a clear face). Roughly 7–8 of 10 should be anime/manga.
- Fill the rest with globally famous cartoons, games, or comics IF needed.
- Must be FICTIONAL characters, not real celebrities.
- Prefer faces with a well-known design (Goku, Luffy, Gojo, Mikasa, Pikachu…).
- Do NOT return real actors here.

wildcard
- Anything memorable with a strong phonetic link (real OR fictional).
- Still prefer mainstream recognizability.

DISAMBIGUATION (critical)
Characters that exist as BOTH actor-roles AND cartoons (Superman, Batman, Spider-Man,
Elsa, Barbie, Sonic…) must NEVER appear as a bare name in male/female.
- male/female → real person, or "Actor as Role"
- fictional → the animated/anime/game version, and put that in wiki title if possible
  (e.g. "Spider-Man (Insomniac Games)" or anime title)

NAME + WIKI
- name: common English billing the learner would recognize
- wiki: exact English Wikipedia page title that has a PORTRAIT/thumbnail
  (actor page, not a disambiguation page, not a film title)
- Never invent people. Never repeat the exclude list (case-insensitive).

OUTPUT
Return ONLY a JSON array of exactly 10 objects (no markdown):
[{"name":"…","wiki":"…","hint":"…"}]`

function categoryBrief(category: string, initial: string): string {
  const map: Record<string, string> = {
    male: `CATEGORY=male. Prefer REAL mainstream men (actors/musicians/athletes/celebs of today). Live-action roles only if disambiguated as "Actor as Role". NO anime/cartoon-only. Initial "${initial}".`,
    female: `CATEGORY=female. Prefer REAL mainstream women celebs of today. Roles only as "Actress as Role". NO anime/cartoon-only. Initial "${initial}".`,
    fictional: `CATEGORY=fictional. ANIME-FIRST (majority anime/manga). Rest: famous cartoon/game. NO real celebrities. Initial "${initial}".`,
    wildcard: `CATEGORY=wildcard. Any memorable mainstream face/character. Initial "${initial}".`,
  }
  return map[category] || `CATEGORY=${category}. Initial "${initial}".`
}

function phoneticGuide(initial: string): string {
  const i = initial.toLowerCase()
  const guides: Record<string, string> = {
    ø: 'Vowel onset: Oprah, Elon, Austin, Idris, Usher, Ethan, Ariana (if cat allows).',
    b: 'buh/bee — Brad, Bad Bunny, Bruno, Billie (female), Bakugo (fictional).',
    p: 'puh — Pedro, Post Malone, Paul, Pikachu (fictional).',
    m: 'muh — Michael B. Jordan, Messi, Morgan, Mikasa (fictional).',
    f: 'fuh — Timothée no; Frank Ocean, Future, Finn, Luffy no — F onset.',
    d: 'duh/dee — Dwayne, Drake, Doja (female), Deku (fictional).',
    t: 'tuh/tee — Timothée, Tom Holland, Travis Kelce, Tanjiro (fictional).',
    n: 'nuh — Noah, Neymar, Nicki (female), Naruto (fictional).',
    l: 'luh/lee — Leonardo, LeBron, Lana (female), Luffy (fictional).',
    z: 'zuh — Zac, Zendaya (female), Zlatan, Zenitsu (fictional).',
    c: 'k/s onset — Cillian, Chris Evans, Conor, Cillian; not random S names.',
    s: 'sss — Sydney Sweeney (female cat), Simu Liu, Sabrina, Saitama (fictional).',
    zh: 'j/zh — Joe Rogan, John Cena, Jack Black, Jotaro (fictional).',
    ch: 'ch — Chris Hemsworth, Charlie Puth, Cho (fictional).',
    sh: 'sh — Shawn Mendes, Shohei Ohtani, Shrek only if fictional cat.',
    r: 'r — Ryan Reynolds, Rihanna (female), Rodrigo, Rengoku (fictional).',
    g: 'guh — Glen Powell, Gordon Ramsay; Goku only if fictional.',
    k: 'kuh — Keanu, Kylian Mbappé, Kendrick; Killua if fictional.',
    h: 'huh — Harry Styles, Henry Cavill, Haaland; Hinata if fictional.',
    yi: 'ee — Zendaya weak; Eva, Emma, Billie no — ee/yi onset: Eve, Ayo Edebiri-ish, Yelena.',
    bi: 'bee — Billie Eilish, Bella Ramsey, Beabadoobee.',
    pi: 'pee — Billie no; P!nk, Phoebe Bridgers, Pikachu if fictional.',
    mi: 'mee — Millie Bobby Brown, Miley, Megan Thee Stallion, Mikasa if fictional.',
    di: 'dee — Dua Lipa, Zendaya no; Sydney no — Dee: Dua, Doja, Daisy Edgar-Jones.',
    ti: 'tee — Taylor Swift, Tyla, Timothée no (male).',
    ni: 'nee — Nicole, Nicki Minaj, Nina, Nezuko (fictional).',
    li: 'lee — Lisa (BLACKPINK), Lily Collins, Lana Del Rey, Luffy no.',
    ji: 'jee — Jenna Ortega, Jennifer Lawrence, Jennie (BLACKPINK).',
    qi: 'chee — Charli XCX, Chloe Grace, Chihiro (fictional).',
    xi: 'shee/xi — Sydney Sweeney, Selena Gomez, Scarlett Johansson, Shinobu (fictional).',
    wu: 'woo — Woody, goofy no; for fictional: Wukong, for male rare — Will leave to model.',
    bu: 'boo — for fictional majority anime with bu/boo.',
    pu: 'poo/pu — Po only fictional; male rare.',
    mu: 'moo — fictional: Muzan; male: maybe Muhammad- onset celebs.',
    fu: 'foo — fictional preferred in u-series.',
    du: 'doo — fictional + male Dua is female.',
    tu: 'too — Tut, Toji (fictional).',
    nu: 'noo — Newt; Nezuko is ni; fictional nu.',
    lu: 'loo — Luffy, Lucy (cyberpunk) for fictional; Luke for male if male cat.',
    zu: 'zoo — Zuko fictional.',
    cu: 'coo — fictional cu.',
    su: 'soo — Sukuna fictional; Susan for female wrong series.',
    zhu: 'joo — Jude, Judi; Jujutsu characters for fictional.',
    chu: 'choo — Cho, Chopper fictional.',
    shu: 'shoo — Shuri live-action role disambiguate; fictional shu.',
    ru: 'roo — Ruby, Rukia (fictional).',
    gu: 'goo — Goku fictional primary for gu series.',
    ku: 'koo — Kurapika, Killua; male: Kylian if k not ku.',
    hu: 'hoo — Goofy no; Hu Tao fictional; Hugh for h not hu.',
    yu: 'yoo — Yuuji, Yumeko fictional; Yuki.',
    nü: 'nyoo/new — Newt, Nüwa myth, "new" onset celebs if wildcard/male careful.',
    lü: 'lyoo — Luffy lyoo-ish weak; prefer Lü/Ly names or anime.',
    ju: 'joo/jyoo — Jungkook, Jenna; Jotaro fictional.',
    qu: 'chyoo — Quinn, Quavo; fictional qu.',
    xu: 'shyoo — Shu, Shohei; fictional xu.',
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
    .slice(0, 120)

  const userPrompt = [
    categoryBrief(category, initial),
    `Pinyin initial: "${initial}"`,
    `Phonetic guide: ${phoneticGuide(initial)}`,
    `Already shown — do not repeat: ${excludeList.join(', ') || '(none)'}`,
    `Return exactly 10 NEW mainstream options as a pure JSON array.`,
    `Each: name, wiki (EN Wikipedia title with a portrait), hint (sound link to "${initial}").`,
    category === 'fictional'
      ? 'Reminder: ANIME-FIRST. No real people.'
      : category === 'male' || category === 'female'
        ? 'Reminder: real celebrities preferred; roles must be "Person as Role"; no bare superhero/cartoon names.'
        : 'Reminder: memorable + phonetic.',
  ].join('\n')

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`
    const gRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!gRes.ok) {
      const t = await gRes.text()
      res.status(502).json({
        error: `Gemini error ${gRes.status} (${MODEL}): ${t.slice(0, 400)}`,
      })
      return
    }

    const gData = (await gRes.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
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
      .filter(
        (a, idx, all) =>
          all.findIndex((b) => b.name.toLowerCase() === a.name.toLowerCase()) === idx,
      )
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

// redeploy trigger 2026-08-12T16:08:38Z
