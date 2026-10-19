-- ═══════════════════════════════════════════════════════════════════════════
-- 0014 · Admin: staff, sales, live periods, deactivation, audit log
--
-- platform_staff  who may open /admin, and as what:
--                   owner      everything, including managing staff
--                   admin      everything except managing staff
--                   marketing  counts, trends and designs only: no money, no
--                              customer emails, no changes
-- orders          one row per sale (recorded by staff now; Paymob later).
--                 A sale keeps the invitation live for `months` (3 by default).
-- weddings        + active_until (live until), deactivated_at/_reason.
--                 Published invitations show only while not deactivated and
--                 not past active_until (null = no limit yet).
-- admin_audit     every change made from /admin: who, what, when.
--
-- None of these tables is readable or writable by clients except a buyer
-- reading their own orders. Staff work only through private SECURITY DEFINER
-- functions that check the caller's role first (pass-throughs in public, as
-- in 0012). Clients can never set the new wedding columns (they are not in
-- the column grants from 0002).
-- ═══════════════════════════════════════════════════════════════════════════

create type public.staff_role as enum ('owner', 'admin', 'marketing');
create type public.order_status as enum ('paid', 'refunded');

create table public.platform_staff (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       public.staff_role not null,
  added_by   uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.orders (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid references public.weddings (id) on delete set null,
  buyer_id    uuid references auth.users (id) on delete set null,
  amount      numeric(12, 2) not null check (amount >= 0 and amount <= 1000000),
  currency    text not null default 'EGP' check (currency ~ '^[A-Z]{3}$'),
  method      text not null check (method in ('cash', 'instapay', 'vodafone_cash', 'bank_transfer', 'card', 'paymob', 'other')),
  reference   text check (reference is null or char_length(reference) <= 120),
  note        text check (note is null or char_length(note) <= 500),
  months      smallint not null default 3 check (months between 0 and 36),
  status      public.order_status not null default 'paid',
  paid_at     timestamptz not null default now(),
  refunded_at timestamptz,
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);
create index orders_paid_at_idx on public.orders (paid_at desc);
create index orders_wedding_idx on public.orders (wedding_id);
create index orders_buyer_idx on public.orders (buyer_id);
create index orders_created_by_idx on public.orders (created_by);

create table public.admin_audit (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor       uuid references auth.users (id) on delete set null,
  action      text not null,
  target_type text,
  target_id   text,
  details     jsonb not null default '{}'::jsonb
);
create index admin_audit_at_idx on public.admin_audit (at desc);
create index admin_audit_actor_idx on public.admin_audit (actor);
create index platform_staff_added_by_idx on public.platform_staff (added_by);

alter table public.weddings
  add column active_until       timestamptz,
  add column deactivated_at     timestamptz,
  add column deactivated_reason text check (deactivated_reason is null or char_length(deactivated_reason) <= 300);

alter table public.platform_staff enable row level security;
alter table public.orders         enable row level security;
alter table public.admin_audit    enable row level security;
revoke all on public.platform_staff, public.orders, public.admin_audit from anon, authenticated;
revoke all on sequence public.admin_audit_id_seq from anon, authenticated;

-- A couple can see their own receipts (for a future "Payments" view).
grant select on public.orders to authenticated;
create policy orders_buyer_reads on public.orders for select to authenticated using (buyer_id = (select auth.uid()));

-- ── Guests only see invitations that are live ─────────────────────────────
create or replace function public.published_wedding_id(p_slug text)
returns uuid language sql stable security definer set search_path = '' as $$
  select w.id from public.weddings w
   where w.slug = lower(p_slug) and w.status = 'published'
     and w.deactivated_at is null
     and (w.active_until is null or w.active_until > now());
$$;
revoke all on function public.published_wedding_id(text) from public, anon, authenticated;

create or replace function private.get_public_invitation(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'wedding', jsonb_build_object(
      'id',               w.id,
      'slug',             w.slug,
      'partner_one_name', w.partner_one_name,
      'partner_two_name', w.partner_two_name,
      'wedding_date',     w.wedding_date,
      'template_id',      w.template_id,
      'status',           w.status,
      'published_at',     w.published_at,
      'updated_at',       w.updated_at
    ),
    'settings', (
      select jsonb_build_object(
        'locale',        s.locale,
        'timezone',      s.timezone,
        'visibility',    s.visibility,
        'music_enabled', s.music_enabled
      )
      from public.wedding_settings s where s.wedding_id = w.id
    ),
    'theme', (
      select jsonb_build_object('tokens', t.tokens)
      from public.wedding_themes t where t.wedding_id = w.id
    ),
    'sections', coalesce((
      select jsonb_agg(jsonb_build_object(
        'type',       ws.type,
        'enabled',    ws.enabled,
        'sort_order', ws.sort_order,
        'content',    case when ws.enabled then ws.content else '{}'::jsonb end,
        'style',      ws.style
      ) order by ws.sort_order nulls last, ws.type)
      from public.wedding_sections ws where ws.wedding_id = w.id
    ), '[]'::jsonb),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',          e.id,
        'kind',        e.kind,
        'title',       e.title,
        'starts_at',   e.starts_at,
        'ends_at',     e.ends_at,
        'venue_name',  e.venue_name,
        'address',     e.address,
        'latitude',    e.latitude,
        'longitude',   e.longitude,
        'map_url',     e.map_url,
        'description', e.description,
        'sort_order',  e.sort_order
      ) order by e.sort_order, e.starts_at nulls last)
      from public.events e where e.wedding_id = w.id
    ), '[]'::jsonb),
    'media', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',           m.id,
        'kind',         m.kind,
        'purpose',      m.purpose,
        'storage_path', m.storage_path,
        'alt_text',     m.alt_text,
        'width',        m.width,
        'height',       m.height,
        'sort_order',   m.sort_order
      ) order by m.purpose, m.sort_order, m.created_at)
      from public.media m
      where m.wedding_id = w.id
        and (m.purpose <> 'music' or exists (
          select 1 from public.wedding_settings s2
          where s2.wedding_id = w.id and s2.music_enabled
        ))
    ), '[]'::jsonb)
  )
  from public.weddings w
  where w.slug = lower(p_slug)
    and w.status = 'published'
    and w.deactivated_at is null
    and (w.active_until is null or w.active_until > now());
