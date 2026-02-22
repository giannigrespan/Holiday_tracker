import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, ShareIcon } from '@heroicons/react/24/outline'

export default function TopBar({ title, subtitle, showBack = false, onAction, actionLabel }) {
  const navigate = useNavigate()

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))',
      background: 'rgba(9,9,11,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 10,
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <ChevronLeftIcon style={{ width: 20, height: 20, color: 'var(--color-text-2)' }} />
        </button>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 1 }}>{subtitle}</p>
        )}
      </div>

      {onAction && (
        <button
          onClick={onAction}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 12px',
            borderRadius: 10,
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-2)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            flexShrink: 0,
            fontFamily: 'var(--font-sans)',
          }}
        >
          <ShareIcon style={{ width: 16, height: 16 }} />
          {actionLabel ?? 'Invita'}
        </button>
      )}
    </div>
  )
}
