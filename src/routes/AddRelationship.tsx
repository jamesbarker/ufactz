import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useStore, useEntity } from '../store'
import { ROLE_PAIRS, counterRole, titleCase } from '../lib/vocab'
import AppBar from '../components/AppBar'
import Avatar from '../components/Avatar'

export default function AddRelationship() {
  const { entityId } = useParams()
  const navigate = useNavigate()
  const me = useEntity(entityId)
  const entities = useStore((s) => s.entities)
  const addEntity = useStore((s) => s.addEntity)
  const addRelationship = useStore((s) => s.addRelationship)

  // step: 'role' (pick the role) → 'target' (pick/create the other card)
  const [step, setStep] = useState<'role' | 'target'>('role')
  const [custom, setCustom] = useState(false)
  const [role, setRole] = useState('')
  const [counter, setCounter] = useState('')
  const [query, setQuery] = useState('')

  if (!me) return <Navigate to="/" replace />

  const backToRoles = () => {
    setStep('role')
    setCustom(false)
    setRole('')
    setCounter('')
  }

  const pickPreset = (r: string) => {
    setRole(r)
    setCounter(counterRole(r))
    setCustom(false)
    setStep('target')
  }

  const startCustom = () => {
    setRole('')
    setCounter('')
    setCustom(true)
    setStep('target')
  }

  const roleReady = role.trim().length > 0

  const link = (toId: string) => {
    if (!roleReady) return
    addRelationship({
      fromId: me.id,
      toId,
      fromRole: role.trim(),
      toRole: (counter.trim() || role.trim()),
    })
    navigate(`/entity/${me.id}`, { replace: true })
  }

  const createAndLink = () => {
    const name = query.trim()
    if (!name || !roleReady) return
    // New card joins the same circles as this one, so it shows up alongside.
    const id = addEntity({ name, circleIds: me.circleIds })
    link(id)
  }

  // ---- Step 1: choose the role this card plays ----
  if (step === 'role') {
    const roles = ROLE_PAIRS.filter(
      (p, i, arr) => arr.findIndex((x) => x.role === p.role) === i,
    )
    return (
      <div className="app">
        <AppBar title="Add relationship" backTo={`/entity/${me.id}`} />
        <div className="content">
          <p className="hint" style={{ marginBottom: 14 }}>
            <strong>{me.name}</strong> is the…
          </p>
          <div className="chips">
            {roles.map((p) => (
              <button key={p.role} className="chip" onClick={() => pickPreset(p.role)}>
                {titleCase(p.role)}
              </button>
            ))}
            <button className="chip" onClick={startCustom}>
              ＋ Custom
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Step 2: choose / create the other card ----
  const q = query.trim().toLowerCase()
  const candidates = entities
    .filter((e) => e.id !== me.id && e.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 20)
  const exactMatch = entities.some(
    (e) => e.id !== me.id && e.name.trim().toLowerCase() === q,
  )
  const canCreate = q.length > 0 && !exactMatch

  return (
    <div className="app">
      <AppBar title="Add relationship" backTo={`/entity/${me.id}`} />
      <div className="content">
        {custom ? (
          <div className="field">
            <button className="chip" style={{ marginBottom: 12 }} onClick={backToRoles}>
              ‹ Back to roles
            </button>
            <label>Roles</label>
            <div className="hook-row">
              <input
                type="text"
                placeholder={`${me.name} is the…`}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <input
                type="text"
                placeholder="they are the…"
                value={counter}
                onChange={(e) => setCounter(e.target.value)}
              />
            </div>
            <p className="hint">
              e.g. “{me.name} is the <em>{role || 'mentor'}</em>, they are the{' '}
              <em>{counter || role || 'mentee'}</em>”.
            </p>
          </div>
        ) : (
          <button className="chip active" style={{ marginBottom: 16 }} onClick={backToRoles}>
            ‹ {me.name} is the {role}
          </button>
        )}

        {roleReady && (
          <>
            <div className="searchbox">
              <span>🔍</span>
              <input
                value={query}
                autoFocus
                placeholder="Find or create the other profile…"
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {canCreate && (
              <>
                <div className="section-title">Create new</div>
                <div className="row" style={{ marginBottom: 10 }}>
                  <Avatar name={query} />
                  <div className="meta">
                    <div className="name">{query.trim()}</div>
                    <div className="sub">New profile</div>
                  </div>
                </div>
                <button className="btn primary" onClick={createAndLink}>
                  Create “{query.trim()}” &amp; link
                </button>
              </>
            )}

            {candidates.length > 0 && (
              <>
                <div className="section-title">Existing</div>
                <div className="list">
                  {candidates.map((e) => (
                    <button key={e.id} className="row" onClick={() => link(e.id)}>
                      <Avatar name={e.name} emoji={e.emoji} />
                      <div className="meta">
                        <div className="name">{e.name}</div>
                      </div>
                      <span className="chev">＋</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {!canCreate && candidates.length === 0 && (
              <p className="hint">
                Type a name to find an existing profile or create a new one.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
