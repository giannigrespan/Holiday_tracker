import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'
import { CATEGORY_LABELS, CATEGORY_EMOJIS } from '../../lib/formatters'

const CATEGORIES = ['flight', 'car_rental', 'accommodation', 'food', 'excursion', 'other']

export default function ExpenseForm({ tripId, members, currency, onSubmit, onCancel }) {
  const { user } = useAuth()
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    category:    'food',
    description: '',
    amount:      '',
    currency,
    date:        today,
    paid_by:     user?.id ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) return setError('Inserisci un importo valido')
    if (!form.paid_by) return setError('Seleziona chi ha pagato')
    setLoading(true)
    setError(null)
    try {
      await onSubmit({ ...form, amount: parseFloat(form.amount) })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />

      <div className="animate-slide-up" style={{
        position: 'relative', zIndex: 1,
        width: '100%',
        background: 'var(--color-surface)',
        borderRadius: '24px 24px 0 0',
        padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
        maxHeight: '90dvh',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>💸 Nuova spesa</h2>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <XMarkIcon style={{ width: 24, height: 24, color: 'var(--color-text-2)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Categoria */}
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-2)', marginBottom: 8 }}>Categoria</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat} type="button"
                  onClick={() => setForm(f => ({ ...f, category: cat }))}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 12,
                    border: `1.5px solid ${form.category === cat ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: form.category === cat ? 'rgba(139,92,246,0.12)' : 'var(--color-surface-2)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{CATEGORY_EMOJIS[cat]}</span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: form.category === cat ? 'var(--color-accent-light)' : 'var(--color-text-2)',
                  }}>
                    {CATEGORY_LABELS[cat]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Importo */}
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-2)', marginBottom: 8 }}>Importo</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input-field"
                placeholder="0,00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                style={{ fontSize: 24, fontWeight: 700, textAlign: 'center' }}
              />
              <span style={{
                padding: '12px 14px',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                fontWeight: 700,
                color: 'var(--color-text-2)',
                flexShrink: 0,
              }}>
                {currency}
              </span>
            </div>
          </div>

          {/* Chi ha pagato */}
          {members.length > 1 && (
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-2)', marginBottom: 8 }}>Chi ha pagato?</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {members.map(m => {
                  const profile = m.profiles
                  const isSelected = form.paid_by === m.user_id
                  return (
                    <button
                      key={m.user_id} type="button"
                      onClick={() => setForm(f => ({ ...f, paid_by: m.user_id }))}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: 12,
                        border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        background: isSelected ? 'rgba(139,92,246,0.12)' : 'var(--color-surface-2)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.15s',
                      }}
                    >
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                          👤
                        </div>
                      )}
                      <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? 'var(--color-accent-light)' : 'var(--color-text)' }}>
                        {profile?.full_name?.split(' ')[0] ?? 'Utente'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Descrizione */}
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-2)', marginBottom: 8 }}>
              Descrizione <span style={{ color: 'var(--color-text-3)' }}>(opzionale)</span>
            </label>
            <input
              className="input-field"
              placeholder={`es. ${CATEGORY_LABELS[form.category]}`}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Data */}
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-2)', marginBottom: 8 }}>Data</label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: 'var(--color-danger)', padding: '10px 14px', background: 'var(--color-danger-dim)', borderRadius: 10 }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Salvataggio...' : '💾 Aggiungi spesa'}
          </button>
        </form>
      </div>
    </div>
  )
}
