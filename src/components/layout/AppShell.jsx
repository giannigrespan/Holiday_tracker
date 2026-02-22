import { Outlet, useParams, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'

// AppShell avvolge tutte le pagine protette.
// Mostra la BottomNav solo dentro le pagine di un viaggio (/trip/:tripId/*)
export default function AppShell() {
  const { tripId } = useParams()
  const { pathname } = useLocation()
  const showNav = !!tripId && !pathname.endsWith('/new')

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      {showNav && <BottomNav />}
    </div>
  )
}
