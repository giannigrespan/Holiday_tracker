import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { useTrip } from '../hooks/useTrip'
import { formatDate, formatCurrency } from '../lib/formatters'
import TripForm from '../components/trips/TripForm'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { trips, loading, createTrip, deleteTrip } = useTrip()
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const navigate = useNavigate()

  const handleDelete = async (e, tripId) => {
    e.stopPropagation()
    if (!window.confirm('Eliminare questo viaggio? Verranno cancellate anche tutte le spese associate.')) return
    try {
      setDeletingId(tripId)
      await deleteTrip(tripId)
    } catch (err) {
      alert('Errore durante l\'eliminazione: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleCreate = async (data) => {
    const trip = await createTrip(data)
    setShowForm(false)
    navigate(`/trip/${trip.id}/expenses`)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)', padding: '0 0 32px' }}>
      {/* Header */}
      <div style={{
        padding: '56px 20px 20px',
        background: `linear-gradient(180deg, rgba(139,92,246,0.08) 0%, transparent 100%)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 2 }}>
              Bentornato,
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
              {user?.user_metadata?.full_name?.split(' ')[0] ?? 'Viaggiatore'} 👋
            </h1>
          </div>
          <button
            onClick={signOut}
            style={{
              width: 40, height: 40,
              borderRadius: 12,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 16 }}>👤</span>
            )}
          </button>
        </div>
      </div>

      {/* Lista viaggi */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-2)' }}>
            I tuoi viaggi
          </h2>
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              background: 'var(--color-accent)',
              border: 'none',
              borderRadius: 10,
              color: 'white',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            <PlusIcon style={{ width: 16, height: 16 }} />
            Nuovo
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2].map(i => (
              <div key={i} className="card" style={{ height: 100, opacity: 0.4, animation: 'pulse 1.5s ease infinite' }} />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏖️</div>
            <p style={{ color: 'var(--color-text-2)', fontSize: 16, marginBottom: 8 }}>
              Nessun viaggio ancora
            </p>
            <p style={{ color: 'var(--color-text-3)', fontSize: 14 }}>
              Crea il tuo primo viaggio e condividi il link con il tuo compagno
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trips.map((t, i) => {
              const totalSpent = t.expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) ?? 0
              return (
                <button
                  key={t.id}
                  onClick={() => navigate(`/trip/${t.id}/expenses`)}
                  className="animate-fade-in card card-hover"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    width: '100%',
                    padding: 20,
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'var(--color-surface)',
                    display: 'block',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{t.name}</p>
                      {t.destination && (
                        <p style={{ fontSize: 13, color: 'var(--color-text-2)', marginBottom: 8 }}>
                          📍 {t.destination}
                        </p>
                      )}
                      {(t.start_date || t.end_date) && (
                        <p style={{ fontSize: 12, color: 'var(--color-text-3)' }}>
                          {t.start_date && formatDate(t.start_date)}
                          {t.start_date && t.end_date && ' → '}
                          {t.end_date && formatDate(t.end_date)}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-accent)' }}>
                        {formatCurrency(totalSpent, t.currency)}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--color-text-3)' }}>
                        {t.expenses?.length ?? 0} spese
                      </p>
                      {t.created_by === user?.id && (
                        <button
                          onClick={(e) => handleDelete(e, t.id)}
                          disabled={deletingId === t.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            opacity: deletingId === t.id ? 0.5 : 1,
                          }}
                        >
                          <TrashIcon style={{ width: 15, height: 15 }} />
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {showForm && (
        <TripForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
