/*
  # TokenFlow Schema

  ## Overview
  Creates the full data model for TokenFlow, an async decision-making system.

  ## New Tables

  1. **profiles** - User accounts with role, title, token balance tracking
     - id: references auth.users
     - full_name, role (requester/reviewer/both), title
     - token_balance, tokens_used_this_week, week_reset_at

  2. **expertise_areas** - Reviewer's declared areas of expertise with capacity limits
     - reviewer_id -> profiles
     - name, description, weekly_capacity, tokens_received_this_week

  3. **decision_requests** - Core async decision requests
     - requester_id, reviewer_id -> profiles
     - expertise_area_id -> expertise_areas
     - title, context, alternatives_considered, deadline
     - decision_type: approval | sign_off | feedback | blocking_concern
     - requester_type: pm | developer
     - status: pending | in_review | approved | rejected | needs_info | withdrawn
     - tokens_spent, notion_link, responded_at

  4. **request_responses** - Reviewer responses to requests
     - request_id -> decision_requests
     - reviewer_id -> profiles
     - response_type: approved | rejected | needs_info | feedback
     - comment

  5. **token_transactions** - Immutable ledger of token movements
     - from_user_id, to_user_id -> profiles
     - request_id -> decision_requests
     - amount, transaction_type: spend | refund

  ## Security
  - RLS enabled on all tables
  - Authenticated users can read all profiles (for user directory)
  - Users can only update their own profile
  - Requests visible to requester and reviewer
  - Responses visible to requester and reviewer of the request
  - Transactions visible to participants
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'requester' CHECK (role IN ('requester', 'reviewer', 'both')),
  title text NOT NULL DEFAULT '',
  avatar_url text,
  token_balance integer NOT NULL DEFAULT 10,
  tokens_used_this_week integer NOT NULL DEFAULT 0,
  week_reset_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Expertise areas
CREATE TABLE IF NOT EXISTS expertise_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  weekly_capacity integer NOT NULL DEFAULT 3,
  tokens_received_this_week integer NOT NULL DEFAULT 0,
  week_reset_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE expertise_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read expertise areas"
  ON expertise_areas FOR SELECT
  TO authenticated
  USING (true);

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

-- Decision requests
CREATE TABLE IF NOT EXISTS decision_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expertise_area_id uuid NOT NULL REFERENCES expertise_areas(id) ON DELETE CASCADE,
  title text NOT NULL,
  decision_type text NOT NULL CHECK (decision_type IN ('approval', 'sign_off', 'feedback', 'blocking_concern')),
  requester_type text NOT NULL CHECK (requester_type IN ('pm', 'developer')),
  context text NOT NULL DEFAULT '',
  alternatives_considered text NOT NULL DEFAULT '',
  deadline date NOT NULL,
  notion_link text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'needs_info', 'withdrawn')),
  tokens_spent integer NOT NULL DEFAULT 1,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE decision_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requesters can read own requests"
  ON decision_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = reviewer_id);

CREATE POLICY "Requesters can create requests"
  ON decision_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Reviewers can update request status"
  ON decision_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id OR auth.uid() = requester_id)
  WITH CHECK (auth.uid() = reviewer_id OR auth.uid() = requester_id);

-- Request responses
CREATE TABLE IF NOT EXISTS request_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES decision_requests(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  response_type text NOT NULL CHECK (response_type IN ('approved', 'rejected', 'needs_info', 'feedback')),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE request_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read responses"
  ON request_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM decision_requests dr
      WHERE dr.id = request_id
      AND (dr.requester_id = auth.uid() OR dr.reviewer_id = auth.uid())
    )
  );

CREATE POLICY "Reviewers can insert responses"
  ON request_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- Token transactions (append-only ledger)
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES decision_requests(id) ON DELETE CASCADE,
  amount integer NOT NULL DEFAULT 1,
  transaction_type text NOT NULL CHECK (transaction_type IN ('spend', 'refund')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read own transactions"
  ON token_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "System can insert transactions"
  ON token_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_decision_requests_requester ON decision_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_decision_requests_reviewer ON decision_requests(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_decision_requests_status ON decision_requests(status);
CREATE INDEX IF NOT EXISTS idx_expertise_areas_reviewer ON expertise_areas(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_request_responses_request ON request_responses(request_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_from ON token_transactions(from_user_id);

-- Function to auto-create profile on sign up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
