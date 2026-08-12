export type CategoryId = 'male' | 'female' | 'fictional' | 'wildcard'

export interface InitialMeta {
  id: string
  display: string
  category: CategoryId
  frequency: number
}

export interface ActorSuggestion {
  name: string
  wiki: string
  hint: string
}

export const CATEGORIES: {
  id: CategoryId
  label: string
  blurb: string
  initials: string[]
}[] = [
  {
    id: 'male',
    label: 'Male',
    blurb: 'Real men / live-action male roles',
    initials: [
      'ø', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'z', 'c', 's', 'zh', 'ch', 'sh', 'r', 'g', 'k', 'h',
    ],
  },
  {
    id: 'female',
    label: 'Female',
    blurb: 'Real women / live-action female roles',
    initials: ['yi', 'bi', 'pi', 'mi', 'di', 'ti', 'ni', 'li', 'ji', 'qi', 'xi'],
  },
  {
    id: 'fictional',
    label: 'Fictional',
    blurb: 'Anime, cartoons, games, pure fiction',
    initials: [
      'wu', 'bu', 'pu', 'mu', 'fu', 'du', 'tu', 'nu', 'lu', 'zu', 'cu', 'su', 'zhu', 'chu', 'shu', 'ru', 'gu', 'ku', 'hu',
    ],
  },
  {
    id: 'wildcard',
    label: 'Wildcard',
    blurb: 'Anything memorable (ü-series)',
    initials: ['yu', 'nü', 'lü', 'ju', 'qu', 'xu'],
  },
]

/** Character counts from Mandarin Blueprint cheatsheet */
export const FREQUENCY: Record<string, number> = {
  ji: 200, yi: 176, xi: 147, zh: 134, sh: 120, ch: 99, qi: 96, wu: 95, b: 94, li: 83,
  m: 80, hu: 77, g: 71, h: 70, d: 67, f: 67, yu: 67, t: 65, l: 62, gu: 57, z: 57,
  c: 53, ø: 53, zhu: 52, di: 51, p: 51, shu: 48, bi: 47, k: 46, ju: 42, s: 42, xu: 41,
  chu: 37, du: 37, fu: 36, ku: 36, pi: 35, mi: 34, ti: 33, r: 30, lu: 27, su: 27, n: 25,
  qu: 25, tu: 25, ni: 23, zu: 22, cu: 18, mu: 15, lü: 14, ru: 11, pu: 10, bu: 9, nu: 6, nü: 2,
}

export function getInitialMeta(id: string): InitialMeta {
  const cat = CATEGORIES.find((c) => c.initials.includes(id))
  return {
    id,
    display: id === 'ø' ? 'ø' : id,
    category: cat?.id ?? 'male',
    frequency: FREQUENCY[id] ?? 0,
  }
}

export function allInitials(): InitialMeta[] {
  return CATEGORIES.flatMap((c) => c.initials.map(getInitialMeta))
}
