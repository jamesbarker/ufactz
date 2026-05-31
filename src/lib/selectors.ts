import type { Entity, Relationship } from '../types'
import { titleCase } from './vocab'

export function entitiesInCircle(entities: Entity[], circleId: string): Entity[] {
  return entities
    .filter((e) => e.circleIds.includes(circleId))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export interface RelationView {
  relId: string
  /** The other entity's role as seen from this card, e.g. "owner". */
  role: string
  other: Entity
}

/** All relationships touching `id`, resolved to the *other* entity + its role. */
export function relationsOf(
  entities: Entity[],
  relationships: Relationship[],
  id: string,
): RelationView[] {
  const byId = new Map(entities.map((e) => [e.id, e]))
  const out: RelationView[] = []
  for (const r of relationships) {
    if (r.fromId !== id && r.toId !== id) continue
    const iAmFrom = r.fromId === id
    const otherId = iAmFrom ? r.toId : r.fromId
    const role = iAmFrom ? r.toRole : r.fromRole // the other's role relative to me
    const other = byId.get(otherId)
    if (other) out.push({ relId: r.id, role, other })
  }
  return out.sort((a, b) => a.role.localeCompare(b.role) || a.other.name.localeCompare(b.other.name))
}

/**
 * The roles an entity itself holds — the role word on *its own* side of each
 * edge. There's no "type" field in the graph; what an entity *is* (owner, pet,
 * mother…) emerges from this. Used to group/filter a circle by kind.
 */
export function rolesOf(relationships: Relationship[], id: string): string[] {
  const roles = new Set<string>()
  for (const r of relationships) {
    if (r.fromId === id) roles.add(r.fromRole)
    if (r.toId === id) roles.add(r.toRole)
  }
  return [...roles]
}

/** A one-line hint for a card row, e.g. "Owner: Sarah +1". */
export function relationSummary(
  entities: Entity[],
  relationships: Relationship[],
  id: string,
): string | undefined {
  const rels = relationsOf(entities, relationships, id)
  if (rels.length === 0) return undefined
  const first = `${titleCase(rels[0].role)}: ${rels[0].other.name}`
  return rels.length > 1 ? `${first} +${rels.length - 1}` : first
}

export interface SearchHit {
  entity: Entity
  reason?: string
}

export function searchEntities(entities: Entity[], query: string): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const hits: SearchHit[] = []
  for (const e of entities) {
    if (e.name.toLowerCase().includes(q)) {
      hits.push({ entity: e })
    } else if (e.notes?.toLowerCase().includes(q)) {
      hits.push({ entity: e, reason: 'note' })
    }
  }
  return hits.sort((a, b) => a.entity.name.localeCompare(b.entity.name))
}
