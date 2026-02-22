import { useExpenses } from '../hooks/useExpenses'
import { useTrip } from '../hooks/useTrip'
import { useBalance } from '../hooks/useBalance'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency, CATEGORY_LABELS, CATEGORY_EMOJIS, CATEGORY_COLORS } from '../lib/formatters'

export default function BalancePage({ tripId }) {
  const { user } = useAuth()
  const { expenses, loading: expLoading } = useExpenses(tripId)
  const { trip, members, loading: tripLoading } = useTrip(tripId)
  const balance = useBalance(expenses, members)

  const loading = expLoading || tripLoading

  if (loading) {
    return (
      <div className="page-content" style={{ padding: 16 }}>
        {[1,2,3].map(i => <div key={i} className="card" style={{ height: 80, marginBottom: 12, opacity: 0.3 }} />)}
      </div>
    )
  }

  if (members.length < 2) {
    return (
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
        <p style={{ color: 'var(--color-text-2)', fontSize: 16, marginBottom: 8 }}>Aspetta il tuo compagno</p>
        <p style={{ color: 'var(--color-text-3)', fontSize: 14 }}>Il saldo apparirà quando entrambi siete nel viaggio</p>
      </div>
    )
  }

  if (!balance || expenses.length === 0) {
    return (
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
        <p style={{ color: 'var(--color-text-2)', fontSize: 16 }}>Nessuna spesa da contabilizzare</p>
      </div>
    )
  }

  const memberA = members.find(m => m.user_id === members[0].user_id)
  const memberB = members.find(m => m.user_id === members[1].user_id)
  const nameA   = memberA?.profiles?.full_name?.split(' ')[0] ?? 'A'
  const nameB   = memberB?.profiles?.full_name?.split(' ')[0] ?? 'B'

  const debtorName   = balance.debtor   === members[0].user_id ? nameA : nameB
  const creditorName = balance.creditor === members[0].user_id ? nameA : nameB

  const categories = Object.entries(balance.byCategory)

  return (
    <div className="page-content" style={{ padding: 16 }}>

      {/* Card saldo principale */}
      <div className="card animate-fade-in" style={{
        padding: 24,
        marginBottom: 16,
        background: balance.isSettled
          ? 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(52,211,153,0.05))'
          : 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.05))',
        borderColor: balance.isSettled ? 'rgba(52,211,153,0.3)' : 'rgba(139,92,246,0.3)',
      }}>
        {balance.isSettled ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-success)' }}>Siete pari!</p>
            <p style={{ fontSize: 14, color: 'var(--color-text-2)', marginTop: 4 }}>Nessun debito tra voi</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--color-text-2)', marginBottom: 8 }}>
              <strong style={{ color: 'var(--color-text)' }}>{debtorName}</strong> deve a <strong style={{ color: 'var(--color-text)' }}>{creditorName}</strong>
            </p>
            <p style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-accent-light)', lineHeight: 1 }}>
              {formatCurrency(balance.amount, trip?.currency)}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 18 }}>👈</span>
              <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>Da {debtorName} a {creditorName}</span>
            </div>
          </div>
        )}
      </div>

      {/* Totali individuali */}
      <div className="animate-fade-in" style={{ animationDelay: '80ms', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          { name: nameA, total: balance.totalA, userId: members[0].user_id },
          { name: nameB, total: balance.totalB, userId: members[1].user_id },
        ].map(({ name, total, userId }) => {
          const isUser = userId === user?.id
          return (
            <div key={userId} className="card" style={{ padding: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 4 }}>
                {name} {isUser && '(tu)'}
              </p>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>
                {formatCurrency(total, trip?.currency)}
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 4 }}>
                Quota: {formatCurrency(balance.fairShare, trip?.currency)}
              </p>
              <div style={{
                marginTop: 8,
                height: 4,
                borderRadius: 2,
                background: 'var(--color-surface-2)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${balance.grandTotal > 0 ? Math.min(100, (total / balance.grandTotal) * 100) : 50}%`,
                  background: 'var(--color-accent)',
                  borderRadius: 2,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Totale complessivo */}
      <div className="card animate-fade-in" style={{ animationDelay: '120ms', padding: '14px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--color-text-2)' }}>Totale speso</p>
        <p style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(balance.grandTotal, trip?.currency)}</p>
      </div>

      {/* Breakdown categorie */}
      {categories.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '160ms' }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-3)', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Per categoria
          </p>
          <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {categories
              .sort((a, b) => b[1].total - a[1].total)
              .map(([cat, data]) => {
                const pct = balance.grandTotal > 0 ? (data.total / balance.grandTotal) * 100 : 0
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{CATEGORY_EMOJIS[cat]}</span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{CATEGORY_LABELS[cat]}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          {formatCurrency(data.total, trip?.currency)}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-3)', marginLeft: 6 }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--color-surface-2)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: CATEGORY_COLORS[cat],
                        borderRadius: 3,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
