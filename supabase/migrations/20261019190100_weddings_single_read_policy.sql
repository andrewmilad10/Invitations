-- ═══════════════════════════════════════════════════════════════════════════
-- 0011 · One read policy on weddings
-- Postgres runs every permissive policy on every row, so two SELECT policies
-- ("members read" and "owner reads own") cost twice. One policy with both
-- conditions gives exactly the same access.
-- ═══════════════════════════════════════════════════════════════════════════

drop policy "weddings: members read" on public.weddings;
drop policy "weddings: owner reads own" on public.weddings;
-- Members read; the creator also reads the row back right after insert, before
-- the AFTER trigger has added their membership.
create policy "weddings: members read"
  on public.weddings for select to authenticated
  using (owner_id = (select auth.uid()) or public.can_view_wedding(id));
