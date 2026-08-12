import { useEffect, useState } from 'react'
import { Check, ImageOff, Loader2 } from 'lucide-react'
import { fetchWikiThumb, searchWikiThumb } from '../lib/wiki'

interface Props {
  name: string
  wiki: string
  hint?: string
  selected?: boolean
  onChoose: (photoUrl?: string) => void
}

export function ActorCard({ name, wiki, hint, selected, onChoose }: Props) {
  const [photo, setPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setPhoto(null)
    ;(async () => {
      let url = wiki ? await fetchWikiThumb(wiki) : null
      if (!url) {
        const found = await searchWikiThumb(name)
        url = found.photoUrl
      }
      if (!cancelled) {
        setPhoto(url)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [name, wiki])

  return (
    <article
      className={`flex w-[220px] shrink-0 flex-col overflow-hidden rounded-2xl border bg-paper-card shadow-card transition dark:border-white/10 dark:bg-white/5 ${
        selected ? 'border-chosen ring-2 ring-chosen/40' : 'border-black/5'
      }`}
      data-testid={`card-actor-${name}`}
    >
      <div className="relative aspect-[3/4] bg-paper-sunk dark:bg-white/10">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-ink-faint">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {!loading && photo && (
          <img src={photo} alt={name} className="h-full w-full object-cover object-top" loading="lazy" />
        )}
        {!loading && !photo && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-faint">
            <ImageOff className="h-8 w-8" />
            <span className="font-mono text-2xl font-semibold uppercase tracking-wide">
              {name
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0])
                .join('')}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug" title={name}>
          {name}
        </h3>
        {hint && <p className="line-clamp-2 text-xs text-ink-muted dark:text-white/50">{hint}</p>}
        <button
          type="button"
          onClick={() => onChoose(photo || undefined)}
          className={`mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
            selected
              ? 'bg-chosen text-white'
              : 'bg-ink text-paper hover:bg-ink/90 dark:bg-white dark:text-ink'
          }`}
          data-testid={`button-choose-${name}`}
        >
          {selected ? (
            <>
              <Check className="h-4 w-4" /> Chosen
            </>
          ) : (
            'Choose'
          )}
        </button>
      </div>
    </article>
  )
}
