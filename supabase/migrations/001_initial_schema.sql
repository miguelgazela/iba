-- ============================================
-- IBA - Initial Database Schema
-- All tables prefixed with iba_ to allow
-- sharing the Supabase project with other apps
-- ============================================

-- 1. PROFILES TABLE (linked to auth.users)
-- ============================================
CREATE TABLE public.iba_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.iba_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "IBA: Users can view own profile"
  ON public.iba_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "IBA: Users can update own profile"
  ON public.iba_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. CLIENTS TABLE
-- ============================================
CREATE TABLE public.iba_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.iba_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nif TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, nif)
);

ALTER TABLE public.iba_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "IBA: Users can view own clients"
  ON public.iba_clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "IBA: Users can insert own clients"
  ON public.iba_clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "IBA: Users can update own clients"
  ON public.iba_clients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "IBA: Users can delete own clients"
  ON public.iba_clients FOR DELETE
  USING (auth.uid() = user_id);

-- 3. VEHICLES TABLE
-- ============================================
CREATE TABLE public.iba_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.iba_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.iba_profiles(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  license_plate TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  iuc_month INTEGER NOT NULL CHECK (iuc_month >= 1 AND iuc_month <= 12),
  iuc_amount NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, license_plate)
);

ALTER TABLE public.iba_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "IBA: Users can view own vehicles"
  ON public.iba_vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "IBA: Users can insert own vehicles"
  ON public.iba_vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "IBA: Users can update own vehicles"
  ON public.iba_vehicles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "IBA: Users can delete own vehicles"
  ON public.iba_vehicles FOR DELETE
  USING (auth.uid() = user_id);

-- 4. IUC PAYMENTS TABLE
-- ============================================
CREATE TABLE public.iba_iuc_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.iba_vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.iba_profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  paid_at DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(vehicle_id, year)
);

ALTER TABLE public.iba_iuc_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "IBA: Users can view own payments"
  ON public.iba_iuc_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "IBA: Users can insert own payments"
  ON public.iba_iuc_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "IBA: Users can update own payments"
  ON public.iba_iuc_payments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "IBA: Users can delete own payments"
  ON public.iba_iuc_payments FOR DELETE
  USING (auth.uid() = user_id);

-- 5. TRIGGERS
-- ============================================

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.iba_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.iba_profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER iba_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.iba_handle_new_user();

-- Auto-update updated_at on row update
CREATE OR REPLACE FUNCTION public.iba_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER iba_set_updated_at BEFORE UPDATE ON public.iba_profiles
  FOR EACH ROW EXECUTE FUNCTION public.iba_update_updated_at();

CREATE TRIGGER iba_set_updated_at BEFORE UPDATE ON public.iba_clients
  FOR EACH ROW EXECUTE FUNCTION public.iba_update_updated_at();

CREATE TRIGGER iba_set_updated_at BEFORE UPDATE ON public.iba_vehicles
  FOR EACH ROW EXECUTE FUNCTION public.iba_update_updated_at();

-- 6. INDEXES
-- ============================================
CREATE INDEX idx_iba_clients_user_id ON public.iba_clients(user_id);
CREATE INDEX idx_iba_clients_nif ON public.iba_clients(user_id, nif);
CREATE INDEX idx_iba_vehicles_client_id ON public.iba_vehicles(client_id);
CREATE INDEX idx_iba_vehicles_user_id ON public.iba_vehicles(user_id);
CREATE INDEX idx_iba_vehicles_iuc_month ON public.iba_vehicles(user_id, iuc_month);
CREATE INDEX idx_iba_iuc_payments_vehicle_id ON public.iba_iuc_payments(vehicle_id);
CREATE INDEX idx_iba_iuc_payments_year ON public.iba_iuc_payments(vehicle_id, year);
