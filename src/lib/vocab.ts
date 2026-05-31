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
  { role: 'parent', counter: 'child' },
  { role: 'child', counter: 'parent' },
  { role: 'grandparent', counter: 'grandchild' },
  { role: 'grandchild', counter: 'grandparent' },
  { role: 'sibling', counter: 'sibling', symmetric: true },
  { role: 'owner', counter: 'pet' },
  { role: 'pet', counter: 'owner' },
  { role: 'partner', counter: 'partner', symmetric: true },
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
