-- ═══════════════════════════════════════════════════════════════════════════
-- 0024 · admin_today(): the "today at a glance" header on the Overview.
-- Today's headline figures (Cairo day) plus an hour-by-hour breakdown for a
-- sparkline. Money fields are null for the marketing role, as elsewhere.
-- ═══════════════════════════════════════════════════════════════════════════
create function private.admin_today()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_role   public.staff_role := private.require_staff(array['owner', 'admin', 'marketing']::public.staff_role[]);
  v_money  boolean := v_role in ('owner', 'admin');
  v_today  date := (now() at time zone 'Africa/Cairo')::date;
  v_start  timestamptz := v_today::timestamp at time zone 'Africa/Cairo';
  v_hour   int := extract(hour from now() at time zone 'Africa/Cairo')::int;
  o record;
  u record;
  v_hours jsonb;
begin
  select count(*) filter (where o2.status = 'paid' and o2.paid_at >= v_start) as sales,
         coalesce(sum(o2.amount) filter (where o2.status = 'paid' and o2.paid_at >= v_start), 0) as revenue,
         count(*) filter (where o2.created_at >= v_start and o2.source <> 'staff') as orders,
         count(*) filter (where o2.status = 'pending' and o2.archived_at is null) as pending,
         coalesce(sum(o2.amount) filter (where o2.status = 'pending' and o2.archived_at is null), 0) as pending_amount
    into o
    from public.orders o2;

  select count(*) filter (where created_at >= v_start) as accounts into u from auth.users;

  select coalesce(jsonb_agg(jsonb_build_object(
           'hour', g.h,
           'sales', coalesce(s.n, 0),
           'revenue', case when v_money then coalesce(s.amount, 0) end,
           'orders', coalesce(ord.n, 0)
         ) order by g.h), '[]'::jsonb)
    into v_hours
    from generate_series(0, 23) as g(h)
    left join (
      select extract(hour from paid_at at time zone 'Africa/Cairo')::int as h, count(*) as n, sum(amount) as amount
        from public.orders where status = 'paid' and paid_at >= v_start group by 1
    ) s on s.h = g.h
    left join (
      select extract(hour from created_at at time zone 'Africa/Cairo')::int as h, count(*) as n
        from public.orders where created_at >= v_start and source <> 'staff' group by 1
    ) ord on ord.h = g.h;

  return jsonb_build_object(
    'role', v_role,
    'nowHour', v_hour,
    'live', (select count(*) from public.weddings where status = 'published' and deactivated_at is null and (active_until is null or active_until > now())),
    'salesToday', o.sales,
    'revenueToday', case when v_money then o.revenue end,
    'ordersToday', o.orders,
    'accountsToday', u.accounts,
    'weddingsToday', (select count(*) from public.weddings where created_at >= v_start),
    'repliesToday', (select count(*) from public.replies where created_at >= v_start),
    'pendingOrders', o.pending,
    'pendingAmount', case when v_money then o.pending_amount end,
    'expiringSoon', (select count(*) from public.weddings where deactivated_at is null and active_until > now() and active_until <= now() + interval '14 days'),
    'hours', v_hours
  );
end;
$$;
create function public.admin_today() returns jsonb language sql stable security invoker set search_path = '' as $$ select private.admin_today(); $$;
revoke all on function public.admin_today() from public, anon, authenticated;
revoke all on function private.admin_today() from public, anon, authenticated;
grant execute on function public.admin_today() to authenticated;
grant execute on function private.admin_today() to authenticated;
