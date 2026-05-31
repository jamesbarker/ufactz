import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useStore, useCircle } from '../store'
import { entitiesInCircle } from '../lib/selectors'
import AppBar from '../components/AppBar'
import EntityRow from '../components/EntityRow'
import Fab from '../components/Fab'

export default function CircleView() {
  const { circleId } = useParams()
  const navigate = useNavigate()
  const circle = useCircle(circleId)
  const allEntities = useStore((s) => s.entities)

  if (!circle) return <Navigate to="/" replace />

  const people = entitiesInCircle(allEntities, circle.id)

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
        <div className="section-title">
          {people.length} {people.length === 1 ? 'profile' : 'profiles'}
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
            {people.map((e) => (
              <EntityRow key={e.id} entity={e} />
            ))}
          </div>
        )}
      </div>

      <Fab to={`/entity/new?circle=${circle.id}`} label="Add" />
    </div>
  )
}
