-- =====================================================
-- HOLIDAY TRACKER — Schema Database Supabase
-- Esegui questo file nell'SQL Editor di Supabase
-- =====================================================

-- 1. PROFILI UTENTE (estende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VIAGGI
CREATE TABLE IF NOT EXISTS public.trips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  destination TEXT,
  start_date  DATE,
  end_date    DATE,
  currency    TEXT NOT NULL DEFAULT 'EUR',
  invite_code TEXT UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8),
  created_by  UUID NOT NULL REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEMBRI DEL VIAGGIO (max 2 per viaggio)
CREATE TABLE IF NOT EXISTS public.trip_members (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id   UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member',  -- 'owner' | 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- 4. CATEGORIE SPESE
DO $$ BEGIN
  CREATE TYPE expense_category AS ENUM (
    'flight', 'car_rental', 'accommodation', 'food', 'excursion', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. SPESE
CREATE TABLE IF NOT EXISTS public.expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  paid_by     UUID NOT NULL REFERENCES public.profiles(id),
  category    expense_category NOT NULL,
  description TEXT,
  amount      NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency    TEXT NOT NULL DEFAULT 'EUR',
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TRIGGER: aggiorna updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trips_updated_at    ON public.trips;
DROP TRIGGER IF EXISTS expenses_updated_at ON public.expenses;

CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. TRIGGER: crea profilo al primo login
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 8. ROW LEVEL SECURITY
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses     ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_members" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Permetti ai membri dello stesso viaggio di vedere i profili altrui (per mostrare i nomi)
CREATE POLICY "profiles_select_members" ON public.profiles
  FOR SELECT USING (
    id IN (
      SELECT tm.user_id FROM public.trip_members tm
      WHERE tm.trip_id IN (
        SELECT trip_id FROM public.trip_members WHERE user_id = auth.uid()
      )
    )
  );

-- TRIPS
DROP POLICY IF EXISTS "trips_select_members"  ON public.trips;
DROP POLICY IF EXISTS "trips_insert_auth"     ON public.trips;
DROP POLICY IF EXISTS "trips_update_owner"    ON public.trips;
DROP POLICY IF EXISTS "trips_delete_owner"    ON public.trips;

CREATE POLICY "trips_select_members" ON public.trips
  FOR SELECT USING (
    id IN (SELECT trip_id FROM public.trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "trips_insert_auth" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "trips_update_owner" ON public.trips
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "trips_delete_owner" ON public.trips
  FOR DELETE USING (auth.uid() = created_by);

-- TRIP_MEMBERS
DROP POLICY IF EXISTS "trip_members_select" ON public.trip_members;
DROP POLICY IF EXISTS "trip_members_insert" ON public.trip_members;
DROP POLICY IF EXISTS "trip_members_delete" ON public.trip_members;

CREATE POLICY "trip_members_select" ON public.trip_members
  FOR SELECT USING (
    trip_id IN (SELECT trip_id FROM public.trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "trip_members_insert" ON public.trip_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trip_members_delete" ON public.trip_members
  FOR DELETE USING (auth.uid() = user_id);

-- EXPENSES
DROP POLICY IF EXISTS "expenses_select_members"  ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert_members"  ON public.expenses;
DROP POLICY IF EXISTS "expenses_update_paid_by"  ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete_paid_by"  ON public.expenses;

CREATE POLICY "expenses_select_members" ON public.expenses
  FOR SELECT USING (
    trip_id IN (SELECT trip_id FROM public.trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "expenses_insert_members" ON public.expenses
  FOR INSERT WITH CHECK (
    trip_id IN (SELECT trip_id FROM public.trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "expenses_update_paid_by" ON public.expenses
  FOR UPDATE USING (auth.uid() = paid_by);

CREATE POLICY "expenses_delete_paid_by" ON public.expenses
  FOR DELETE USING (auth.uid() = paid_by);

-- 9. FUNZIONE: join tramite invite code (bypassa RLS per il lookup del viaggio)
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

  -- Controlla il numero di membri
  SELECT COUNT(*) INTO v_count FROM public.trip_members WHERE trip_id = v_trip_id;

  IF v_count >= 2 THEN
    RAISE EXCEPTION 'Questo viaggio ha già 2 partecipanti';
  END IF;

  -- Aggiunge il membro (ignora se già presente)
  INSERT INTO public.trip_members (trip_id, user_id, role)
  VALUES (v_trip_id, auth.uid(), 'member')
  ON CONFLICT (trip_id, user_id) DO NOTHING;

  RETURN v_trip_id;
END;
$$;

-- 10. REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_members;
