import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'JPY']

export default function TripForm({ onSubmit, onCancel }) {
  const [form, setForm]     = useState({ name: '', destination: '', start_date: '', end_date: '', currency: 'EUR' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Il nome del viaggio è obbligatorio')
    setLoading(true)
    setError(null)
    try {
      await onSubmit(form)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'flex-end',
    }}>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      />

      {/* Bottom Sheet */}
      <div className="animate-slide-up" style={{
        position: 'relative', zIndex: 1,
        width: '100%',
        background: 'var(--color-surface)',
        borderRadius: '24px 24px 0 0',
        padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>✈️ Nuovo viaggio</h2>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <XMarkIcon style={{ width: 24, height: 24, color: 'var(--color-text-2)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-2)', marginBottom: 6 }}>
              Nome viaggio *
            </label>
            <input
              className="input-field"
              placeholder="es. Estate a Siviglia"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-2)', marginBottom: 6 }}>
              Destinazione
            </label>
            <input
              className="input-field"
              placeholder="es. Siviglia, Spagna"
              value={form.destination}
              onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-2)', marginBottom: 6 }}>
                Inizio
              </label>
              <input
                type="date"
                className="input-field"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-2)', marginBottom: 6 }}>
                Fine
              </label>
              <input
                type="date"
                className="input-field"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-2)', marginBottom: 6 }}>
              Valuta
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {CURRENCIES.map(c => (
                <button
                  key={c} type="button"
                  onClick={() => setForm(f => ({ ...f, currency: c }))}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: 10,
                    border: `1px solid ${form.currency === c ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: form.currency === c ? 'rgba(139,92,246,0.15)' : 'var(--color-surface-2)',
                    color: form.currency === c ? 'var(--color-accent-light)' : 'var(--color-text-2)',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: 'var(--color-danger)', padding: '10px 14px', background: 'var(--color-danger-dim)', borderRadius: 10 }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creazione...' : '🚀 Crea viaggio'}
          </button>
        </form>
      </div>
    </div>
  )
}
