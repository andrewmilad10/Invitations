-- ═══════════════════════════════════════════════════════════════════════════
-- 0016 · Faster admin reads (same names, same answers, same role checks)
--
-- overview      one pass per table with FILTER counts, and the daily chart
--               from one grouped pass over a calendar of dates plus the
--               period's rows, instead of four counting queries for every
--               day (1,460 for a year). Days and periods follow Cairo time.
-- invitations   find the matching ids first (indexes on created_at and a
--               trigram index for search), cut the page, and only then add
--               the customer, payments, guests and replies for those rows.
-- sales         same idea; totals for the whole match come from the
--               database, so the page no longer needs to load 500 rows to
--               show them.
-- Search text is matched literally (% and _ no longer act as wildcards).
-- ═══════════════════════════════════════════════════════════════════════════

create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;

create index if not exists weddings_created_at_idx on public.weddings (created_at desc);
create index if not exists weddings_active_until_idx on public.weddings (active_until) where deactivated_at is null;
create index if not exists weddings_search_trgm_idx on public.weddings
  using gin ((lower(slug || ' ' || partner_one_name || ' ' || partner_two_name)) extensions.gin_trgm_ops);
create index if not exists orders_reference_trgm_idx on public.orders using gin (lower(reference) extensions.gin_trgm_ops);
create index if not exists orders_wedding_paid_idx on public.orders (wedding_id) include (amount, paid_at) where status = 'paid';

