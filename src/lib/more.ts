export interface MoreActor {
  name: string
  wiki: string
  hint: string
}

export async function fetchMoreActors(params: {
  initial: string
  category: string
  exclude: string[]
}): Promise<MoreActor[]> {
  const res = await fetch('/api/more', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `API error ${res.status}`)
  }
  const data = (await res.json()) as { actors?: MoreActor[] }
  return data.actors ?? []
}
