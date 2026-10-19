-- 0015 · Say out loud that nobody reads or writes the staff list or the audit
-- log directly (staff go through the private admin_* functions). Same access
-- as before (RLS on, no grants); this only makes the intent explicit.
create policy platform_staff_closed on public.platform_staff as restrictive for all to anon, authenticated using (false) with check (false);
create policy admin_audit_closed on public.admin_audit as restrictive for all to anon, authenticated using (false) with check (false);
