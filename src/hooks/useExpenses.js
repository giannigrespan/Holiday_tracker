import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useExpenses(tripId) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchExpenses = useCallback(async () => {
    if (!tripId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, profiles!expenses_paid_by_fkey(id, full_name, avatar_url)')
        .eq('trip_id', tripId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setExpenses(data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    if (!tripId) return
    fetchExpenses()

    // Realtime: aggiornamenti istantanei quando il partner aggiunge/modifica spese
    const channel = supabase
      .channel(`expenses:${tripId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `trip_id=eq.${tripId}` },
        () => fetchExpenses()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [tripId, fetchExpenses])

  const addExpense = async ({ category, description, amount, currency, date, paid_by }) => {
    if (!user || !tripId) throw new Error('Dati mancanti')
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        trip_id: tripId,
        paid_by: paid_by ?? user.id,
        category,
        description: description?.trim() || null,
        amount: parseFloat(amount),
        currency,
        date,
      })
      .select('*, profiles!expenses_paid_by_fkey(id, full_name, avatar_url)')
      .single()

    if (error) throw error
    setExpenses(prev => [data, ...prev])
    return data
  }

  const deleteExpense = async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) throw error
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const updateExpense = async (id, updates) => {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select('*, profiles!expenses_paid_by_fkey(id, full_name, avatar_url)')
      .single()

    if (error) throw error
    setExpenses(prev => prev.map(e => e.id === id ? data : e))
    return data
  }

  return { expenses, loading, error, addExpense, deleteExpense, updateExpense }
}
