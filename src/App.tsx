import { useEffect, useState } from 'react'
import { Clapperboard, Download, LayoutGrid, Moon, SortDesc, Sun, Upload } from 'lucide-react'
import { Home } from './pages/Home'
import { Picker } from './pages/Picker'
import {
  type Assignment,
  clearAssignment,
  exportAssignmentsJson,
  importAssignmentsJson,
  loadAssignments,
  saveAssignment,
} from './lib/storage'

type ViewMode = 'categories' | 'frequency'
type Screen = { name: 'home' } | { name: 'picker'; initial: string }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [view, setView] = useState<ViewMode>('categories')
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({})
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setAssignments(loadAssignments())
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(prefersDark)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const onChoose = (a: Assignment) => {
    setAssignments(saveAssignment(a))
  }

  const onClear = (initial: string) => {
    setAssignments(clearAssignment(initial))
  }

  const onExport = () => {
    const blob = new Blob([exportAssignmentsJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hmm-actors.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const text = await file.text()
      setAssignments(importAssignmentsJson(text))
    }
    input.click()
  }

  return (
    <div className="min-h-screen text-ink dark:text-[#ebe7e0]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-paper/85 backdrop-blur-md dark:border-white/10 dark:bg-[#12110f]/85">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-paper dark:bg-white dark:text-ink">
              <Clapperboard className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold leading-tight tracking-tight">
                HMM Actors
              </h1>
              <p className="text-[11px] text-ink-muted dark:text-white/45">
                Hanzi Movie Method · 55 initials
              </p>
            </div>
          </div>

          {screen.name === 'home' && (
            <div className="ml-2 flex rounded-xl border border-black/10 bg-paper-card p-0.5 dark:border-white/10 dark:bg-white/5">
              <ToggleBtn
                active={view === 'categories'}
                onClick={() => setView('categories')}
                testId="toggle-categories"
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Categories
              </ToggleBtn>
              <ToggleBtn
                active={view === 'frequency'}
                onClick={() => setView('frequency')}
                testId="toggle-frequency"
              >
                <SortDesc className="h-3.5 w-3.5" /> Frequency
              </ToggleBtn>
            </div>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <IconBtn onClick={onExport} label="Export JSON" testId="button-export">
              <Download className="h-4 w-4" />
            </IconBtn>
            <IconBtn onClick={onImport} label="Import JSON" testId="button-import">
              <Upload className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              onClick={() => setDark((d) => !d)}
              label={dark ? 'Light mode' : 'Dark mode'}
              testId="button-theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </IconBtn>
          </div>
        </div>
      </header>

      {screen.name === 'home' ? (
        <Home
          view={view}
          assignments={assignments}
          onPick={(initial) => setScreen({ name: 'picker', initial })}
        />
      ) : (
        <Picker
          initialId={screen.initial}
          assignment={assignments[screen.initial]}
          onBack={() => setScreen({ name: 'home' })}
          onChoose={onChoose}
          onClear={() => onClear(screen.initial)}
        />
      )}
    </div>
  )
}

function ToggleBtn({
  active,
  onClick,
  children,
  testId,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  testId: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`inline-flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-xs font-semibold transition ${
        active
          ? 'bg-ink text-paper dark:bg-white dark:text-ink'
          : 'text-ink-muted hover:text-ink dark:text-white/50 dark:hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function IconBtn({
  onClick,
  label,
  children,
  testId,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
  testId: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      data-testid={testId}
      className="rounded-xl border border-black/10 bg-paper-card p-2 text-ink-muted transition hover:text-ink dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:text-white"
    >
      {children}
    </button>
  )
}
