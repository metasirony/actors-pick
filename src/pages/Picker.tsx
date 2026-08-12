import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Plus, Sparkles, UserPlus, X } from 'lucide-react'
import { getInitialMeta, CATEGORIES } from '../data/meta'
import { getActors } from '../data/actors'
import { ActorCard } from '../components/ActorCard'
import { fetchMoreActors } from '../lib/more'
import type { Assignment } from '../lib/storage'
import { searchWikiThumb } from '../lib/wiki'

interface Props {
  initialId: string
  assignment?: Assignment
  onBack: () => void
  onChoose: (a: Assignment) => void
  onClear: () => void
}

interface CardItem {
  name: string
  wiki: string
  hint: string
  custom?: boolean
}

const catLabel: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  fictional: 'Fictional',
  wildcard: 'Wildcard',
}

const catPill: Record<string, string> = {
  male: 'bg-male-soft text-male-dark dark:bg-male/20 dark:text-male',
  female: 'bg-female-soft text-female-dark dark:bg-female/20 dark:text-female',
  fictional: 'bg-fictional-soft text-fictional-dark dark:bg-fictional/20 dark:text-fictional',
  wildcard: 'bg-wildcard-soft text-wildcard-dark dark:bg-wildcard/20 dark:text-wildcard',
}

export function Picker({ initialId, assignment, onBack, onChoose, onClear }: Props) {
  const meta = getInitialMeta(initialId)
  const base = useMemo(() => getActors(initialId), [initialId])
  const [extra, setExtra] = useState<CardItem[]>([])
  const [moreLoading, setMoreLoading] = useState(false)
  const [moreError, setMoreError] = useState<string | null>(null)
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customBusy, setCustomBusy] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  const cards: CardItem[] = useMemo(() => {
    const map = new Map<string, CardItem>()
    for (const a of base) map.set(a.name.toLowerCase(), a)
    for (const a of extra) map.set(a.name.toLowerCase(), a)
    return Array.from(map.values())
  }, [base, extra])

  const scrollBy = (dir: number) => {
    scroller.current?.scrollBy({ left: dir * 240, behavior: 'smooth' })
  }

  const handleChoose = (item: CardItem, photoUrl?: string) => {
    onChoose({
      initial: initialId,
      name: item.name,
      wiki: item.wiki,
      photoUrl,
      hint: item.hint,
      custom: item.custom,
      chosenAt: new Date().toISOString(),
    })
  }

  const handleMore = async () => {
    setMoreLoading(true)
    setMoreError(null)
    try {
      const exclude = cards.map((c) => c.name)
      const more = await fetchMoreActors({
        initial: initialId,
        category: meta.category,
        exclude,
      })
      if (!more.length) {
        setMoreError('No new suggestions returned. Try again or add a custom name.')
      } else {
        setExtra((prev) => [...prev, ...more])
        requestAnimationFrame(() => {
          scroller.current?.scrollTo({ left: scroller.current.scrollWidth, behavior: 'smooth' })
        })
      }
    } catch (e) {
      setMoreError(e instanceof Error ? e.message : 'Failed to load more')
    } finally {
      setMoreLoading(false)
    }
  }

  const handleCustom = async () => {
    const name = customName.trim()
    if (!name) return
    setCustomBusy(true)
    try {
      const found = await searchWikiThumb(name)
      const item: CardItem = {
        name,
        wiki: found.wiki || name,
        hint: 'custom',
        custom: true,
      }
      setExtra((prev) => [...prev, item])
      onChoose({
        initial: initialId,
        name: item.name,
        wiki: item.wiki,
        photoUrl: found.photoUrl || undefined,
        hint: item.hint,
        custom: true,
        chosenAt: new Date().toISOString(),
      })
      setShowCustom(false)
      setCustomName('')
    } finally {
      setCustomBusy(false)
    }
  }

  const catInfo = CATEGORIES.find((c) => c.id === meta.category)

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col px-4 pb-10 pt-4">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-paper-card px-3 py-2 text-sm font-medium shadow-sm transition hover:bg-paper-sunk dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-ink px-3 py-1.5 font-mono text-lg font-bold text-paper dark:bg-white dark:text-ink">
            {meta.display}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${catPill[meta.category]}`}>
            {catLabel[meta.category]}
          </span>
          <span className="hidden text-xs text-ink-muted sm:inline dark:text-white/50">
            {meta.frequency} chars in Blueprint · {catInfo?.blurb}
          </span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {assignment && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 rounded-xl border border-black/10 px-3 py-2 text-xs font-medium text-ink-muted hover:border-red-300 hover:text-red-600 dark:border-white/10"
              data-testid="button-clear"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowCustom((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-paper-card px-3 py-2 text-sm font-medium shadow-sm dark:border-white/10 dark:bg-white/5"
            data-testid="button-custom"
          >
            <UserPlus className="h-4 w-4" /> Custom
          </button>
          <button
            type="button"
            onClick={handleMore}
            disabled={moreLoading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-paper disabled:opacity-60 dark:bg-white dark:text-ink"
            data-testid="button-more"
          >
            {moreLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            More
          </button>
        </div>
      </div>

      {assignment && (
        <div className="mb-4 rounded-xl border border-chosen/30 bg-chosen-soft px-3 py-2 text-sm dark:bg-chosen/15">
          Locked: <strong>{assignment.name}</strong>
          {assignment.hint ? <span className="text-ink-muted"> · {assignment.hint}</span> : null}
          <span className="text-ink-muted"> — pick another to replace</span>
        </div>
      )}

      {showCustom && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-black/10 bg-paper-card p-3 dark:border-white/10 dark:bg-white/5">
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustom()}
            placeholder="Type a name or role (e.g. Tony Stark)"
            className="min-w-[220px] flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-ink focus:ring-2 dark:border-white/10 dark:bg-black/30"
            data-testid="input-custom-name"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCustom}
            disabled={customBusy || !customName.trim()}
            className="inline-flex items-center gap-1 rounded-xl bg-chosen px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            data-testid="button-custom-save"
          >
            {customBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Save & choose
          </button>
        </div>
      )}

      {moreError && (
        <div className="mb-4 rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          {moreError}
        </div>
      )}

      <div className="relative flex flex-1 items-center gap-2">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => scrollBy(-1)}
          className="hidden shrink-0 rounded-full border border-black/10 bg-paper-card p-2 shadow-sm md:inline-flex dark:border-white/10 dark:bg-white/5"
          data-testid="button-scroll-left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div
          ref={scroller}
          className="scrollbar-thin flex flex-1 gap-4 overflow-x-auto pb-4 pt-1"
          data-testid="row-actors"
        >
          {cards.map((item) => (
            <ActorCard
              key={item.name}
              name={item.name}
              wiki={item.wiki}
              hint={item.hint}
              selected={assignment?.name === item.name}
              keepWithoutPhoto={!!item.custom}
              onChoose={(photoUrl) => handleChoose(item, photoUrl)}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Next"
          onClick={() => scrollBy(1)}
          className="hidden shrink-0 rounded-full border border-black/10 bg-paper-card p-2 shadow-sm md:inline-flex dark:border-white/10 dark:bg-white/5"
          data-testid="button-scroll-right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
