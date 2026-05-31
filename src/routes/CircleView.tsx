import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useStore, useCircle } from '../store'
import { entitiesInCircle, rolesOf } from '../lib/selectors'
import { titleCase } from '../lib/vocab'
import AppBar from '../components/AppBar'
import EntityRow from '../components/EntityRow'
import Fab from '../components/Fab'

export default function CircleView() {
  const { circleId } = useParams()
  const navigate = useNavigate()
  const circle = useCircle(circleId)
  const allEntities = useStore((s) => s.entities)
  const relationships = useStore((s) => s.relationships)
  const [filter, setFilter] = useState('all')

  if (!circle) return <Navigate to="/" replace />

  const people = entitiesInCircle(allEntities, circle.id)

  // Each member's own role(s), and the distinct "kinds" present in this circle
  // (e.g. owner, pet) with a count, so we can offer them as filter chips.
  const rolesByEntity = new Map(people.map((e) => [e.id, rolesOf(relationships, e.id)]))
  const counts = new Map<string, number>()
  for (const roles of rolesByEntity.values())
    for (const role of roles) counts.set(role, (counts.get(role) ?? 0) + 1)
  const roleOptions = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([role, n]) => ({ role, n }))

  // Fall back to "all" if the active filter isn't present in this circle.
  const active = filter !== 'all' && counts.has(filter) ? filter : 'all'
  const shown =
    active === 'all'
      ? people
      : people.filter((e) => rolesByEntity.get(e.id)?.includes(active))

  return (
    <div className="app">
      <AppBar
        title={`${circle.emoji} ${circle.name}`}
        backTo="/"
        right={
          <button
            className="iconbtn"
            aria-label="Edit circle"
            onClick={() => navigate(`/circle/${circle.id}/edit`)}
          >
            ⋯
          </button>
        }
      />
      <div className="content">
        {roleOptions.length >= 2 && (
          <div className="chips filter-chips">
            <button
              className={'chip' + (active === 'all' ? ' active' : '')}
              onClick={() => setFilter('all')}
            >
              All <span className="n">{people.length}</span>
            </button>
            {roleOptions.map((o) => (
              <button
                key={o.role}
                className={'chip' + (active === o.role ? ' active' : '')}
                onClick={() => setFilter(o.role)}
              >
                {titleCase(o.role)} <span className="n">{o.n}</span>
              </button>
            ))}
          </div>
        )}

        <div className="section-title">
          {shown.length} {shown.length === 1 ? 'profile' : 'profiles'}
        </div>

        {people.length === 0 ? (
          <div className="empty">
            <div className="big">{circle.emoji}</div>
            No profiles here yet.
            <br />
            Tap “Add” to start.
          </div>
        ) : (
          <div className="list">
            {shown.map((e) => (
              <EntityRow key={e.id} entity={e} />
            ))}
          </div>
        )}
      </div>

      <Fab to={`/entity/new?circle=${circle.id}`} label="Add" />
    </div>
  )
}
