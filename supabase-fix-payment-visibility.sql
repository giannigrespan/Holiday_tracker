-- =============================================================
-- MIGRATION: fix-payment-visibility
-- Applica questo file nell'SQL Editor di Supabase Dashboard
-- =============================================================

-- Fix 1: join_trip_by_invite_code — gestisci il ri-accesso
-- Problema: se il companion usa di nuovo il link invito dopo essersi
-- già unito, il conteggio dei membri (= 2) lancia un'eccezione.
-- Soluzione: verifica prima se l'utente è già membro e restituisci
-- subito il trip_id senza errori.
CREATE OR REPLACE FUNCTION public.join_trip_by_invite_code(p_invite_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trip_id UUID;
  v_count   INT;
BEGIN
  -- Trova il viaggio (bypassa RLS)
  SELECT id INTO v_trip_id FROM public.trips WHERE invite_code = p_invite_code;

  IF v_trip_id IS NULL THEN
    RAISE EXCEPTION 'Codice invito non valido o scaduto';
  END IF;

  -- Se l'utente è già membro, restituisci il trip_id direttamente
  -- (evita l'errore "già 2 partecipanti" al secondo accesso al link)
  IF EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_id = v_trip_id AND user_id = auth.uid()
  ) THEN
    RETURN v_trip_id;
  END IF;

  -- Controlla il numero di membri (massimo 2 per viaggio)
  SELECT COUNT(*) INTO v_count FROM public.trip_members WHERE trip_id = v_trip_id;

  IF v_count >= 2 THEN
    RAISE EXCEPTION 'Questo viaggio ha già 2 partecipanti';
  END IF;

  -- Aggiunge il nuovo membro
  INSERT INTO public.trip_members (trip_id, user_id, role)
  VALUES (v_trip_id, auth.uid(), 'member');

  RETURN v_trip_id;
END;
$$;

-- Fix 2: profiles_select_members — visibilità del profilo del pagante
-- Problema: quando si visualizzano le spese, il nome di chi ha pagato
-- compare come "—" perché il companion non riesce a vedere il profilo
-- dell'altro membro del viaggio.
-- Soluzione: ricrea la policy per garantire che sia attiva nel DB live.
DROP POLICY IF EXISTS "profiles_select_members" ON public.profiles;

CREATE POLICY "profiles_select_members" ON public.profiles
  FOR SELECT USING (
    id IN (
      SELECT tm.user_id
      FROM   public.trip_members tm
      WHERE  tm.trip_id IN (
        SELECT trip_id
        FROM   public.trip_members
        WHERE  user_id = auth.uid()
      )
    )
  );
