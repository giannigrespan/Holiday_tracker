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

    // Usa una funzione SECURITY DEFINER che bypassa la RLS per il lookup
    // del viaggio (un utente non membro non può altrimenti leggerlo)
    const { data: tripId, error } = await supabase
      .rpc('join_trip_by_invite_code', { p_invite_code: inviteCode })

    if (error) throw new Error(error.message)
    return tripId
  }

  return { getInviteLink, joinByCode }
}
