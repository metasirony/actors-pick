import { useEffect, useRef, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { resolveActorPhoto } from '../lib/wiki'

interface Props {
  name: string
  wiki: string
  hint?: string
  selected?: boolean
  /** Keep card even without Wikipedia portrait (custom entries only). */
  keepWithoutPhoto?: boolean
  onChoose: (photoUrl?: string) => void
}

export function ActorCard({
  name,
  wiki,
  hint,
  selected,
  keepWithoutPhoto,
  onChoose,
}: Props) {
  const [photo, setPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [gone, setGone] = useState(false)
  const reqId = useRef(0)

  useEffect(() => {
    const id = ++reqId.current
    setLoading(true)
    setPhoto(null)
    setGone(false)
    ;(async () => {
      const { photoUrl } = await resolveActorPhoto(name, wiki)
      if (reqId.current !== id) return
      if (!photoUrl && !keepWithoutPhoto) {
        setGone(true)
        setLoading(false)
        return
      }
      setPhoto(photoUrl)
      setLoading(false)
    })()
  }, [name, wiki, keepWithoutPhoto])

  if (gone) return null

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
          <img
            src={photo}
            alt={name}
            className="h-full w-full object-cover object-top"
            loading="lazy"
            onError={() => {
              if (!keepWithoutPhoto) setGone(true)
              else setPhoto(null)
            }}
          />
        )}
        {!loading && !photo && keepWithoutPhoto && (
          <div className="absolute inset-0 flex items-center justify-center text-ink-faint">
            <span className="font-mono text-2xl font-semibold uppercase">
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
        {hint && (
          <p className="line-clamp-2 text-xs text-ink-muted dark:text-white/50">{hint}</p>
        )}
        <button
          type="button"
          onClick={() => onChoose(photo || undefined)}
          disabled={loading || (!photo && !keepWithoutPhoto)}
          className={`mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:opacity-40 ${
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
