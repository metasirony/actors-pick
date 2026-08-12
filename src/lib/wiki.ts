const cache = new Map<string, string | null>()

/** Resolve a Wikimedia thumbnail URL for a Wikipedia page title. */
export async function fetchWikiThumb(wikiTitle: string): Promise<string | null> {
  if (!wikiTitle) return null
  if (cache.has(wikiTitle)) return cache.get(wikiTitle) ?? null

  try {
    const url =
      'https://en.wikipedia.org/api/rest_v1/page/summary/' +
      encodeURIComponent(wikiTitle.replace(/ /g, '_'))
    const res = await fetch(url)
    if (!res.ok) {
      cache.set(wikiTitle, null)
      return null
    }
    const data = (await res.json()) as {
      thumbnail?: { source?: string }
      originalimage?: { source?: string }
    }
    const src = data.thumbnail?.source || data.originalimage?.source || null
    cache.set(wikiTitle, src)
    return src
  } catch {
    cache.set(wikiTitle, null)
    return null
  }
}

/** Fallback: MediaWiki search for page + thumbnail */
export async function searchWikiThumb(name: string): Promise<{ wiki: string; photoUrl: string | null }> {
  try {
    const api =
      'https://en.wikipedia.org/w/api.php?' +
      new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: name,
        gsrlimit: '1',
        prop: 'pageimages',
        piprop: 'thumbnail',
        pithumbsize: '400',
        format: 'json',
        origin: '*',
      })
    const res = await fetch(api)
    if (!res.ok) return { wiki: name, photoUrl: null }
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { title?: string; thumbnail?: { source?: string } }> }
    }
    const pages = data.query?.pages
    if (!pages) return { wiki: name, photoUrl: null }
    const page = Object.values(pages)[0]
    return {
      wiki: page?.title || name,
      photoUrl: page?.thumbnail?.source || null,
    }
  } catch {
    return { wiki: name, photoUrl: null }
  }
}
