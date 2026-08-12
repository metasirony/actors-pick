const cache = new Map<string, string | null>()

function cleanTitle(title: string): string {
  return title.trim().replace(/_/g, ' ')
}

/** Resolve a Wikimedia thumbnail URL for a Wikipedia page title. */
export async function fetchWikiThumb(wikiTitle: string): Promise<string | null> {
  if (!wikiTitle) return null
  const key = cleanTitle(wikiTitle)
  if (cache.has(key)) return cache.get(key) ?? null

  try {
    const url =
      'https://en.wikipedia.org/api/rest_v1/page/summary/' +
      encodeURIComponent(key.replace(/ /g, '_'))
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) {
      cache.set(key, null)
      return null
    }
    const data = (await res.json()) as {
      type?: string
      thumbnail?: { source?: string }
      originalimage?: { source?: string }
      titles?: { canonical?: string }
    }
    // skip disambiguation / no image
    if (data.type === 'disambiguation') {
      cache.set(key, null)
      return null
    }
    const src = data.thumbnail?.source || data.originalimage?.source || null
    cache.set(key, src)
    return src
  } catch {
    cache.set(key, null)
    return null
  }
}

/** MediaWiki search — prefer pages that actually have a thumbnail. */
export async function searchWikiThumb(
  name: string,
): Promise<{ wiki: string; photoUrl: string | null }> {
  const q = name.trim()
  if (!q) return { wiki: name, photoUrl: null }

  try {
    const api =
      'https://en.wikipedia.org/w/api.php?' +
      new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: q,
        gsrlimit: '5',
        prop: 'pageimages|pageterms',
        piprop: 'thumbnail',
        pithumbsize: '500',
        wbptterms: 'description',
        format: 'json',
        origin: '*',
      })
    const res = await fetch(api)
    if (!res.ok) return { wiki: name, photoUrl: null }
    const data = (await res.json()) as {
      query?: {
        pages?: Record<
          string,
          {
            title?: string
            index?: number
            thumbnail?: { source?: string }
          }
        >
      }
    }
    const pages = data.query?.pages
    if (!pages) return { wiki: name, photoUrl: null }

    const ordered = Object.values(pages).sort(
      (a, b) => (a.index ?? 99) - (b.index ?? 99),
    )
    // Prefer first result that has a thumbnail
    for (const page of ordered) {
      if (page.thumbnail?.source && page.title) {
        cache.set(cleanTitle(page.title), page.thumbnail.source)
        return { wiki: page.title, photoUrl: page.thumbnail.source }
      }
    }
    const first = ordered[0]
    return { wiki: first?.title || name, photoUrl: null }
  } catch {
    return { wiki: name, photoUrl: null }
  }
}

/** Resolve photo for a card: title summary → search fallback. */
export async function resolveActorPhoto(
  name: string,
  wiki: string,
): Promise<{ wiki: string; photoUrl: string | null }> {
  if (wiki) {
    const direct = await fetchWikiThumb(wiki)
    if (direct) return { wiki, photoUrl: direct }
  }
  const found = await searchWikiThumb(name)
  if (found.photoUrl) return found
  if (wiki && wiki !== name) {
    const again = await searchWikiThumb(wiki)
    if (again.photoUrl) return again
  }
  return { wiki: wiki || name, photoUrl: null }
}
