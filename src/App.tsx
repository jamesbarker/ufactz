import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useStore } from './store'
import { requestPersistentStorage } from './lib/persist'
import { trackPageView } from './lib/analytics'
import Home from './routes/Home'
import CircleView from './routes/CircleView'
import EntityDetail from './routes/EntityDetail'
import EntityEdit from './routes/EntityEdit'
import AddRelationship from './routes/AddRelationship'
import CircleEdit from './routes/CircleEdit'
import Search from './routes/Search'
import Settings from './routes/Settings'

export default function App() {
  const hydrated = useStore((s) => s.hydrated)
  const location = useLocation()

  useEffect(() => {
    void requestPersistentStorage()
  }, [])

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  if (!hydrated) {
    return (
      <div className="splash">
        <div className="splash-logo">👤</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/circle/new" element={<CircleEdit />} />
      <Route path="/circle/:circleId" element={<CircleView />} />
      <Route path="/circle/:circleId/edit" element={<CircleEdit />} />
      <Route path="/entity/new" element={<EntityEdit />} />
      <Route path="/entity/:entityId" element={<EntityDetail />} />
      <Route path="/entity/:entityId/edit" element={<EntityEdit />} />
      <Route path="/entity/:entityId/relate" element={<AddRelationship />} />
    </Routes>
  )
}
