import { useState } from 'react'
import { XMarkIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { useInvite } from '../../hooks/useInvite'

export default function InviteModal({ trip, onClose }) {
  const { getInviteLink } = useInvite()
  const [copied, setCopied] = useState(false)
  const link = getInviteLink(trip.invite_code)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />

      <div className="animate-slide-up" style={{
        position: 'relative', zIndex: 1,
        width: '100%',
        background: 'var(--color-surface)',
        borderRadius: '24px 24px 0 0',
        padding: '24px 20px calc(32px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>👫 Invita il tuo compagno</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <XMarkIcon style={{ width: 24, height: 24, color: 'var(--color-text-2)' }} />
          </button>
        </div>

        <p style={{ color: 'var(--color-text-2)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
          Condividi questo link con il tuo compagno di viaggio. Potrà unirti al viaggio <strong style={{ color: 'var(--color-text)' }}>{trip.name}</strong> con un solo tap.
        </p>

        {/* QR Code */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{
            padding: 16,
            background: 'white',
            borderRadius: 16,
            display: 'inline-flex',
          }}>
            <QRCode value={link} size={160} />
          </div>
        </div>

        {/* Codice */}
        <div style={{
          textAlign: 'center',
          marginBottom: 20,
          padding: '12px',
          background: 'var(--color-surface-2)',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
        }}>
          <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginBottom: 4 }}>Codice invito</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-accent-light)' }}>
            {trip.invite_code?.toUpperCase()}
          </p>
        </div>

        {/* Copia link */}
        <button
          onClick={handleCopy}
          className="btn-primary"
          style={{ background: copied ? 'var(--color-success-dim)' : 'var(--color-accent)', border: copied ? '1px solid var(--color-success)' : 'none' }}
        >
          {copied ? (
            <><CheckIcon style={{ width: 18, height: 18, color: 'var(--color-success)' }} />
            <span style={{ color: 'var(--color-success)' }}>Link copiato!</span></>
          ) : (
            <><ClipboardIcon style={{ width: 18, height: 18 }} /> Copia link di invito</>
          )}
        </button>
      </div>
    </div>
  )
}
