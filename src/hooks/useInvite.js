import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useInvite() {
  const { user } = useAuth()

  /** Genera il link di invito per un viaggio */
  const getInviteLink = (inviteCode) =>
    `${window.location.origin}/join/${inviteCode}`

  /** Unisce l'utente corrente a un viaggio tramite codice */
  const joinByCode = async (inviteCode) => {
    if (!user) throw new Error('Devi essere autenticato per unirti a un viaggio')

    // 1. Trova il viaggio
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, name')
      .eq('invite_code', inviteCode)
      .single()

    if (tripError || !trip) throw new Error('Codice invito non valido o scaduto')

    // 2. Controlla il numero di membri
    const { count, error: countError } = await supabase
      .from('trip_members')
      .select('id', { count: 'exact', head: true })
      .eq('trip_id', trip.id)

    if (countError) throw countError
    if (count >= 2) throw new Error('Questo viaggio ha già 2 partecipanti')

    // 3. Unisce il membro (ignora se già presente)
    const { error: joinError } = await supabase
      .from('trip_members')
      .insert({ trip_id: trip.id, user_id: user.id, role: 'member' })

    if (joinError) {
      if (joinError.code === '23505') {
        // Già membro — redirect direttamente
        return trip.id
      }
      throw joinError
    }

    return trip.id
  }

  return { getInviteLink, joinByCode }
}