$$;

-- ── Role checks and the audit trail ────────────────────────────────────────
create function private.staff_role()
returns public.staff_role language sql stable security definer set search_path = '' as $$
  select s.role from public.platform_staff s where s.user_id = (select auth.uid());
$$;

create function private.require_staff(p_roles public.staff_role[])
returns public.staff_role language plpgsql stable security definer set search_path = '' as $$
declare
  v public.staff_role := private.staff_role();
begin
  if v is null or not (v = any (p_roles)) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return v;
end;
$$;

create function private.audit(p_action text, p_type text, p_id text, p_details jsonb)
returns void language sql volatile security definer set search_path = '' as $$
  insert into public.admin_audit (actor, action, target_type, target_id, details)
  values ((select auth.uid()), p_action, p_type, p_id, coalesce(p_details, '{}'::jsonb));
$$;

-- ── Read: who am I ─────────────────────────────────────────────────────────
create function private.admin_me()
returns jsonb language sql stable security definer set search_path = '' as $$
  select case when s.role is null then null else jsonb_build_object('role', s.role, 'email', u.email) end
  from (select 1) one
  left join public.platform_staff s on s.user_id = (select auth.uid())
  left join auth.users u on u.id = s.user_id;
$$;

-- ── Read: overview ─────────────────────────────────────────────────────────
create function private.admin_overview(p_days integer)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner', 'admin', 'marketing']::public.staff_role[]);
  v_money boolean := v_role in ('owner', 'admin');
  v_days integer := least(greatest(coalesce(p_days, 30), 7), 365);
  v_from timestamptz := date_trunc('day', now()) - make_interval(days => v_days - 1);
  v_totals jsonb;
  v_daily jsonb;
  v_designs jsonb;
