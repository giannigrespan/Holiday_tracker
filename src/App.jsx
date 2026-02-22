import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard    from './components/auth/AuthGuard'
import AppShell     from './components/layout/AppShell'
import Landing      from './pages/Landing'
import Dashboard    from './pages/Dashboard'
import TripDetail   from './pages/TripDetail'
import JoinTrip     from './pages/JoinTrip'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<Landing />} />
        <Route path="/join/:inviteCode"    element={<JoinTrip />} />
        <Route element={<AuthGuard />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard"              element={<Dashboard />} />
            <Route path="/trip/:tripId/expenses"  element={<TripDetail />} />
            <Route path="/trip/:tripId/balance"   element={<TripDetail />} />
            <Route path="/trip/:tripId/places"    element={<TripDetail />} />
            <Route path="/trip/:tripId"           element={<Navigate to="expenses" replace />} />
          </Route>
        </Route>
        <Route path="*" element={
          <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, background: 'var(--color-bg)' }}>
            <div style={{ fontSize: 56 }}>🌊</div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>Pagina non trovata</h1>
            <a href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>← Torna alla home</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}
