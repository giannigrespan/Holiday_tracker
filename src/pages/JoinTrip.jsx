import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useInvite } from '../hooks/useInvite'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'

export default function JoinTrip() {
  const { inviteCode } = useParams()
  const { user, loading: authLoading } = useAuth()
  const { joinByCode } = useInvite()
  const navigate = useNavigate()
  const [status, setStatus]   = useState('idle')   // idle | joining | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) return  // Mostra login

    const join = async () => {
      setStatus('joining')
      try {
        const tripId = await joinByCode(inviteCode)
        setStatus('success')
        setTimeout(() => navigate(`/trip/${tripId}/expenses`, { replace: true }), 1200)
      } catch (e) {
        setStatus('error')
        setMessage(e.message)
      }
    }
    join()
  }, [user, authLoading, inviteCode, joinByCode, navigate])

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--color-bg)',
      gap: 24,
    }}>
      <div style={{ fontSize: 56 }}>
        {status === 'error' ? '❌' : status === 'success' ? '🎉' : '✈️'}
      </div>

      {authLoading ? (
        <p style={{ color: 'var(--color-text-2)' }}>Caricamento...</p>
      ) : !user ? (
        <div style={{ textAlign: 'center', maxWidth: 320, width: '100%' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Sei stato invitato!</h1>
          <p style={{ color: 'var(--color-text-2)', marginBottom: 32, lineHeight: 1.5 }}>
            Accedi con Google per unirti al viaggio con codice <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-light)' }}>{inviteCode?.toUpperCase()}</strong>
          </p>
          <GoogleLoginButton />
        </div>
      ) : status === 'joining' ? (
        <>
          <div style={{
            width: 40, height: 40,
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-accent)',
            borderRadius: '50%',
          }} className="animate-spin-slow" />
          <p style={{ color: 'var(--color-text-2)' }}>Unione al viaggio...</p>
        </>
      ) : status === 'success' ? (
        <>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Benvenuto nel viaggio!</h2>
          <p style={{ color: 'var(--color-text-2)' }}>Reindirizzamento...</p>
        </>
      ) : (
        <>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Ops, qualcosa è andato storto</h2>
          <p style={{ color: 'var(--color-danger)', textAlign: 'center' }}>{message}</p>
          <button onClick={() => navigate('/')} className="btn-secondary" style={{ maxWidth: 280 }}>
            Torna alla home
          </button>
        </>
      )}
    </div>
  )
}