begin
  select jsonb_build_object(
    'accounts',      (select count(*) from auth.users),
    'accountsNew',   (select count(*) from auth.users where created_at >= v_from),
    'weddings',      (select count(*) from public.weddings),
    'weddingsNew',   (select count(*) from public.weddings where created_at >= v_from),
    'published',     (select count(*) from public.weddings where status = 'published'),
    'live',          (select count(*) from public.weddings where status = 'published' and deactivated_at is null and (active_until is null or active_until > now())),
    'expiringSoon',  (select count(*) from public.weddings where deactivated_at is null and active_until > now() and active_until <= now() + interval '14 days'),
    'expired',       (select count(*) from public.weddings where active_until <= now()),
    'deactivated',   (select count(*) from public.weddings where deactivated_at is not null),
    'paidWeddings',  (select count(distinct wedding_id) from public.orders where status = 'paid'),
    'sales',         (select count(*) from public.orders where status = 'paid'),
    'salesPeriod',   (select count(*) from public.orders where status = 'paid' and paid_at >= v_from),
    'revenue',       case when v_money then (select coalesce(sum(amount), 0) from public.orders where status = 'paid') end,
    'revenuePeriod', case when v_money then (select coalesce(sum(amount), 0) from public.orders where status = 'paid' and paid_at >= v_from) end,
    'refunds',       case when v_money then (select count(*) from public.orders where status = 'refunded') end,
    'guests',        (select count(*) from public.guests),
    'replies',       (select count(*) from public.replies),
    'days',          v_days
  ) into v_totals;

  select coalesce(jsonb_agg(jsonb_build_object(
           'day', to_char(d, 'YYYY-MM-DD'),
           'sales', (select count(*) from public.orders o where o.status = 'paid' and o.paid_at >= d and o.paid_at < d + interval '1 day'),
           'revenue', case when v_money then (select coalesce(sum(o.amount), 0) from public.orders o where o.status = 'paid' and o.paid_at >= d and o.paid_at < d + interval '1 day') end,
           'accounts', (select count(*) from auth.users u where u.created_at >= d and u.created_at < d + interval '1 day'),
           'weddings', (select count(*) from public.weddings w where w.created_at >= d and w.created_at < d + interval '1 day')
         ) order by d), '[]'::jsonb)
    into v_daily
    from generate_series(v_from, date_trunc('day', now()), interval '1 day') d;

  select coalesce(jsonb_agg(x order by x.weddings desc, x.template_id), '[]'::jsonb) into v_designs
  from (
    select w.template_id, count(*)::int as weddings,
           count(*) filter (where w.status = 'published')::int as published,
           (select count(*) from public.orders o where o.status = 'paid' and o.wedding_id in (select id from public.weddings w2 where w2.template_id = w.template_id))::int as sales
      from public.weddings w
     group by w.template_id
     order by count(*) desc
     limit 12
  ) x;

  return jsonb_build_object('role', v_role, 'totals', v_totals, 'daily', v_daily, 'designs', v_designs);
end;
$$;

-- ── Read: invitations ──────────────────────────────────────────────────────
create function private.admin_list_weddings(p_filter text, p_search text, p_limit integer, p_offset integer)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner', 'admin', 'marketing']::public.staff_role[]);
  v_private boolean := v_role in ('owner', 'admin');
  v_q text := nullif(btrim(coalesce(p_search, '')), '');
  v_rows jsonb;
  v_total integer;
begin
  with base as (
    select w.*, u.email as owner_email
      from public.weddings w
      left join auth.users u on u.id = w.owner_id
     where (v_q is null
            or w.slug ilike '%' || v_q || '%'
            or w.partner_one_name ilike '%' || v_q || '%'
            or w.partner_two_name ilike '%' || v_q || '%'
            or (v_private and u.email ilike '%' || v_q || '%'))
       and case coalesce(p_filter, 'all')
             when 'live' then w.status = 'published' and w.deactivated_at is null and (w.active_until is null or w.active_until > now())
             when 'expiring' then w.deactivated_at is null and w.active_until > now() and w.active_until <= now() + interval '14 days'
             when 'expired' then w.active_until <= now()
             when 'deactivated' then w.deactivated_at is not null
             when 'unpaid' then not exists (select 1 from public.orders o where o.wedding_id = w.id and o.status = 'paid')
             when 'paid' then exists (select 1 from public.orders o where o.wedding_id = w.id and o.status = 'paid')
             when 'draft' then w.status = 'draft'
             else true
           end
  )
  select (select count(*) from base),
         coalesce(jsonb_agg(r order by r->>'createdAt' desc), '[]'::jsonb)
    into v_total, v_rows
    from (
      select jsonb_build_object(
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
        'ownerEmail', case when v_private then b.owner_email end,
        'paidTotal', case when v_private then (select coalesce(sum(o.amount), 0) from public.orders o where o.wedding_id = b.id and o.status = 'paid') end,
        'sales', (select count(*) from public.orders o where o.wedding_id = b.id and o.status = 'paid'),
        'lastPaidAt', (select max(o.paid_at) from public.orders o where o.wedding_id = b.id and o.status = 'paid'),
        'guests', (select count(*) from public.guests g where g.wedding_id = b.id),
        'replies', (select count(*) from public.replies r where r.wedding_id = b.id)
      ) as r
        from base b
       order by b.created_at desc
       limit least(greatest(coalesce(p_limit, 50), 1), 200)
      offset greatest(coalesce(p_offset, 0), 0)
    ) page;
  return jsonb_build_object('total', v_total, 'rows', v_rows);
