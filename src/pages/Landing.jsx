import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'

export default function Landing() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true })
  }, [session, navigate])

  if (loading) return null

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Sfondo decorativo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.2) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.1) 0%, transparent 60%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Griglia decorativa */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
        maskImage: 'radial-gradient(ellipse at 50% 0%, black 0%, transparent 70%)',
      }} />

      {/* Contenuto */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 24px 48px',
        gap: 0,
      }}>

        {/* Logo / Icona */}
        <div className="animate-fade-in" style={{ animationDelay: '0ms', marginBottom: 24 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
          }}>
            ✈️
          </div>
        </div>

        {/* Titolo */}
        <div className="animate-fade-in" style={{ animationDelay: '80ms', textAlign: 'center', marginBottom: 12 }}>
          <h1 style={{
            fontSize: 'clamp(32px, 8vw, 48px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 8,
          }}>
            <span className="text-gradient">Holiday</span>
            <br />
            <span style={{ color: 'var(--color-text)' }}>Tracker</span>
          </h1>
        </div>

        {/* Sottotitolo */}
        <div className="animate-fade-in" style={{ animationDelay: '140ms', textAlign: 'center', marginBottom: 48 }}>
          <p style={{
            fontSize: 16,
            color: 'var(--color-text-2)',
            lineHeight: 1.6,
            maxWidth: 280,
          }}>
            Traccia le spese, dividi i costi,<br />
            scopri i posti migliori intorno a te.
          </p>
        </div>

        {/* Feature pills */}
        <div className="animate-fade-in" style={{
          animationDelay: '200ms',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'center',
          marginBottom: 48,
        }}>
          {['✈️ Aereo', '🚗 Auto', '🏨 Hotel', '🍽️ Cibo', '🗺️ Escursioni'].map(label => (
            <span key={label} style={{
              padding: '6px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 100,
              fontSize: 13,
              color: 'var(--color-text-2)',
            }}>
              {label}
            </span>
          ))}
        </div>

        {/* Login button */}
        <div className="animate-fade-in" style={{
          animationDelay: '260ms',
          width: '100%',
          maxWidth: 340,
        }}>
          <GoogleLoginButton size="lg" />
          <p style={{
            textAlign: 'center',
            marginTop: 16,
            fontSize: 12,
            color: 'var(--color-text-3)',
          }}>
            Accedi e inizia subito — è gratis
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        padding: '16px 24px',
        fontSize: 12,
        color: 'var(--color-text-3)',
      }}>
        Sincronizzazione real-time · Divisione automatica · Mappe offline-ready
      </div>
    </div>
  )
}
