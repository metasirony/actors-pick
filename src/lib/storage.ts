export interface Assignment {
  initial: string
  name: string
  wiki: string
  photoUrl?: string
  hint?: string
  custom?: boolean
  chosenAt: string
}

const KEY = 'hmm-actors-assignments-v1'

function safeParse(raw: string | null): Record<string, Assignment> {
  if (!raw) return {}
  try {
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

export function loadAssignments(): Record<string, Assignment> {
  try {
    return safeParse(localStorage.getItem(KEY))
  } catch {
    return {}
  }
}

export function saveAssignment(a: Assignment): Record<string, Assignment> {
  const all = loadAssignments()
  all[a.initial] = a
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    /* iframe / private mode */
  }
  return all
}

export function clearAssignment(initial: string): Record<string, Assignment> {
  const all = loadAssignments()
  delete all[initial]
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
  return all
}

export function exportAssignmentsJson(): string {
  return JSON.stringify(loadAssignments(), null, 2)
}

export function importAssignmentsJson(raw: string): Record<string, Assignment> {
  const data = safeParse(raw)
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
  return data
}
