import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useStore, useCircle } from '../store'
import { topRelationPair } from '../lib/selectors'
import { ROLE_PAIRS, counterRole, titleCase } from '../lib/vocab'
import AppBar from '../components/AppBar'

/**
 * Add two profiles and the relationship between them in one screen, both joining
 * the current circle. The relationship defaults to the circle's most-used pair
 * (e.g. owner/pet in Dog Club). Typing a name that already exists links to that
 * profile instead of creating a duplicate — so "one side already in the circle"
 * works without a separate picker.
 */
export default function QuickAdd() {
  const { circleId } = useParams()
  const navigate = useNavigate()
  const circle = useCircle(circleId)
  const entities = useStore((s) => s.entities)
  const relationships = useStore((s) => s.relationships)
  const addEntity = useStore((s) => s.addEntity)
  const updateEntity = useStore((s) => s.updateEntity)
  const addRelationship = useStore((s) => s.addRelationship)

  // Deduped preset roles, like the Add-relationship picker.
  const presets = ROLE_PAIRS.filter(
    (p, i, arr) => arr.findIndex((x) => x.role === p.role) === i,
  )
  const top = circle ? topRelationPair(entities, relationships, circle.id) : undefined
  const topIsPreset = top ? presets.some((p) => p.role === top.fromRole) : false

  const [role, setRole] = useState(top?.fromRole ?? 'owner')
  const [counter, setCounter] = useState(top?.toRole ?? counterRole('owner'))
  const [custom, setCustom] = useState(top ? !topIsPreset : false)
  const [nameA, setNameA] = useState('')
  const [nameB, setNameB] = useState('')

  if (!circle) return <Navigate to="/" replace />

  const a = nameA.trim()
  const b = nameB.trim()
  const findByName = (name: string) =>
    name ? entities.find((e) => e.name.trim().toLowerCase() === name.toLowerCase()) : undefined
  const matchA = findByName(a)
  const matchB = findByName(b)
  const sameName = a.length > 0 && a.toLowerCase() === b.toLowerCase()

  const roleReady = role.trim().length > 0
  const canSave = a.length > 0 && b.length > 0 && roleReady && !sameName

  const pickPreset = (r: string) => {
    setRole(r)
    setCounter(counterRole(r))
    setCustom(false)
  }

  // Reuse an existing profile by exact name (adding this circle to it), else
  // create a new one in this circle. Returns the entity id either way.
  const resolve = (name: string): string => {
    const match = findByName(name)
    if (match) {
      if (!match.circleIds.includes(circle.id))
        updateEntity(match.id, {
          name: match.name,
          emoji: match.emoji,
          notes: match.notes,
          circleIds: [...match.circleIds, circle.id],
        })
      return match.id
    }
    return addEntity({ name, circleIds: [circle.id] })
  }

  const onSave = () => {
    if (!canSave) return
    const fromId = resolve(a)
    const toId = resolve(b)
    addRelationship({
      fromId,
      toId,
      fromRole: role.trim(),
      toRole: counter.trim() || role.trim(),
    })
    navigate(`/circle/${circle.id}`, { replace: true })
  }

  return (
    <div className="app">
      <AppBar
        title="Quick add"
        backTo={`/circle/${circle.id}`}
        right={
          <button
            className="iconbtn"
            aria-label="Add both"
            disabled={!canSave}
            style={{ opacity: canSave ? 1 : 0.4, color: 'var(--accent)' }}
            onClick={onSave}
          >
            ✓
          </button>
        }
      />
      <div className="content">
        <p className="hint" style={{ marginBottom: 16 }}>
          Add two profiles and link them in one go. Both join{' '}
          <strong>
            {circle.emoji} {circle.name}
          </strong>
          .
        </p>

        <div className="field">
          <label>First profile</label>
          <input
            type="text"
            value={nameA}
            autoFocus
            placeholder="Name of a person or pet"
            onChange={(e) => setNameA(e.target.value)}
          />
          {matchA && <p className="hint">↩ Links to existing {matchA.name}</p>}
        </div>

        <div className="field">
          <label>Relationship</label>
          {custom ? (
            <>
              <div className="hook-row">
                <input
                  type="text"
                  placeholder="first is the…"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="second is the…"
                  value={counter}
                  onChange={(e) => setCounter(e.target.value)}
                />
              </div>
              <button
                className="chip"
                style={{ marginTop: 10 }}
                onClick={() => {
                  setCustom(false)
                  pickPreset(top && topIsPreset ? top.fromRole : presets[0].role)
                }}
              >
                ‹ Back to presets
              </button>
            </>
          ) : (
            <div className="chips">
              {presets.map((p) => (
                <button
                  key={p.role}
                  className={'chip' + (role === p.role ? ' active' : '')}
                  onClick={() => pickPreset(p.role)}
                >
                  {titleCase(p.role)}
                </button>
              ))}
              <button
                className="chip"
                onClick={() => {
                  setCustom(true)
                  setRole('')
                  setCounter('')
                }}
              >
                ＋ Custom
              </button>
            </div>
          )}
          {roleReady && (
            <p className="hint">
              {a || 'First'} is the <em>{role || '…'}</em>, {b || 'second'} is the{' '}
              <em>{counter || role || '…'}</em>.
            </p>
          )}
        </div>

        <div className="field">
          <label>Second profile</label>
          <input
            type="text"
            value={nameB}
            placeholder="Name of a person or pet"
            onChange={(e) => setNameB(e.target.value)}
          />
          {matchB && <p className="hint">↩ Links to existing {matchB.name}</p>}
          {sameName && <p className="hint">Pick two different names.</p>}
        </div>

        <button className="btn primary" disabled={!canSave} onClick={onSave}>
          Add both &amp; link
        </button>
      </div>
    </div>
  )
}
