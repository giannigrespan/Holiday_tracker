import { useState } from 'react'
import { Outlet, useParams, useLocation } from 'react-router-dom'
import { useTrip } from '../hooks/useTrip'
import TopBar from '../components/layout/TopBar'
import InviteModal from '../components/trips/InviteModal'
import ExpensesPage from './ExpensesPage'
import BalancePage from './BalancePage'
import PlacesPage from './PlacesPage'

export default function TripDetail() {
  const { tripId } = useParams()
  const { trip, members, loading } = useTrip(tripId)
  const [showInvite, setShowInvite] = useState(false)
  const { pathname } = useLocation()

  const tab = pathname.split('/').pop()  // 'expenses' | 'balance' | 'places'

  const subtitleMap = {
    expenses: 'Spese',
    balance:  'Saldo',
    places:   'Luoghi vicini',
  }

  // Mostra invito solo se c'è ancora spazio (meno di 2 membri)
  const canInvite = members.length < 2

  return (
    <>
      <TopBar
        title={loading ? '...' : (trip?.name ?? 'Viaggio')}
        subtitle={trip?.destination ? `📍 ${trip.destination}` : subtitleMap[tab]}
        showBack
        onAction={canInvite ? () => setShowInvite(true) : undefined}
        actionLabel="Invita"
      />

      {/* Render della sotto-pagina corrente */}
      {tab === 'expenses' && <ExpensesPage tripId={tripId} />}
      {tab === 'balance'  && <BalancePage  tripId={tripId} />}
      {tab === 'places'   && <PlacesPage />}

      {showInvite && trip && (
        <InviteModal trip={trip} onClose={() => setShowInvite(false)} />
      )}
    </>
  )
}
