import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useTrip(tripId = null) {
  const { user } = useAuth()
  const [trips, setTrips]       = useState([])
  const [trip, setTrip]         = useState(null)
  const [members, setMembers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  // Lista tutti i viaggi dell'utente
  const fetchTrips = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          trip_members!inner(user_id),
          expenses(amount)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTrips(data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Carica un singolo viaggio con i membri
  const fetchTrip = useCallback(async () => {
    if (!tripId || !user) return
    setLoading(true)
    try {
      const [tripRes, membersRes] = await Promise.all([
        supabase.from('trips').select('*').eq('id', tripId).single(),
        supabase
          .from('trip_members')
          .select('*, profiles(id, full_name, avatar_url, email)')
          .eq('trip_id', tripId),
      ])
      if (tripRes.error) throw tripRes.error
      setTrip(tripRes.data)
      setMembers(membersRes.data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [tripId, user])

  useEffect(() => {
    if (tripId) fetchTrip()
    else        fetchTrips()
  }, [tripId, fetchTrip, fetchTrips])

  const createTrip = async ({ name, destination, start_date, end_date, currency = 'EUR' }) => {
    if (!user) throw new Error('Non autenticato')

    // Crea il viaggio
    const { data: newTrip, error: tripError } = await supabase
      .from('trips')
      .insert({ name, destination, start_date, end_date, currency, created_by: user.id })
      .select()
      .single()

    if (tripError) throw tripError

    // Aggiunge il creatore come owner
    const { error: memberError } = await supabase
      .from('trip_members')
      .insert({ trip_id: newTrip.id, user_id: user.id, role: 'owner' })

    if (memberError) throw memberError

    await fetchTrips()
    return newTrip
  }

  const deleteTrip = async (id) => {
    const { error } = await supabase.from('trips').delete().eq('id', id)
    if (error) throw error
    setTrips(prev => prev.filter(t => t.id !== id))
  }

  return { trips, trip, members, loading, error, createTrip, deleteTrip, refetch: tripId ? fetchTrip : fetchTrips }
}
