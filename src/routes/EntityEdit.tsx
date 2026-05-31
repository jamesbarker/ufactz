import { useParams, useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '../store'
import { ENTITY_EMOJI } from '../lib/vocab'
import AppBar from '../components/AppBar'

export default function EntityEdit() {
  const { entityId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const circles = useStore((s) => s.circles)
  const existing = useStore((s) => s.entities.find((e) => e.id === entityId))
  const addEntity = useStore((s) => s.addEntity)
  const updateEntity = useStore((s) => s.updateEntity)

  const isEdit = Boolean(entityId)
  const preselect = params.get('circle')

  const [name, setName] = useState(existing?.name ?? '')
  const [emoji, setEmoji] = useState<string | undefined>(existing?.emoji)
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [circleIds, setCircleIds] = useState<string[]>(
    existing?.circleIds ?? (preselect ? [preselect] : []),
  )

  if (isEdit && !existing) return <Navigate to="/" replace />

  const toggleCircle = (id: string) =>
    setCircleIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const canSave = name.trim().length > 0

  // Back: edit → the object; add-from-a-circle → that circle; else home.
  const backTo =
    isEdit && existing
      ? `/entity/${existing.id}`
      : preselect
        ? `/circle/${preselect}`
        : '/'

  const onSave = () => {
    const payload = { name, emoji, notes, circleIds }
    if (isEdit && existing) {
      updateEntity(existing.id, payload)
      navigate(`/entity/${existing.id}`, { replace: true })
    } else {
      const id = addEntity(payload)
      navigate(`/entity/${id}`, { replace: true })
    }
  }

  return (
    <div className="app">
      <AppBar
        title={isEdit ? 'Edit profile' : 'New profile'}
        backTo={backTo}
        right={
          <button
            className="iconbtn"
            aria-label="Save"
            disabled={!canSave}
            style={{ opacity: canSave ? 1 : 0.4, color: 'var(--accent)' }}
            onClick={onSave}
          >
            ✓
          </button>
        }
      />
      <div className="content">
        <div className="field">
          <label>Name</label>
          <input
            type="text"
            value={name}
            placeholder="Name of a person or pet"
            autoFocus={!isEdit}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Icon</label>
          <div className="emoji-row">
            {ENTITY_EMOJI.map((e) => (
              <button
                key={e}
                className={`emoji-pick ${e === emoji ? 'on' : ''}`}
                onClick={() => setEmoji((cur) => (cur === e ? undefined : e))}
              >
                {e}
              </button>
            ))}
          </div>
          <p className="hint">Optional — tap again to clear. Otherwise we show their initial.</p>
        </div>

        <div className="field">
          <label>Circles</label>
          {circles.length === 0 ? (
            <p className="hint">No circles yet — add one from the home screen.</p>
          ) : (
            <div className="toggle-grid">
              {circles.map((c) => (
                <button
                  key={c.id}
                  className={`toggle ${circleIds.includes(c.id) ? 'on' : ''}`}
                  onClick={() => toggleCircle(c.id)}
                >
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="field">
          <label>Notes</label>
          <textarea
            value={notes}
            placeholder="Anything that helps you remember them — what they do, where they sit…"
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button className="btn primary" disabled={!canSave} onClick={onSave}>
          {isEdit ? 'Save changes' : 'Add profile'}
        </button>
        {!isEdit && (
          <p className="hint" style={{ marginTop: 10 }}>
            After saving you can link this profile to others — e.g. add a parent or a
            child.
          </p>
        )}
      </div>
    </div>
  )
}
