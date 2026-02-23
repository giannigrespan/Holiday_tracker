import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { useExpenses } from '../hooks/useExpenses'
import { useTrip } from '../hooks/useTrip'
import { formatDateShort, formatCurrency, CATEGORY_LABELS, CATEGORY_EMOJIS, CATEGORY_COLORS } from '../lib/formatters'
import ExpenseForm from '../components/expenses/ExpenseForm'

function groupByDate(expenses) {
  const groups = {}
  for (const e of expenses) {
    const key = e.date
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
}

export default function ExpensesPage({ tripId }) {
  const { user } = useAuth()
  const { expenses, loading, addExpense, deleteExpense } = useExpenses(tripId)
  const { trip, members } = useTrip(tripId)
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const handleAdd = async (data) => {
    await addExpense(data)
    setShowForm(false)
  }

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id)
    } catch (e) {
      alert(e.message)
    }
    setDeleteId(null)
  }

  const grouped = groupByDate(expenses)

  return (
    <div className="page-content" style={{ padding: '16px 16px' }}>
      {/* Totale veloce */}
      {expenses.length > 0 && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 2 }}>Totale viaggio</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-accent)' }}>
              {formatCurrency(expenses.reduce((s, e) => s + parseFloat(e.amount), 0), trip?.currency)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 2 }}>{expenses.length} spese</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-2)' }}>{members.length} partecipanti</p>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className="card" style={{ height: 68, opacity: 0.3 }} />)}
        </div>
      ) : expenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🧾</div>
          <p style={{ color: 'var(--color-text-2)', fontSize: 16, marginBottom: 8 }}>Nessuna spesa ancora</p>
          <p style={{ color: 'var(--color-text-3)', fontSize: 14 }}>
            Aggiungi la prima spesa toccando il + in basso
          </p>
        </div>
      ) : (
        grouped.map(([date, items]) => (
          <div key={date} style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {formatDateShort(date)}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(expense => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  currency={trip?.currency}
                  isOwn={expense.paid_by === user?.id}
                  members={members}
                  onDelete={() => setDeleteId(expense.id)}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* FAB aggiungi */}
      <button
        onClick={() => setShowForm(true)}
        style={{
          position: 'fixed',
          bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
          right: 20,
          width: 56, height: 56,
          borderRadius: 18,
          background: 'var(--color-accent)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(139,92,246,0.45)',
          zIndex: 50,
        }}
      >
        <PlusIcon style={{ width: 26, height: 26, color: 'white' }} />
      </button>

      {showForm && (
        <ExpenseForm
          tripId={tripId}
          members={members}
          currency={trip?.currency ?? 'EUR'}
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Confirm delete */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={() => setDeleteId(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
          <div className="card animate-fade-in" style={{ position: 'relative', padding: 24, maxWidth: 320, width: '100%' }}>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Elimina spesa?</p>
            <p style={{ fontSize: 14, color: 'var(--color-text-2)', marginBottom: 20 }}>Questa azione non può essere annullata.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteId(null)} className="btn-secondary" style={{ flex: 1 }}>Annulla</button>
              <button
                onClick={() => handleDelete(deleteId)}
                style={{ flex: 1, background: 'var(--color-danger-dim)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', borderRadius: 12, padding: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ExpenseItem({ expense, currency, isOwn, members, onDelete }) {
  const [pressed, setPressed] = useState(false)

  return (
    <div
      className="card"
      style={{
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transition: 'transform 0.15s',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
      }}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {/* Icona categoria */}
      <div style={{
        width: 40, height: 40,
        borderRadius: 12,
        background: `${CATEGORY_COLORS[expense.category]}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>
        {CATEGORY_EMOJIS[expense.category]}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
          {expense.description || CATEGORY_LABELS[expense.category]}
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-text-3)' }}>
          {(() => {
            const name =
              members?.find(m => m.user_id === expense.paid_by)?.profiles?.full_name
              ?? expense.profiles?.full_name
            return `Pagato da ${name?.split(' ')[0] ?? '—'}`
          })()}
        </p>
      </div>

      {/* Importo + elimina */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 16, color: isOwn ? 'var(--color-success)' : 'var(--color-text)' }}>
          {formatCurrency(expense.amount, currency)}
        </p>
        {isOwn && (
          <button
            onClick={onDelete}
            style={{ fontSize: 11, color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 2 }}
          >
            Elimina
          </button>
        )}
      </div>
    </div>
  )
}