end;
$$;

-- ── Read: sales (money: owner and admin only) ──────────────────────────────
create function private.admin_list_sales(p_search text, p_limit integer, p_offset integer)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner', 'admin']::public.staff_role[]);
  v_q text := nullif(btrim(coalesce(p_search, '')), '');
  v_rows jsonb;
  v_total integer;
begin
  with base as (
    select o.*, w.slug, w.partner_one_name, w.partner_two_name, w.template_id, ub.email as buyer_email, uc.email as recorded_by
      from public.orders o
      left join public.weddings w on w.id = o.wedding_id
      left join auth.users ub on ub.id = o.buyer_id
      left join auth.users uc on uc.id = o.created_by
     where v_q is null
        or w.slug ilike '%' || v_q || '%'
        or w.partner_one_name ilike '%' || v_q || '%'
        or w.partner_two_name ilike '%' || v_q || '%'
        or ub.email ilike '%' || v_q || '%'
        or o.reference ilike '%' || v_q || '%'
  )
  select (select count(*) from base),
         coalesce(jsonb_agg(r order by r->>'paidAt' desc), '[]'::jsonb)
    into v_total, v_rows
    from (
      select jsonb_build_object(
        'id', b.id, 'weddingId', b.wedding_id, 'slug', b.slug,
        'names', case when b.slug is null then null else b.partner_one_name || ' & ' || b.partner_two_name end,
        'templateId', b.template_id, 'buyerEmail', b.buyer_email,
        'amount', b.amount, 'currency', b.currency, 'method', b.method, 'reference', b.reference, 'note', b.note,
        'months', b.months, 'status', b.status, 'paidAt', b.paid_at, 'refundedAt', b.refunded_at, 'recordedBy', b.recorded_by
      ) as r
        from base b
       order by b.paid_at desc
       limit least(greatest(coalesce(p_limit, 50), 1), 500)
      offset greatest(coalesce(p_offset, 0), 0)
    ) page;
  return jsonb_build_object('total', v_total, 'rows', v_rows);
end;
$$;

-- ── Write: record a sale ───────────────────────────────────────────────────
create function private.admin_record_sale(
  p_wedding uuid, p_amount numeric, p_method text, p_reference text, p_note text, p_months integer, p_publish boolean
)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner', 'admin']::public.staff_role[]);
  v_w public.weddings;
  v_months integer := least(greatest(coalesce(p_months, 3), 0), 36);
  v_order uuid;
  v_until timestamptz;
begin
  select * into v_w from public.weddings where id = p_wedding for update;
  if v_w.id is null then
    return jsonb_build_object('ok', false, 'error', 'This invitation no longer exists.');
  end if;
  if p_amount is null or p_amount < 0 or p_amount > 1000000 then
    return jsonb_build_object('ok', false, 'error', 'Enter an amount between 0 and 1,000,000.');
  end if;

  insert into public.orders (wedding_id, buyer_id, amount, method, reference, note, months, created_by)
  values (v_w.id, v_w.owner_id, round(p_amount, 2), p_method, nullif(btrim(p_reference), ''), nullif(btrim(p_note), ''), v_months, (select auth.uid()))
  returning id into v_order;

  v_until := greatest(coalesce(v_w.active_until, now()), now()) + make_interval(months => v_months);
  update public.weddings
     set active_until = v_until,
         status = case when p_publish then 'published'::public.wedding_status else status end
   where id = v_w.id;

  perform private.audit('sale.record', 'wedding', v_w.id::text,
    jsonb_build_object('order', v_order, 'amount', p_amount, 'method', p_method, 'months', v_months, 'activeUntil', v_until, 'published', p_publish));
  return jsonb_build_object('ok', true, 'orderId', v_order, 'activeUntil', v_until);
