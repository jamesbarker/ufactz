import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'

export default function Home() {
  const navigate = useNavigate()
  const circles = useStore((s) => s.circles)
  const entities = useStore((s) => s.entities)
  const relationships = useStore((s) => s.relationships)

  const countFor = (circleId: string) =>
    entities.filter((e) => e.circleIds.includes(circleId)).length

  return (
    <div className="app">
      <header className="appbar">
        <button
          className="searchbox header-search"
          onClick={() => navigate('/search')}
          aria-label="Search"
        >
          <span>🔍</span>
          <span style={{ color: 'var(--text-dim)' }}>Search…</span>
        </button>
        <button
          className="iconbtn"
          aria-label="Settings"
          onClick={() => navigate('/settings')}
        >
          ⚙
        </button>
      </header>

      <div className="content">
        <div className="grid">
          {circles.map((c) => (
            <button
              key={c.id}
              className="circle-btn"
              style={{ background: c.color }}
              onClick={() => navigate(`/circle/${c.id}`)}
            >
              <span className="emoji">{c.emoji}</span>
              <span>
                <span className="label">{c.name}</span>
                <br />
                <span className="count">
                  {countFor(c.id)} {countFor(c.id) === 1 ? 'profile' : 'profiles'}
                </span>
              </span>
            </button>
          ))}

          <button className="circle-btn add" onClick={() => navigate('/circle/new')}>
            <span style={{ fontSize: 30 }}>＋</span>
            <span className="label">Add circle</span>
          </button>
        </div>

        {circles.length === 0 && (
          <p className="hint">
            Tap “Add circle” to create your first group — like “Dog Club” or “Work”.
          </p>
        )}

        {entities.length > 0 && (
          <div className="stats">
            <div className="stat">
              <span className="stat-n">{entities.length}</span>
              <span className="stat-label">
                {entities.length === 1 ? 'profile' : 'profiles'}
              </span>
            </div>
            <div className="stat">
              <span className="stat-n">{relationships.length}</span>
              <span className="stat-label">
                {relationships.length === 1 ? 'relationship' : 'relationships'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
