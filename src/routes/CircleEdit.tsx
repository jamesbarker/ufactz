import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '../store'
import { PALETTE, EMOJI_CHOICES } from '../lib/vocab'
import AppBar from '../components/AppBar'

export default function CircleEdit() {
  const { circleId } = useParams()
  const navigate = useNavigate()

  const existing = useStore((s) => s.circles.find((c) => c.id === circleId))
  const addCircle = useStore((s) => s.addCircle)
  const updateCircle = useStore((s) => s.updateCircle)
  const deleteCircle = useStore((s) => s.deleteCircle)
  const memberCount = useStore(
    (s) => s.entities.filter((e) => circleId && e.circleIds.includes(circleId)).length,
  )

  const isEdit = Boolean(circleId)

  const [name, setName] = useState(existing?.name ?? '')
  const [emoji, setEmoji] = useState(existing?.emoji ?? EMOJI_CHOICES[0])
  const [color, setColor] = useState(existing?.color ?? PALETTE[0])

  if (isEdit && !existing) return <Navigate to="/" replace />

  const canSave = name.trim().length > 0
  const backTo = isEdit && existing ? `/circle/${existing.id}` : '/'

  const onSave = () => {
    const payload = { name: name.trim(), emoji, color }
    if (isEdit && existing) {
      updateCircle(existing.id, payload)
      navigate(`/circle/${existing.id}`, { replace: true })
    } else {
      const id = addCircle(payload)
      navigate(`/circle/${id}`, { replace: true })
    }
  }

  const onDelete = () => {
    if (!existing) return
    const msg =
      memberCount > 0
        ? `Delete “${existing.name}”? ${memberCount} ${
            memberCount === 1 ? 'profile stays' : 'profiles stay'
          } in the app but will be removed from this circle.`
        : `Delete “${existing.name}”?`
    if (confirm(msg)) {
      deleteCircle(existing.id)
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="app">
      <AppBar title={isEdit ? 'Edit circle' : 'New circle'} backTo={backTo} />
      <div className="content">
        <div className="field">
          <label>Name</label>
          <input
            type="text"
            value={name}
            placeholder="e.g. Dog club"
            autoFocus={!isEdit}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Icon</label>
          <div className="emoji-row">
            {EMOJI_CHOICES.map((e) => (
              <button
                key={e}
                className={`emoji-pick ${e === emoji ? 'on' : ''}`}
                onClick={() => setEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Colour</label>
          <div className="swatch-row">
            {PALETTE.map((c) => (
              <button
                key={c}
                className={`swatch ${c === color ? 'on' : ''}`}
                style={{ background: c }}
                aria-label={c}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <button className="btn primary" disabled={!canSave} onClick={onSave}>
          {isEdit ? 'Save changes' : 'Create circle'}
        </button>

        {isEdit && (
          <button className="btn danger" style={{ marginTop: 10 }} onClick={onDelete}>
            Delete circle
          </button>
        )}
      </div>
    </div>
  )
}
