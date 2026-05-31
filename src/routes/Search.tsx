import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { searchEntities } from '../lib/selectors'
import AppBar from '../components/AppBar'
import EntityRow from '../components/EntityRow'

export default function Search() {
  const navigate = useNavigate()
  const entities = useStore((s) => s.entities)
  const circles = useStore((s) => s.circles)
  const [q, setQ] = useState('')

  const query = q.trim().toLowerCase()
  const circleHits = query
    ? circles.filter((c) => c.name.toLowerCase().includes(query))
    : []
  const peopleHits = searchEntities(entities, q)
  const hasResults = circleHits.length > 0 || peopleHits.length > 0

  const countFor = (circleId: string) =>
    entities.filter((e) => e.circleIds.includes(circleId)).length

  return (
    <div className="app">
      <AppBar title="Search" backTo="/" />
      <div className="content">
        <div className="searchbox">
          <span>🔍</span>
          <input
            value={q}
            autoFocus
            placeholder="Name, pet, or circle…"
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button
              className="iconbtn"
              style={{ width: 28, height: 28 }}
              aria-label="Clear"
              onClick={() => setQ('')}
            >
              ✕
            </button>
          )}
        </div>

        {query === '' ? (
          <p className="hint">
            Search by a name you know — a person, a pet, or a circle — then tap through
            the relationships to the one you forgot.
          </p>
        ) : !hasResults ? (
          <div className="empty">No matches for “{q}”.</div>
        ) : (
          <>
            {circleHits.length > 0 && (
              <>
                <div className="section-title">Circles</div>
                <div className="list">
                  {circleHits.map((c) => (
                    <button
                      key={c.id}
                      className="row"
                      onClick={() => navigate(`/circle/${c.id}`)}
                    >
                      <div className="avatar" style={{ background: c.color, fontSize: 22 }}>
                        {c.emoji}
                      </div>
                      <div className="meta">
                        <div className="name">{c.name}</div>
                        <div className="sub">
                          {countFor(c.id)} {countFor(c.id) === 1 ? 'profile' : 'profiles'}
                        </div>
                      </div>
                      <span className="chev">›</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {peopleHits.length > 0 && (
              <>
                {circleHits.length > 0 && <div className="section-title">People</div>}
                <div className="list">
                  {peopleHits.map(({ entity, reason }) => (
                    <EntityRow key={entity.id} entity={entity} sub={reason} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
