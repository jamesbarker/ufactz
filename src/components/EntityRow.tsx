import { useNavigate } from 'react-router-dom'
import type { Entity } from '../types'
import { useStore } from '../store'
import { relationSummary } from '../lib/selectors'
import Avatar from './Avatar'

interface Props {
  entity: Entity
  /** Optional subtitle override. Defaults to the card's top relationship. */
  sub?: string
}

export default function EntityRow({ entity, sub }: Props) {
  const navigate = useNavigate()
  const entities = useStore((s) => s.entities)
  const relationships = useStore((s) => s.relationships)
  const subtitle = sub ?? relationSummary(entities, relationships, entity.id)
  return (
    <button className="row" onClick={() => navigate(`/entity/${entity.id}`)}>
      <Avatar name={entity.name} emoji={entity.emoji} />
      <div className="meta">
        <div className="name">{entity.name}</div>
        {subtitle && <div className="sub">{subtitle}</div>}
      </div>
      <span className="chev">›</span>
    </button>
  )
}
