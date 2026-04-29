/*
  # Seed mock profiles and data

  Inserts 5 fixed mock profiles (bypassing auth.users since we have no auth),
  along with expertise areas and sample requests for demo purposes.

  We relax the profiles FK to not require auth.users so mock UUIDs can be inserted directly.
*/

-- Drop the FK constraint that requires auth.users so we can insert mock profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Also drop the auth trigger since we're not using auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Insert mock profiles (idempotent)
INSERT INTO profiles (id, full_name, role, title, token_balance, tokens_used_this_week, week_reset_at, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alex Chen',      'requester', 'Product Manager',    10, 3, now(), '2025-01-15T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000002', 'Sarah Kim',       'reviewer',  'Tech Architect',      0, 0, now(), '2025-01-10T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000003', 'Marcus Rivera',   'reviewer',  'Design Lead',         0, 0, now(), '2025-01-12T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000004', 'Priya Sharma',    'both',      'Senior Developer',    8, 2, now(), '2025-01-08T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000005', 'Jordan Lee',      'reviewer',  'VP of Product',       0, 0, now(), '2025-01-05T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Insert expertise areas
INSERT INTO expertise_areas (id, reviewer_id, name, description, weekly_capacity, tokens_received_this_week, week_reset_at, created_at)
VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000002', 'Backend Architecture',   'System design, API patterns, database schema decisions',   3, 1, now(), '2025-01-10T10:00:00Z'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000002', 'Infrastructure & DevOps','Cloud architecture, CI/CD, deployment strategies',           2, 0, now(), '2025-01-10T10:00:00Z'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000003', 'Design Systems',         'Component libraries, design tokens, visual consistency',    4, 2, now(), '2025-01-12T10:00:00Z'),
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000003', 'UX Strategy',            'User research, interaction patterns, accessibility',         2, 0, now(), '2025-01-12T10:00:00Z'),
  ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000005', 'Product Strategy',       'Roadmap decisions, prioritization, market fit',             2, 1, now(), '2025-01-05T10:00:00Z'),
  ('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000005', 'Go-to-Market',           'Launch plans, pricing, positioning',                        1, 0, now(), '2025-01-05T10:00:00Z'),
  ('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000004', 'Frontend Architecture',  'React patterns, state management, performance',             3, 1, now(), '2025-01-08T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Insert sample decision requests
INSERT INTO decision_requests (id, requester_id, reviewer_id, expertise_area_id, title, decision_type, requester_type, context, alternatives_considered, deadline, status, tokens_spent, responded_at, created_at)
VALUES
  (
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0001-000000000001',
    'Migrate payment service to event-driven architecture',
    'sign_off', 'pm',
    'We need to decouple the payment processing from the main order flow. The current synchronous approach causes cascading failures when the payment service is slow. I propose moving to an event-driven model using our existing message broker.',
    E'1. Keep synchronous but add circuit breakers (doesn''t solve root cause)\n2. Move to a separate microservice (too much overhead for current scale)',
    '2026-06-01', 'pending', 1, NULL, '2025-01-20T09:00:00Z'
  ),
  (
    '00000000-0000-0000-0002-000000000002',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0001-000000000003',
    'Adopt Radix UI as base for component library',
    'approval', 'developer',
    'Our current component library has accessibility gaps and inconsistent behavior. Radix UI provides unstyled, accessible primitives that we can theme consistently. This would reduce our accessibility debt and speed up component development.',
    E'1. Build from scratch (6+ months, we don''t have capacity)\n2. Use Headless UI (fewer components, less flexible)',
    '2026-05-28', 'in_review', 1, NULL, '2025-01-18T14:00:00Z'
  ),
  (
    '00000000-0000-0000-0002-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0001-000000000005',
    'Prioritize mobile app over web dashboard redesign',
    'approval', 'pm',
    'Our mobile users now represent 60% of active sessions but the mobile experience is significantly worse than web. I believe we should prioritize the mobile app rebuild for Q2 instead of the dashboard redesign.',
    E'1. Split team 50/50 (neither ships well)\n2. Dashboard first (lower user impact)',
    '2026-05-25', 'approved', 1, '2025-01-19T16:00:00Z', '2025-01-17T11:00:00Z'
  ),
  (
    '00000000-0000-0000-0002-000000000004',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0001-000000000001',
    'Use WebSocket for real-time collaboration features',
    'feedback', 'developer',
    E'We need real-time collaboration for the document editing feature. I''m proposing WebSocket connections with CRDT for conflict resolution. Want to validate this approach before building.',
    E'1. Server-sent events (unidirectional, won''t work for collaboration)\n2. Polling (too slow, too much load)',
    '2026-06-05', 'pending', 1, NULL, '2025-01-21T10:00:00Z'
  ),
  (
    '00000000-0000-0000-0002-000000000005',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0001-000000000004',
    'Simplify onboarding flow from 7 steps to 3',
    'sign_off', 'pm',
    E'Our onboarding completion rate is 23%. Research shows users drop off at step 4. I propose collapsing to: 1) Account creation, 2) Profile setup, 3) First action. This removes the team invite and integration setup steps (move them to post-onboarding).',
    E'1. Keep 7 steps but add progress indicators (doesn''t address root cause)\n2. Progressive disclosure within fewer screens (similar approach, more complex)',
    '2026-05-30', 'needs_info', 1, '2025-01-22T09:00:00Z', '2025-01-19T15:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample responses
INSERT INTO request_responses (id, request_id, reviewer_id, response_type, comment, created_at)
VALUES
  (
    '00000000-0000-0000-0003-000000000001',
    '00000000-0000-0000-0002-000000000003',
    '00000000-0000-0000-0000-000000000005',
    'approved',
    E'Strong case. Mobile is clearly where our users are. Let''s make sure we communicate this shift clearly to the dashboard team - they should know this is a priority call, not a quality judgment on their work.',
    '2025-01-19T16:00:00Z'
  ),
  (
    '00000000-0000-0000-0003-000000000002',
    '00000000-0000-0000-0002-000000000005',
    '00000000-0000-0000-0000-000000000003',
    'needs_info',
    E'I like the direction but need to understand: what happens to the team invite flow? If we move it post-onboarding, do users still discover it? Can you share the drop-off data broken down by step? Also want to see the proposed 3-step wireframes before signing off.',
    '2025-01-22T09:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;

-- Update RLS policies to allow access without auth (use service role pattern - allow all authenticated-like access)
-- Since we have no auth, we need to allow anon access for the mock demo

-- Profiles: allow anon read/write
DROP POLICY IF EXISTS "Anyone authenticated can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Allow all profile reads" ON profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all profile updates" ON profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all profile inserts" ON profiles FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Expertise areas: allow anon
DROP POLICY IF EXISTS "Authenticated users can read expertise areas" ON expertise_areas;
DROP POLICY IF EXISTS "Reviewers can insert own expertise areas" ON expertise_areas;
DROP POLICY IF EXISTS "Reviewers can update own expertise areas" ON expertise_areas;
DROP POLICY IF EXISTS "Reviewers can delete own expertise areas" ON expertise_areas;

CREATE POLICY "Allow all expertise reads" ON expertise_areas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all expertise inserts" ON expertise_areas FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all expertise updates" ON expertise_areas FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all expertise deletes" ON expertise_areas FOR DELETE TO anon, authenticated USING (true);

-- Decision requests: allow anon
DROP POLICY IF EXISTS "Requesters can read own requests" ON decision_requests;
DROP POLICY IF EXISTS "Requesters can create requests" ON decision_requests;
DROP POLICY IF EXISTS "Reviewers can update request status" ON decision_requests;

CREATE POLICY "Allow all request reads" ON decision_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all request inserts" ON decision_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all request updates" ON decision_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Request responses: allow anon
DROP POLICY IF EXISTS "Participants can read responses" ON request_responses;
DROP POLICY IF EXISTS "Reviewers can insert responses" ON request_responses;

CREATE POLICY "Allow all response reads" ON request_responses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all response inserts" ON request_responses FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Token transactions: allow anon
DROP POLICY IF EXISTS "Participants can read own transactions" ON token_transactions;
DROP POLICY IF EXISTS "System can insert transactions" ON token_transactions;

CREATE POLICY "Allow all transaction reads" ON token_transactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all transaction inserts" ON token_transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
