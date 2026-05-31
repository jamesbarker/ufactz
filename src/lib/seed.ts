import type { AppData } from '../types'

const ent = (id: string, name: string, circleIds: string[], emoji?: string, notes?: string) => ({
  id,
  name,
  circleIds,
  emoji,
  notes,
})

/** What a brand-new user sees on first open: a tiny example that shows the
 *  idea — tap Oreo and you'll see "Parent: James". Rex has no relationship,
 *  which is fine too. Easy to edit or delete. */
export const SEED: AppData = {
  circles: [
    { id: 'c_run', name: 'Run Club', emoji: '🏃', color: '#fb923c' },
    { id: 'c_dog', name: 'Dog Club', emoji: '🐕', color: '#7c6bff' },
    { id: 'c_neighbours', name: 'Neighbours', emoji: '🏡', color: '#38bdf8' },
  ],
  entities: [
    ent('e_james', 'James', ['c_dog', 'c_run']),
    ent('e_oreo', 'Oreo', ['c_dog', 'c_run'], '🐶'),
    ent('e_rex', 'Rex', ['c_dog'], '🐶'),
  ],
  relationships: [
    // James is the parent of Oreo → Oreo's card shows "Parent: James"
    { id: 'r1', fromId: 'e_james', toId: 'e_oreo', fromRole: 'parent', toRole: 'child' },
  ],
}