end;
$$;

-- ── Write: refund ──────────────────────────────────────────────────────────
create function private.admin_refund(p_order uuid, p_deactivate boolean)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner', 'admin']::public.staff_role[]);
  v_o public.orders;
begin
  update public.orders set status = 'refunded', refunded_at = now()
   where id = p_order and status = 'paid'
   returning * into v_o;
  if v_o.id is null then
    return jsonb_build_object('ok', false, 'error', 'That sale was not found or is already refunded.');
  end if;
  if p_deactivate and v_o.wedding_id is not null then
    update public.weddings set deactivated_at = now(), deactivated_reason = 'Refunded' where id = v_o.wedding_id and deactivated_at is null;
  end if;
  perform private.audit('sale.refund', 'order', v_o.id::text, jsonb_build_object('wedding', v_o.wedding_id, 'amount', v_o.amount, 'deactivated', p_deactivate));
  return jsonb_build_object('ok', true);
end;
$$;

-- ── Write: deactivate / reactivate, extend ─────────────────────────────────
create function private.admin_set_deactivated(p_wedding uuid, p_off boolean, p_reason text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner', 'admin']::public.staff_role[]);
  v_reason text := nullif(left(btrim(coalesce(p_reason, '')), 300), '');
begin
  update public.weddings
     set deactivated_at = case when p_off then coalesce(deactivated_at, now()) end,
         deactivated_reason = case when p_off then v_reason end
   where id = p_wedding;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'This invitation no longer exists.');
  end if;
  perform private.audit(case when p_off then 'wedding.deactivate' else 'wedding.reactivate' end, 'wedding', p_wedding::text, jsonb_build_object('reason', v_reason));
  return jsonb_build_object('ok', true);
end;
$$;

create function private.admin_extend(p_wedding uuid, p_days integer)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner', 'admin']::public.staff_role[]);
  v_until timestamptz;
begin
  if p_days is null or p_days not between -365 and 3650 or p_days = 0 then
    return jsonb_build_object('ok', false, 'error', 'Choose between -365 and 3650 days.');
  end if;
  update public.weddings
     set active_until = greatest(coalesce(active_until, now()), now()) + make_interval(days => p_days)
   where id = p_wedding
   returning active_until into v_until;
  if v_until is null then
    return jsonb_build_object('ok', false, 'error', 'This invitation no longer exists.');
  end if;
  perform private.audit('wedding.extend', 'wedding', p_wedding::text, jsonb_build_object('days', p_days, 'activeUntil', v_until));
  return jsonb_build_object('ok', true, 'activeUntil', v_until);
end;
$$;

-- ── Team (owner only for changes) ──────────────────────────────────────────
create function private.admin_list_staff()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner', 'admin']::public.staff_role[]);
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object('userId', s.user_id, 'email', u.email, 'role', s.role, 'since', s.created_at) order by s.created_at)
      from public.platform_staff s join auth.users u on u.id = s.user_id
  ), '[]'::jsonb);
end;
$$;

create function private.admin_set_staff(p_email text, p_role text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner']::public.staff_role[]);
  v_user uuid;
begin
  select id into v_user from auth.users where lower(email) = lower(btrim(coalesce(p_email, '')));
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'No account uses that email. Ask them to sign up first.');
  end if;
  if v_user = (select auth.uid()) then
    return jsonb_build_object('ok', false, 'error', 'You can''t change your own access.');
  end if;
  if p_role is null or p_role = '' then
    delete from public.platform_staff where user_id = v_user;
  elsif p_role in ('owner', 'admin', 'marketing') then
    insert into public.platform_staff (user_id, role, added_by) values (v_user, p_role::public.staff_role, (select auth.uid()))
    on conflict (user_id) do update set role = excluded.role;
  else
    return jsonb_build_object('ok', false, 'error', 'Unknown role.');
  end if;
  perform private.audit('staff.set', 'user', v_user::text, jsonb_build_object('email', lower(btrim(p_email)), 'role', nullif(p_role, '')));
  return jsonb_build_object('ok', true);
