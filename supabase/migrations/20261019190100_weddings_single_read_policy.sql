-- ═══════════════════════════════════════════════════════════════════════════
-- 0011 · One read policy on weddings
-- Postgres runs every permissive policy on every row, so two SELECT policies
-- ("members read" and "owner reads own") cost twice. "members read" now also
-- covers the owner, which gives exactly the same access.
--
-- Written with ALTER POLICY rather than DROP: "owner reads own" is moved to
-- service_role (which bypasses RLS anyway), so signed-in users have one SELECT
-- policy and nothing is dropped.
-- ═══════════════════════════════════════════════════════════════════════════

-- Members read; the creator also reads the row back right after insert, before
-- the AFTER trigger has added their membership.
alter policy "weddings: members read" on public.weddings
  using (owner_id = (select auth.uid()) or public.can_view_wedding(id));

alter policy "weddings: owner reads own" on public.weddings to service_role;
