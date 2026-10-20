-- 0019 · admin_me also returns the staff member's name, for the shared site
-- header (same access as before: staff only, their own row).
create or replace function private.admin_me()
returns jsonb language sql stable security definer set search_path = '' as $$
  select case when s.role is null then null
              else jsonb_build_object('role', s.role, 'email', u.email, 'name', nullif(btrim(p.full_name), '')) end
  from (select 1) one
  left join public.platform_staff s on s.user_id = (select auth.uid())
  left join auth.users u on u.id = s.user_id
  left join public.profiles p on p.id = s.user_id;
$$;
