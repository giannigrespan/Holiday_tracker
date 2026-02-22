/**
 * Calcola il saldo netto tra due partecipanti.
 * Ogni spesa è divisa al 50% — chi paga meno deve la differenza all'altro.
 *
 * @param {Array}  expenses  Array di spese dal database
 * @param {string} userAId   UUID del primo partecipante
 * @param {string} userBId   UUID del secondo partecipante
 */
export function calculateBalance(expenses, userAId, userBId) {
  let totalA = 0
  let totalB = 0
  const byCategory = {}

  for (const e of expenses) {
    const amount = parseFloat(e.amount)
    if (e.paid_by === userAId)      totalA += amount
    else if (e.paid_by === userBId) totalB += amount

    const cat = e.category
    if (!byCategory[cat]) byCategory[cat] = { totalA: 0, totalB: 0, total: 0 }
    if (e.paid_by === userAId)      byCategory[cat].totalA += amount
    else if (e.paid_by === userBId) byCategory[cat].totalB += amount
    byCategory[cat].total += amount
  }

  const grandTotal = totalA + totalB
  const fairShare  = grandTotal / 2
  const netBalance = totalA - fairShare  // >0 → B deve ad A

  return {
    totalA:     round(totalA),
    totalB:     round(totalB),
    grandTotal: round(grandTotal),
    fairShare:  round(fairShare),
    debtor:     netBalance > 0 ? userBId : userAId,
    creditor:   netBalance > 0 ? userAId : userBId,
    amount:     round(Math.abs(netBalance)),
    isSettled:  Math.abs(netBalance) < 0.01,
    byCategory,
  }
}

function round(n) {
  return Math.round(n * 100) / 100
}
