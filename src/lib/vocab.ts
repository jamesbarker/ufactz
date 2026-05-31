// Shared vocabulary: relationship role pairs and palettes.

/**
 * Picking `role` for the current card automatically implies `counter` for the
 * other card. Symmetric pairs read the same both ways (sibling/sibling).
 */
export interface RolePair {
  role: string
  counter: string
  symmetric?: boolean
}

export const ROLE_PAIRS: RolePair[] = [
  { role: 'owner', counter: 'pet' },
  { role: 'pet', counter: 'owner' },
  { role: 'mother', counter: 'child' },
  { role: 'father', counter: 'child' },
  { role: 'parent', counter: 'child' },
  { role: 'child', counter: 'parent' },
  { role: 'grandparent', counter: 'grandchild' },
  { role: 'sibling', counter: 'sibling', symmetric: true },
  { role: 'spouse', counter: 'spouse', symmetric: true },
  { role: 'partner', counter: 'partner', symmetric: true },
  { role: 'friend', counter: 'friend', symmetric: true },
  { role: 'colleague', counter: 'colleague', symmetric: true },
  { role: 'neighbour', counter: 'neighbour', symmetric: true },
  { role: 'coach', counter: 'player' },
  { role: 'player', counter: 'coach' },
  { role: 'teacher', counter: 'student' },
  { role: 'student', counter: 'teacher' },
  { role: 'boss', counter: 'report' },
  { role: 'report', counter: 'boss' },
]

export function counterRole(role: string): string {
  return ROLE_PAIRS.find((p) => p.role === role.toLowerCase())?.counter ?? role
}

export function titleCase(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

export const PALETTE = [
  '#7c6bff', '#2dd4bf', '#38bdf8', '#fb923c', '#f472b6',
  '#f87171', '#a3e635', '#facc15', '#c084fc', '#34d399',
]

export const EMOJI_CHOICES = [
  '🐕', '💼', '🎓', '⚽', '🏀', '🎾', '🏊', '🎵', '🎨', '📚',
  '🍻', '🏃', '🧘', '🎮', '👶', '🏡', '✈️', '🚴', '🐈', '☕',
]

// A fun icon a profile (person or pet) can wear instead of a plain initial.
export const ENTITY_EMOJI = [
  '😀', '😎', '🤓', '🥳', '🤠', '🤖', '👻', '🦸', '🧙', '🧑‍🚀',
  '👦', '👧', '👨', '👩', '🧑', '👴', '👵', '🧔', '👶', '🐣',
  '🐶', '🐱', '🐰', '🐹', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯',
  '🐸', '🐵', '🦄', '🐢', '🐧', '🦉', '🐝', '🐙', '🌟', '🔥',
]
