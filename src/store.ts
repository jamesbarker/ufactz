import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import type { AppData, Circle, Entity } from './types'
import { SCHEMA_VERSION } from './types'
import { SEED } from './lib/seed'
import { uid } from './lib/uid'

// Former storage key — read once and migrated so a rename doesn't wipe data.
const LEGACY_KEY = 'whodat-data'

const idbStorage: StateStorage = {
  getItem: async (name) => {
    const current = await idbGet<string>(name)
    if (current != null) return current
    const legacy = await idbGet<string>(LEGACY_KEY)
    if (legacy != null) {
      await idbSet(name, legacy)
      await idbDel(LEGACY_KEY)
      return legacy
    }
    return null
  },
  setItem: async (name, value) => {
    await idbSet(name, value)
  },
  removeItem: async (name) => {
    await idbDel(name)
  },
}

export interface CircleInput {
  name: string
  emoji: string
  color: string
}

export interface EntityInput {
  name: string
  emoji?: string
  notes?: string
  circleIds: string[]
}

export interface RelationshipInput {
  fromId: string
  toId: string
  fromRole: string
  toRole: string
}

interface State extends AppData {
  hydrated: boolean
  // circles
  addCircle: (c: CircleInput) => string
  updateCircle: (id: string, patch: Partial<CircleInput>) => void
  deleteCircle: (id: string) => void
  // entities
  addEntity: (e: EntityInput) => string
  updateEntity: (id: string, e: EntityInput) => void
  deleteEntity: (id: string) => void
  // relationships
  addRelationship: (r: RelationshipInput) => void
  deleteRelationship: (id: string) => void
  // data management
  replaceAll: (data: AppData) => void
  resetToSeed: () => void
  clearAll: () => void
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...structuredClone(SEED),
      hydrated: false,

      addCircle: (c) => {
        const id = uid()
        set((s) => ({ circles: [...s.circles, { id, ...c }] }))
        return id
      },
      updateCircle: (id, patch) =>
        set((s) => ({
          circles: s.circles.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteCircle: (id) =>
        set((s) => ({
          circles: s.circles.filter((c) => c.id !== id),
          entities: s.entities.map((e) =>
            e.circleIds.includes(id)
              ? { ...e, circleIds: e.circleIds.filter((cid) => cid !== id) }
              : e,
          ),
        })),

      addEntity: (e) => {
        const id = uid()
        const now = Date.now()
        const entity: Entity = {
          id,
          name: e.name.trim(),
          emoji: e.emoji,
          notes: e.notes?.trim() || undefined,
          circleIds: e.circleIds,
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ entities: [...s.entities, entity] }))
        return id
      },
      updateEntity: (id, e) =>
        set((s) => ({
          entities: s.entities.map((existing) =>
            existing.id === id
              ? {
                  ...existing,
                  name: e.name.trim(),
                  emoji: e.emoji,
                  notes: e.notes?.trim() || undefined,
                  circleIds: e.circleIds,
                  updatedAt: Date.now(),
                }
              : existing,
          ),
        })),
      deleteEntity: (id) =>
        set((s) => ({
          entities: s.entities.filter((e) => e.id !== id),
          relationships: s.relationships.filter((r) => r.fromId !== id && r.toId !== id),
        })),

      addRelationship: (r) =>
        set((s) => ({
          relationships: [
            ...s.relationships,
            {
              id: uid(),
              fromId: r.fromId,
              toId: r.toId,
              fromRole: r.fromRole.trim().toLowerCase(),
              toRole: r.toRole.trim().toLowerCase(),
              createdAt: Date.now(),
            },
          ],
        })),
      deleteRelationship: (id) =>
        set((s) => ({ relationships: s.relationships.filter((r) => r.id !== id) })),

      replaceAll: (data) =>
        set({
          circles: data.circles ?? [],
          entities: data.entities ?? [],
          relationships: data.relationships ?? [],
        }),
      resetToSeed: () => set(structuredClone(SEED)),
      clearAll: () => set({ circles: [], entities: [], relationships: [] }),
    }),
    {
      name: 'ufactz-data',
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({
        circles: s.circles,
        entities: s.entities,
        relationships: s.relationships,
      }),
      // v1 stored { circles (with hookSuggestions), people (with hooks) }.
      // Fold each person's hooks into notes so nothing is lost, and turn
      // people into plain entities. v2 stored a `photo` data URL per entity;
      // v3 dropped photos, so we strip any stored photo below.
      migrate: (persisted, version) => {
        let data: AppData
        if (version < 2 && persisted && typeof persisted === 'object') {
          const p = persisted as {
            circles?: { id: string; name: string; emoji: string; color: string }[]
            people?: {
              id: string
              name: string
              notes?: string
              circleIds?: string[]
              hooks?: { label: string; value: string }[]
              createdAt?: number
              updatedAt?: number
            }[]
          }
          const circles: Circle[] = (p.circles ?? []).map((c) => ({
            id: c.id,
            name: c.name,
            emoji: c.emoji,
            color: c.color,
          }))
          const entities: Entity[] = (p.people ?? []).map((person) => {
            const cueLines = (person.hooks ?? [])
              .filter((h) => h.label || h.value)
              .map((h) => `${h.label}: ${h.value}`)
            const notes = [person.notes, ...cueLines].filter(Boolean).join('\n') || undefined
            return {
              id: person.id,
              name: person.name,
              notes,
              circleIds: person.circleIds ?? [],
              createdAt: person.createdAt ?? 0,
              updatedAt: person.updatedAt ?? 0,
            }
          })
          data = { circles, entities, relationships: [] }
        } else {
          data = (persisted ?? { circles: [], entities: [], relationships: [] }) as AppData
        }
        // v2 → v3: rebuild each entity with only the current fields so any
        // stored `photo` is dropped.
        return {
          circles: data.circles ?? [],
          relationships: data.relationships ?? [],
          entities: (data.entities ?? []).map((e) => ({
            id: e.id,
            name: e.name,
            emoji: e.emoji,
            notes: e.notes,
            circleIds: e.circleIds,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
          })),
        }
      },
      onRehydrateStorage: () => () => {
        useStore.setState({ hydrated: true })
      },
    },
  ),
)

export const useCircle = (id: string | undefined): Circle | undefined =>
  useStore((s) => s.circles.find((c) => c.id === id))

export const useEntity = (id: string | undefined): Entity | undefined =>
  useStore((s) => s.entities.find((e) => e.id === id))
