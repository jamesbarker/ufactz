export type ID = string

/** A node in the graph — a person or pet; all the same shape. */
export interface Entity {
  id: ID
  name: string
  /** Optional fun icon shown on the avatar; falls back to the name's initial. */
  emoji?: string
  notes?: string
  circleIds: ID[]
  createdAt: number
  updatedAt: number
}

/**
 * A directed edge between two entities, with a role word for each side so we
 * can render it from either card. "Mary is the mother of Sally" stores:
 *   from = Mary, to = Sally, fromRole = "mother", toRole = "child".
 * On Sally's card we show fromRole ("Mother: Mary"); on Mary's card we show
 * toRole ("Child: Sally").
 */
export interface Relationship {
  id: ID
  fromId: ID
  toId: ID
  fromRole: string
  toRole: string
  createdAt: number
}

export interface Circle {
  id: ID
  name: string
  emoji: string
  color: string
}

export interface AppData {
  circles: Circle[]
  entities: Entity[]
  relationships: Relationship[]
}

export const SCHEMA_VERSION = 3
