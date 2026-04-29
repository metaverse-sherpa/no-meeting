/*
  # Fix RLS Policies and Function Security

  ## Problems Fixed

  1. **Overly permissive RLS policies** — All tables had "Allow all" policies using
     `USING (true)` / `WITH CHECK (true)`, granting unrestricted read/write to any
     authenticated or anonymous user. These are replaced with ownership-scoped policies.

  2. **handle_new_user mutable search_path** — The trigger function lacked a fixed
     `search_path`, making it vulnerable to search_path hijacking. Fixed by adding
     `SET search_path = public, pg_temp`.

  3. **Public/authenticated EXECUTE on SECURITY DEFINER function** — `handle_new_user`
     is a trigger function and should never be callable via the REST API. Execute
     permission is revoked from `anon` and `authenticated`.

  ## Policy Changes Per Table

  ### profiles
  - DROP: Allow all profile inserts (WITH CHECK true)
  - DROP: Allow all profile updates (USING true / WITH CHECK true)
  - KEEP: Allow all profile reads (SELECT — read-only, acceptable for user directory)
  - ADD:  Users can insert own profile — WITH CHECK (auth.uid() = id)
  - ADD:  Users can update own profile — USING/WITH CHECK (auth.uid() = id)

  ### expertise_areas
  - DROP: Allow all expertise inserts (WITH CHECK true)
  - DROP: Allow all expertise updates (USING true / WITH CHECK true)
  - DROP: Allow all expertise deletes (USING true)
  - KEEP: Allow all expertise reads (SELECT — acceptable for reviewer directory)
  - ADD:  Reviewers can insert own expertise areas — WITH CHECK (auth.uid() = reviewer_id)
  - ADD:  Reviewers can update own expertise areas — USING/WITH CHECK (auth.uid() = reviewer_id)
  - ADD:  Reviewers can delete own expertise areas — USING (auth.uid() = reviewer_id)

  ### decision_requests
  - DROP: Allow all request inserts (WITH CHECK true)
  - DROP: Allow all request updates (USING true / WITH CHECK true)
  - KEEP: Allow all request reads (SELECT)
  - ADD:  Requesters can create requests — WITH CHECK (auth.uid() = requester_id)
  - ADD:  Participants can update requests — USING/WITH CHECK (requester_id or reviewer_id)

  ### request_responses
  - DROP: Allow all response inserts (WITH CHECK true)
  - KEEP: Allow all response reads (SELECT)
  - ADD:  Reviewers can insert responses — WITH CHECK (auth.uid() = reviewer_id)

  ### token_transactions
  - DROP: Allow all transaction inserts (WITH CHECK true)
  - KEEP: Allow all transaction reads (SELECT)
  - ADD:  Requester can insert transactions — WITH CHECK (auth.uid() = from_user_id)
*/

-- ============================================================
-- PROFILES
-- ============================================================
DROP POLICY IF EXISTS "Allow all profile inserts" ON profiles;
DROP POLICY IF EXISTS "Allow all profile updates" ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- EXPERTISE AREAS
-- ============================================================
DROP POLICY IF EXISTS "Allow all expertise inserts" ON expertise_areas;
DROP POLICY IF EXISTS "Allow all expertise updates" ON expertise_areas;
DROP POLICY IF EXISTS "Allow all expertise deletes" ON expertise_areas;

CREATE POLICY "Reviewers can insert own expertise areas"
  ON expertise_areas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can update own expertise areas"
  ON expertise_areas FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can delete own expertise areas"
  ON expertise_areas FOR DELETE
  TO authenticated
  USING (auth.uid() = reviewer_id);

-- ============================================================
-- DECISION REQUESTS
-- ============================================================
DROP POLICY IF EXISTS "Allow all request inserts" ON decision_requests;
DROP POLICY IF EXISTS "Allow all request updates" ON decision_requests;

CREATE POLICY "Requesters can create requests"
  ON decision_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Participants can update requests"
  ON decision_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = reviewer_id);

-- ============================================================
-- REQUEST RESPONSES
-- ============================================================
DROP POLICY IF EXISTS "Allow all response inserts" ON request_responses;

CREATE POLICY "Reviewers can insert responses"
  ON request_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- ============================================================
-- TOKEN TRANSACTIONS
-- ============================================================
DROP POLICY IF EXISTS "Allow all transaction inserts" ON token_transactions;

CREATE POLICY "Requester can insert transactions"
  ON token_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

-- ============================================================
-- FIX handle_new_user: search_path + revoke public execute
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role, title)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'requester'),
    COALESCE(NEW.raw_user_meta_data->>'title', '')
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
