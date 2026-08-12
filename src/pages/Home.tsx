import { CATEGORIES, allInitials, type CategoryId } from '../data/meta'
import { InitialChip } from '../components/InitialChip'
import type { Assignment } from '../lib/storage'

interface Props {
  view: 'categories' | 'frequency'
  assignments: Record<string, Assignment>
  onPick: (initial: string) => void
}

const headerAccent: Record<CategoryId, string> = {
  male: 'bg-male text-white',
  female: 'bg-female text-white',
  fictional: 'bg-fictional text-white',
  wildcard: 'bg-wildcard text-white',
}

export function Home({ view, assignments, onPick }: Props) {
  const done = Object.keys(assignments).length
  const total = 55

  if (view === 'frequency') {
    const sorted = allInitials().sort((a, b) => b.frequency - a.frequency)
    return (
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-4">
        <Progress done={done} total={total} />
        <p className="mb-4 text-sm text-ink-muted dark:text-white/50">
          Sorted by character frequency in The Blueprint (high → low). Assign memorable actors to common initials first.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {sorted.map((init) => (
            <InitialChip
              key={init.id}
              id={init.id}
              display={init.display}
              category={init.category}
              frequency={init.frequency}
              assignment={assignments[init.id]}
              showFreq
              onClick={() => onPick(init.id)}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-4">
      <Progress done={done} total={total} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <section key={cat.id} className={`cat-${cat.id}`} data-testid={`column-${cat.id}`}>
            <header
              className={`mb-3 flex items-center justify-between rounded-2xl px-3 py-2.5 ${headerAccent[cat.id]}`}
            >
              <div>
                <h2 className="text-sm font-bold tracking-wide">{cat.label}</h2>
                <p className="text-[11px] opacity-90">{cat.blurb}</p>
              </div>
              <span className="rounded-full bg-white/20 px-2 py-0.5 font-mono text-xs">
                {cat.initials.filter((i) => assignments[i]).length}/{cat.initials.length}
              </span>
            </header>
            <div className="flex flex-col gap-2">
              {cat.initials.map((id) => (
                <InitialChip
                  key={id}
                  id={id}
                  display={id === 'ø' ? 'ø' : id}
                  category={cat.id}
                  frequency={undefined}
                  assignment={assignments[id]}
                  onClick={() => onPick(id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function Progress({ done, total }: { done: number; total: number }) {
  const pct = Math.round((done / total) * 100)
  return (
    <div className="mb-6 rounded-2xl border border-black/5 bg-paper-card p-4 shadow-card dark:border-white/10 dark:bg-white/5">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-white/50">
            Progress
          </p>
          <p className="font-display text-xl font-semibold" data-testid="text-progress">
            {done} / {total} actors locked
          </p>
        </div>
        <span className="font-mono text-sm text-ink-muted">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-paper-sunk dark:bg-white/10">
        <div
          className="h-full rounded-full bg-chosen transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