end;
$$;

-- ── Activity log ───────────────────────────────────────────────────────────
create function private.admin_activity(p_limit integer)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner', 'admin']::public.staff_role[]);
begin
  return coalesce((
    select jsonb_agg(x order by x->>'at' desc) from (
      select jsonb_build_object('at', a.at, 'actor', u.email, 'action', a.action, 'targetType', a.target_type, 'targetId', a.target_id, 'details', a.details) as x
        from public.admin_audit a left join auth.users u on u.id = a.actor
       order by a.at desc
       limit least(greatest(coalesce(p_limit, 100), 1), 500)
    ) t
  ), '[]'::jsonb);
end;
$$;

-- ── Pass-throughs in public (SECURITY INVOKER) ─────────────────────────────
create function public.admin_me() returns jsonb language sql stable security invoker set search_path = '' as $$ select private.admin_me(); $$;
create function public.admin_overview(p_days integer) returns jsonb language sql stable security invoker set search_path = '' as $$ select private.admin_overview(p_days); $$;
create function public.admin_list_weddings(p_filter text, p_search text, p_limit integer, p_offset integer) returns jsonb language sql stable security invoker set search_path = '' as $$ select private.admin_list_weddings(p_filter, p_search, p_limit, p_offset); $$;
create function public.admin_list_sales(p_search text, p_limit integer, p_offset integer) returns jsonb language sql stable security invoker set search_path = '' as $$ select private.admin_list_sales(p_search, p_limit, p_offset); $$;
create function public.admin_record_sale(p_wedding uuid, p_amount numeric, p_method text, p_reference text, p_note text, p_months integer, p_publish boolean) returns jsonb language sql volatile security invoker set search_path = '' as $$ select private.admin_record_sale(p_wedding, p_amount, p_method, p_reference, p_note, p_months, p_publish); $$;
create function public.admin_refund(p_order uuid, p_deactivate boolean) returns jsonb language sql volatile security invoker set search_path = '' as $$ select private.admin_refund(p_order, p_deactivate); $$;
create function public.admin_set_deactivated(p_wedding uuid, p_off boolean, p_reason text) returns jsonb language sql volatile security invoker set search_path = '' as $$ select private.admin_set_deactivated(p_wedding, p_off, p_reason); $$;
create function public.admin_extend(p_wedding uuid, p_days integer) returns jsonb language sql volatile security invoker set search_path = '' as $$ select private.admin_extend(p_wedding, p_days); $$;
create function public.admin_list_staff() returns jsonb language sql stable security invoker set search_path = '' as $$ select private.admin_list_staff(); $$;
create function public.admin_set_staff(p_email text, p_role text) returns jsonb language sql volatile security invoker set search_path = '' as $$ select private.admin_set_staff(p_email, p_role); $$;
create function public.admin_activity(p_limit integer) returns jsonb language sql stable security invoker set search_path = '' as $$ select private.admin_activity(p_limit); $$;

-- ── Grants: signed-in users may call; the role check inside decides ───────
do $$
declare
  f text;
begin
  foreach f in array array[
    'admin_me()', 'admin_overview(integer)', 'admin_list_weddings(text, text, integer, integer)',
    'admin_list_sales(text, integer, integer)', 'admin_record_sale(uuid, numeric, text, text, text, integer, boolean)',
    'admin_refund(uuid, boolean)', 'admin_set_deactivated(uuid, boolean, text)', 'admin_extend(uuid, integer)',
    'admin_list_staff()', 'admin_set_staff(text, text)', 'admin_activity(integer)'
  ] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
    execute format('revoke all on function private.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to authenticated', f);
    execute format('grant execute on function private.%s to authenticated', f);
  end loop;
end;
$$;
revoke all on function private.staff_role() from public, anon, authenticated;
revoke all on function private.require_staff(public.staff_role[]) from public, anon, authenticated;
revoke all on function private.audit(text, text, text, jsonb) from public, anon, authenticated;