-- A search string as a literal ILIKE pattern: %text%, with \ % _ escaped.
create or replace function private.like_pattern(p_q text)
returns text language sql immutable set search_path = '' as $$
  select '%' || replace(replace(replace(lower(p_q), '\', '\\'), '%', '\%'), '_', '\_') || '%';
$$;
revoke all on function private.like_pattern(text) from public, anon, authenticated;

-- ── Overview ───────────────────────────────────────────────────────────────
create or replace function private.admin_overview(p_days integer)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_role  public.staff_role := private.require_staff(array['owner', 'admin', 'marketing']::public.staff_role[]);
  v_money boolean := v_role in ('owner', 'admin');
  v_days  integer := least(greatest(coalesce(p_days, 30), 7), 365);
  -- Days are Cairo days (the business day), whatever the server's clock zone.
  v_today date := (now() at time zone 'Africa/Cairo')::date;
  v_first date := v_today - (v_days - 1);
  v_from  timestamptz := v_first::timestamp at time zone 'Africa/Cairo';
  w record;
  o record;
  u record;
  v_guests bigint;
  v_replies bigint;
  v_daily jsonb;
  v_designs jsonb;
begin
  select count(*) as total,
         count(*) filter (where created_at >= v_from) as fresh,
         count(*) filter (where status = 'published') as published,
         count(*) filter (where status = 'published' and deactivated_at is null and (active_until is null or active_until > now())) as live,
         count(*) filter (where deactivated_at is null and active_until > now() and active_until <= now() + interval '14 days') as expiring,
         count(*) filter (where active_until <= now()) as expired,
         count(*) filter (where deactivated_at is not null) as deactivated
    into w
    from public.weddings;

  select count(*) filter (where status = 'paid') as sales,
         count(*) filter (where status = 'paid' and paid_at >= v_from) as sales_period,
         coalesce(sum(amount) filter (where status = 'paid'), 0) as revenue,
         coalesce(sum(amount) filter (where status = 'paid' and paid_at >= v_from), 0) as revenue_period,
         count(*) filter (where status = 'refunded') as refunds,
         count(distinct wedding_id) filter (where status = 'paid') as paid_weddings
    into o
    from public.orders;

  select count(*) as total, count(*) filter (where created_at >= v_from) as fresh into u from auth.users;
  select count(*) into v_guests from public.guests;
  select count(*) into v_replies from public.replies;

  -- One pass: the calendar plus every sale, sign-up and new invitation in
  -- the period, stacked and grouped by Cairo day (no joins; the calendar
  -- is plain dates, so empty days still appear).
  select coalesce(jsonb_agg(jsonb_build_object(
           'day', to_char(x.d, 'YYYY-MM-DD'),
           'sales', x.sales,
           'revenue', case when v_money then x.revenue end,
           'accounts', x.accounts,
           'weddings', x.weddings
         ) order by x.d), '[]'::jsonb)
    into v_daily
    from (
      select d, sum(sales)::int as sales, sum(revenue) as revenue, sum(accounts)::int as accounts, sum(weddings)::int as weddings
        from (
          select v_first + i as d, 0 as sales, 0::numeric as revenue, 0 as accounts, 0 as weddings
            from generate_series(0, v_days - 1) as i
          union all
          select (paid_at at time zone 'Africa/Cairo')::date, 1, amount, 0, 0
            from public.orders where status = 'paid' and paid_at >= v_from
          union all
          select (created_at at time zone 'Africa/Cairo')::date, 0, 0, 1, 0
            from auth.users where created_at >= v_from
          union all
          select (created_at at time zone 'Africa/Cairo')::date, 0, 0, 0, 1
            from public.weddings where created_at >= v_from
        ) e
       where d <= v_today
       group by d
    ) x;

  select coalesce(jsonb_agg(jsonb_build_object('template_id', x.template_id, 'weddings', x.weddings, 'published', x.published, 'sales', x.sales)
                            order by x.weddings desc, x.template_id), '[]'::jsonb)
    into v_designs
    from (
      select w2.template_id,
             count(*)::int as weddings,
             count(*) filter (where w2.status = 'published')::int as published,
             coalesce(sum(p.n), 0)::int as sales
        from public.weddings w2
        left join (select wedding_id, count(*) as n from public.orders where status = 'paid' group by wedding_id) p on p.wedding_id = w2.id
       group by w2.template_id
       order by count(*) desc
       limit 12
    ) x;

  return jsonb_build_object(
    'role', v_role,
    'totals', jsonb_build_object(
      'accounts', u.total, 'accountsNew', u.fresh,
      'weddings', w.total, 'weddingsNew', w.fresh,
      'published', w.published, 'live', w.live, 'expiringSoon', w.expiring,
      'expired', w.expired, 'deactivated', w.deactivated,
      'paidWeddings', o.paid_weddings, 'sales', o.sales, 'salesPeriod', o.sales_period,
      'revenue', case when v_money then o.revenue end,
      'revenuePeriod', case when v_money then o.revenue_period end,
      'refunds', case when v_money then o.refunds end,
      'guests', v_guests, 'replies', v_replies, 'days', v_days
    ),
    'daily', v_daily,
    'designs', v_designs
  );
end;
$$;

-- ── Invitations ────────────────────────────────────────────────────────────
create or replace function private.admin_list_weddings(p_filter text, p_search text, p_limit integer, p_offset integer)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_role    public.staff_role := private.require_staff(array['owner', 'admin', 'marketing']::public.staff_role[]);
  v_private boolean := v_role in ('owner', 'admin');
  v_q       text := nullif(btrim(coalesce(p_search, '')), '');
  v_like    text := case when v_q is null then null else private.like_pattern(v_q) end;
  v_owners  uuid[] := '{}';
  v_filter  text := coalesce(p_filter, 'all');
  v_limit   integer := least(greatest(coalesce(p_limit, 50), 1), 200);
  v_offset  integer := greatest(coalesce(p_offset, 0), 0);
  v_total   integer;
  v_rows    jsonb;
begin
  -- Customer emails are searched by staff who may see them (indexable list of owners).
  if v_private and v_like is not null then
    select coalesce(array_agg(id), '{}') into v_owners
      from (select id from auth.users where lower(email) like v_like limit 1000) e;
  end if;

  with m as materialized (
    select w.id, w.created_at
      from public.weddings w
     where (v_like is null
            or lower(w.slug || ' ' || w.partner_one_name || ' ' || w.partner_two_name) like v_like
            or w.owner_id = any (v_owners))
       and case v_filter
             when 'live' then w.status = 'published' and w.deactivated_at is null and (w.active_until is null or w.active_until > now())
             when 'expiring' then w.deactivated_at is null and w.active_until > now() and w.active_until <= now() + interval '14 days'
             when 'expired' then w.active_until <= now()
             when 'deactivated' then w.deactivated_at is not null
             when 'unpaid' then not exists (select 1 from public.orders o where o.wedding_id = w.id and o.status = 'paid')
             when 'paid' then exists (select 1 from public.orders o where o.wedding_id = w.id and o.status = 'paid')
             when 'draft' then w.status = 'draft'
             else true
           end
  ), page as (
    select m.id, m.created_at from m order by m.created_at desc, m.id limit v_limit offset v_offset
  )
  select (select count(*) from m),
         coalesce(jsonb_agg(jsonb_build_object(
           'id', b.id,
           'slug', b.slug,
           'names', b.partner_one_name || ' & ' || b.partner_two_name,
           'templateId', b.template_id,
           'status', b.status,
           'weddingDate', b.wedding_date,
           'createdAt', b.created_at,
           'publishedAt', b.published_at,
           'activeUntil', b.active_until,
           'deactivatedAt', b.deactivated_at,
           'deactivatedReason', b.deactivated_reason,
           'ownerEmail', case when v_private then u.email end,
           'paidTotal', case when v_private then pay.total end,
           'sales', pay.n,
           'lastPaidAt', pay.last_at,
           'guests', gc.n,
           'replies', rc.n
         ) order by pg.created_at desc, pg.id), '[]'::jsonb)
    into v_total, v_rows
    from page pg
    join public.weddings b on b.id = pg.id
    left join auth.users u on u.id = b.owner_id
    left join lateral (
      select coalesce(sum(o.amount), 0) as total, count(*) as n, max(o.paid_at) as last_at
        from public.orders o where o.wedding_id = b.id and o.status = 'paid'
    ) pay on true
    left join lateral (select count(*) as n from public.guests g where g.wedding_id = b.id) gc on true
    left join lateral (select count(*) as n from public.replies r where r.wedding_id = b.id) rc on true;

  return jsonb_build_object('total', v_total, 'rows', v_rows);
end;
$$;

-- ── Sales ──────────────────────────────────────────────────────────────────
create or replace function private.admin_list_sales(p_search text, p_limit integer, p_offset integer)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_role   public.staff_role := private.require_staff(array['owner', 'admin']::public.staff_role[]);
  v_q      text := nullif(btrim(coalesce(p_search, '')), '');
  v_like   text := case when v_q is null then null else private.like_pattern(v_q) end;
  v_users  uuid[] := '{}';
  v_limit  integer := least(greatest(coalesce(p_limit, 50), 1), 500);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_sum    jsonb;
  v_rows   jsonb;
begin
  if v_like is not null then
    select coalesce(array_agg(id), '{}') into v_users
      from (select id from auth.users where lower(email) like v_like limit 1000) e;
  end if;

  with m as materialized (
    select o.id, o.paid_at, o.amount, o.status = 'paid' as paid
      from public.orders o
     where v_like is null
        or o.buyer_id = any (v_users)
        or lower(o.reference) like v_like
        or o.wedding_id in (
             select w.id from public.weddings w
              where lower(w.slug || ' ' || w.partner_one_name || ' ' || w.partner_two_name) like v_like)
  ), page as (
    select m.id, m.paid_at from m order by m.paid_at desc, m.id limit v_limit offset v_offset
  )
  select jsonb_build_object(
           'total', (select count(*) from m),
           'paid', (select count(*) from m where m.paid),
           'revenue', (select coalesce(sum(m.amount), 0) from m where m.paid)),
         coalesce(jsonb_agg(jsonb_build_object(
           'id', o.id, 'weddingId', o.wedding_id, 'slug', w.slug,
           'names', case when w.slug is null then null else w.partner_one_name || ' & ' || w.partner_two_name end,
           'templateId', w.template_id, 'buyerEmail', ub.email,
           'amount', o.amount, 'currency', o.currency, 'method', o.method, 'reference', o.reference, 'note', o.note,
           'months', o.months, 'status', o.status, 'paidAt', o.paid_at, 'refundedAt', o.refunded_at, 'recordedBy', uc.email
         ) order by pg.paid_at desc, pg.id), '[]'::jsonb)
    into v_sum, v_rows
    from page pg
    join public.orders o on o.id = pg.id
    left join public.weddings w on w.id = o.wedding_id
    left join auth.users ub on ub.id = o.buyer_id
    left join auth.users uc on uc.id = o.created_by;

  return v_sum || jsonb_build_object('rows', v_rows);
end;
$$;
