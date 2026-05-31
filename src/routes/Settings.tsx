import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import type { AppData } from '../types'
import { getStorageStatus, type StorageStatus } from '../lib/persist'
import AppBar from '../components/AppBar'

export default function Settings() {
  const circles = useStore((s) => s.circles)
  const entities = useStore((s) => s.entities)
  const relationships = useStore((s) => s.relationships)
  const replaceAll = useStore((s) => s.replaceAll)
  const resetToSeed = useStore((s) => s.resetToSeed)
  const clearAll = useStore((s) => s.clearAll)
  const fileRef = useRef<HTMLInputElement>(null)
  const [storage, setStorage] = useState<StorageStatus | null>(null)

  useEffect(() => {
    void getStorageStatus().then(setStorage)
  }, [entities.length, circles.length, relationships.length])

  const onExport = () => {
    const data: AppData = { circles, entities, relationships }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `ufactz-backup-${stamp}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text) as Partial<AppData>
      if (!Array.isArray(data.circles) || !Array.isArray(data.entities)) {
        throw new Error('shape')
      }
      if (
        confirm(
          `Replace everything with this backup? (${data.circles.length} circles, ${data.entities.length} profiles)`,
        )
      ) {
        replaceAll({
          circles: data.circles,
          entities: data.entities,
          relationships: data.relationships ?? [],
        })
        alert('Backup restored.')
      }
    } catch {
      alert('That file does not look like a valid ufactz backup.')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="app">
      <AppBar title="Settings" backTo="/" />
      <div className="content">
        <div className="section-title">Your data</div>
        <p className="hint" style={{ marginBottom: 14 }}>
          Everything lives privately on this device — {circles.length}{' '}
          {circles.length === 1 ? 'circle' : 'circles'}, {entities.length}{' '}
          {entities.length === 1 ? 'profile' : 'profiles'}, {relationships.length}{' '}
          {relationships.length === 1 ? 'link' : 'links'}. Back it up now and then, and to
          move it to a new phone.
        </p>

        {storage && (
          <div className="fact" style={{ marginBottom: 14 }}>
            <span className="k">On-device storage</span>
            <span className="v">
              {storage.persistent ? '🔒 Durable' : '⚠ Best-effort'} · ~{storage.usageKb} KB
            </span>
          </div>
        )}

        <div className="stack">
          <button className="btn" onClick={onExport}>
            ⬇ Export backup (.json)
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            ⬆ Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={onImport}
          />
        </div>

        <div className="section-title">Reset</div>
        <div className="stack">
          <button
            className="btn ghost"
            onClick={() => {
              if (confirm('Reset to the starter example data?')) resetToSeed()
            }}
          >
            Restore example data
          </button>
          <button
            className="btn danger"
            onClick={() => {
              if (confirm('Delete ALL circles, profiles and links? This cannot be undone.'))
                clearAll()
            }}
          >
            Delete everything
          </button>
        </div>

        <p className="hint" style={{ marginTop: 24 }}>
          Tip: to install — open this page in Chrome, tap the ⋮ menu, then “Add to
          Home screen”. It’ll then open full-screen like a normal app.
        </p>
      </div>
    </div>
  )
}
