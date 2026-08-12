import type { CategoryId } from '../data/meta'
import type { Assignment } from '../lib/storage'

const catBorder: Record<CategoryId, string> = {
  male: 'border-male/30 hover:border-male hover:bg-male-soft/60',
  female: 'border-female/30 hover:border-female hover:bg-female-soft/60',
  fictional: 'border-fictional/30 hover:border-fictional hover:bg-fictional-soft/60',
  wildcard: 'border-wildcard/30 hover:border-wildcard hover:bg-wildcard-soft/60',
}

const catText: Record<CategoryId, string> = {
  male: 'text-male-dark dark:text-male',
  female: 'text-female-dark dark:text-female',
  fictional: 'text-fictional-dark dark:text-fictional',
  wildcard: 'text-wildcard-dark dark:text-wildcard',
}

interface Props {
  id: string
  display: string
  category: CategoryId
  frequency?: number
  assignment?: Assignment
  showFreq?: boolean
  onClick: () => void
}

export function InitialChip({
  id,
  display,
  category,
  frequency,
  assignment,
  showFreq,
  onClick,
}: Props) {
  const chosen = Boolean(assignment)
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`chip-initial-${id}`}
      title={assignment ? `${display} → ${assignment.name}` : `Pick actor for ${display}`}
      className={`group relative w-full rounded-xl border px-2.5 py-2 text-left transition ${
        chosen
          ? 'border-chosen/50 bg-chosen-soft shadow-sm dark:bg-chosen/20'
          : `bg-paper-card dark:bg-white/5 ${catBorder[category]}`
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={`font-mono text-base font-bold tracking-tight ${
            chosen ? 'text-chosen dark:text-green-300' : catText[category]
          }`}
        >
          {display}
        </span>
        {showFreq && typeof frequency === 'number' && (
          <span className="font-mono text-[10px] text-ink-faint">{frequency}</span>
        )}
      </div>
      {assignment && (
        <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-ink-muted dark:text-white/60">
          {assignment.name}
        </p>
      )}
    </button>
  )
}
