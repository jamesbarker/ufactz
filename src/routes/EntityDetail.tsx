import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useStore, useEntity } from '../store'
import { relationsOf } from '../lib/selectors'
import { titleCase } from '../lib/vocab'
import AppBar from '../components/AppBar'
import Avatar from '../components/Avatar'

export default function EntityDetail() {
  const { entityId } = useParams()
  const navigate = useNavigate()
  const entity = useEntity(entityId)
  const circles = useStore((s) => s.circles)
  const entities = useStore((s) => s.entities)
  const relationships = useStore((s) => s.relationships)
  const deleteEntity = useStore((s) => s.deleteEntity)
  const deleteRelationship = useStore((s) => s.deleteRelationship)

  if (!entity) return <Navigate to="/" replace />

  const memberCircles = circles.filter((c) => entity.circleIds.includes(c.id))
  const relations = relationsOf(entities, relationships, entity.id)
  // Back always returns to this object's circle — never to a previous object.
  const backTo = memberCircles[0] ? `/circle/${memberCircles[0].id}` : '/'

  const onDelete = () => {
    if (confirm(`Delete ${entity.name}? This also removes their relationships.`)) {
      deleteEntity(entity.id)
      navigate(-1)
    }
  }

  const onUnlink = (relId: string, otherName: string) => {
    if (confirm(`Remove the relationship with ${otherName}?`)) deleteRelationship(relId)
  }

  return (
    <div className="app">
      <AppBar
        title=""
        backTo={backTo}
        right={
          <button
            className="iconbtn"
            aria-label="Edit"
            onClick={() => navigate(`/entity/${entity.id}/edit`)}
          >
            ✎
          </button>
        }
      />
      <div className="content">
        <div className="detail-head">
          <Avatar name={entity.name} emoji={entity.emoji} size="lg" />
          <div className="big-name">{entity.name}</div>
          {memberCircles.length > 0 && (
            <div className="chips" style={{ justifyContent: 'center' }}>
              {memberCircles.map((c) => (
                <button
                  key={c.id}
                  className="chip"
                  onClick={() => navigate(`/circle/${c.id}`)}
                >
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="section-title">Relationships</div>
        <div className="list">
          {relations.map((rel) => (
            <div className="rel-item" key={rel.relId}>
              <button
                className="row"
                onClick={() => navigate(`/entity/${rel.other.id}`)}
              >
                <Avatar name={rel.other.name} emoji={rel.other.emoji} />
                <div className="meta">
                  <div className="name">{rel.other.name}</div>
                  <div className="sub">{titleCase(rel.role)}</div>
                </div>
                <span className="chev">›</span>
              </button>
              <button
                className="iconbtn"
                aria-label="Remove relationship"
                onClick={() => onUnlink(rel.relId, rel.other.name)}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            className="btn btn-add-hook"
            onClick={() => navigate(`/entity/${entity.id}/relate`)}
          >
            ＋ Add relationship
          </button>
        </div>

        {entity.notes && (
          <>
            <div className="section-title">Notes</div>
            <div className="note">{entity.notes}</div>
          </>
        )}

        <div className="stack" style={{ marginTop: 28 }}>
          <button className="btn" onClick={() => navigate(`/entity/${entity.id}/edit`)}>
            Edit
          </button>
          <button className="btn danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
