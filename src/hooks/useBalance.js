import { useMemo } from 'react'
import { calculateBalance } from '../lib/balance'

export function useBalance(expenses, members) {
  return useMemo(() => {
    if (!expenses?.length || !members || members.length < 2) return null
    return calculateBalance(expenses, members[0].user_id, members[1].user_id)
  }, [expenses, members])
}
