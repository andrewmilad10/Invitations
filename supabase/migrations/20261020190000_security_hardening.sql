-- ═══════════════════════════════════════════════════════════════════════════
-- 0020 · Security hardening
--
-- 1. Staff need two-step login: every admin_* function (through
--    require_staff) refuses a session that hasn't passed an authenticator
--    code (JWT "aal" = aal2). admin_me still answers, and says which level
--    the session has, so the app can send staff to the code screen.
-- 2. Per-account limits on actions that create things (orders, invitations,
--    uploads, guest lists), recorded in a private table.
-- 3. Mark as paid warns before using a payment reference twice or a
--    different amount; staff confirm to go ahead (and that's recorded).
-- 4. Security alerts for owners and admins: staff changes, refunds,
--    payments marked despite a warning, invitations turned off.
-- 5. A couple can delete their account: invitations, guest lists, replies
--    and wishes go; orders stay for the books with name and phone removed.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Two-step login for staff ────────────────────────────────────────────
-- The session's assurance level: aal2 once an authenticator code was given.
create function private.session_aal() returns text language sql stable set search_path = '' as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.aal', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'aal'),
    'aal1');
$$;
revoke all on function private.session_aal() from public, anon, authenticated;

create or replace function private.require_staff(p_roles public.staff_role[])
returns public.staff_role language plpgsql stable security definer set search_path = '' as $$
declare
  v public.staff_role := private.staff_role();
begin
  if v is null or not (v = any (p_roles)) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if private.session_aal() <> 'aal2' then
    raise exception 'two-step login required' using errcode = 'P0401';
  end if;
  return v;
end;
$$;

create or replace function private.admin_me()
returns jsonb language sql stable security definer set search_path = '' as $$
  select case when s.role is null then null
              else jsonb_build_object('role', s.role, 'email', u.email, 'name', nullif(btrim(p.full_name), ''),
                                      'verified', private.session_aal() = 'aal2') end
  from (select 1) one
  left join public.platform_staff s on s.user_id = (select auth.uid())
  left join auth.users u on u.id = s.user_id
  left join public.profiles p on p.id = s.user_id;
$$;

-- ── 2. Per-account limits ──────────────────────────────────────────────────
create table private.rate_events (
  user_id uuid not null,
  action  text not null,
  at      timestamptz not null default now()
);
create index rate_events_lookup_idx on private.rate_events (user_id, action, at desc);
revoke all on private.rate_events from public, anon, authenticated;

-- Counts this account's recent uses of an action; refuses past the limit.
create function private.hit_limit(p_action text, p_max integer, p_window interval)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    return;
  end if;
  if (select count(*) from private.rate_events
       where user_id = v_uid and action = p_action and at > now() - p_window) >= p_max then
    raise exception 'Too many attempts. Please wait a little and try again.' using errcode = 'P0429';
  end if;
  insert into private.rate_events (user_id, action) values (v_uid, p_action);
end;
$$;
revoke all on function private.hit_limit(text, integer, interval) from public, anon, authenticated;

create function private.limit_new_weddings() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.hit_limit('wedding.create', 20, interval '1 day');
  return new;
end;
$$;
create trigger weddings_rate_limit before insert on public.weddings
  for each row execute function private.limit_new_weddings();

-- Statement-level: one import of 500 guests counts once (adding and editing;
-- removing guests is never limited).
create function private.limit_guest_writes() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.hit_limit('guests.write', 600, interval '1 hour');
  return null;
end;
$$;
create trigger guests_rate_limit before insert or update on public.guests
  for each statement execute function private.limit_guest_writes();

create function private.limit_uploads() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.hit_limit('media.create', 200, interval '1 hour');
  return null;
end;
$$;
create trigger media_rate_limit before insert on public.media
  for each statement execute function private.limit_uploads();

revoke all on function private.limit_new_weddings() from public, anon, authenticated;
revoke all on function private.limit_guest_writes() from public, anon, authenticated;
revoke all on function private.limit_uploads() from public, anon, authenticated;

-- Limits a signed-in person can trigger but never change: the action names
-- and numbers are fixed here.
create function private.limit_action(p_action text)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  case p_action
    when 'order.request' then perform private.hit_limit(p_action, 15, interval '1 hour');
    when 'order.cancel' then perform private.hit_limit(p_action, 10, interval '1 hour');
    else raise exception 'unknown action' using errcode = '22023';
  end case;
end;
$$;
revoke all on function private.limit_action(text) from public, anon, authenticated;
grant execute on function private.limit_action(text) to authenticated;

-- Ordering and cancelling: limited before anything else happens.
create or replace function public.request_publish(p_wedding uuid, p_phone text, p_method text)
returns jsonb language plpgsql volatile security invoker set search_path = '' as $$
begin
  perform private.limit_action('order.request');
  return private.request_publish(p_wedding, p_phone, p_method);
end;
$$;
create or replace function public.cancel_my_order(p_order uuid)
returns jsonb language plpgsql volatile security invoker set search_path = '' as $$
begin
  perform private.limit_action('order.cancel');
  return private.cancel_my_order(p_order);
end;
$$;

-- ── 3. Payment checks ──────────────────────────────────────────────────────
create index if not exists orders_reference_idx on public.orders (lower(reference)) where reference is not null;

-- Why staff might want to double-check before marking an order paid.
create function private.payment_warning(p_order uuid, p_amount numeric, p_reference text)
returns text language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select 'Reference ' || btrim(p_reference) || ' was already used for order #' || o2.number || '.'
       from public.orders o2
      where nullif(btrim(p_reference), '') is not null
        and lower(o2.reference) = lower(btrim(p_reference))
        and o2.id <> p_order and o2.status in ('paid', 'refunded')
      order by o2.paid_at desc limit 1),
    (select 'This order is for ' || private.money(o.amount, o.currency) || ' but you entered '
            || private.money(p_amount, o.currency) || '.'
       from public.orders o
      where o.id = p_order and p_amount is not null and p_amount <> o.amount));
$$;
revoke all on function private.payment_warning(uuid, numeric, text) from public, anon, authenticated;

create function private.admin_mark_paid(p_order uuid, p_amount numeric, p_method text, p_reference text, p_confirmed boolean)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_role    public.staff_role := private.require_staff(array['owner', 'admin']::public.staff_role[]);
  v_warning text;
  v_res     jsonb;
begin
  if p_method is not null and p_method not in ('cash', 'instapay', 'vodafone_cash', 'bank_transfer', 'card', 'paymob', 'other') then
    return jsonb_build_object('ok', false, 'error', 'Unknown payment method.');
  end if;
  v_warning := private.payment_warning(p_order, p_amount, p_reference);
  if v_warning is not null and not coalesce(p_confirmed, false) then
    return jsonb_build_object('ok', false, 'confirm', true, 'error', v_warning);
  end if;
  v_res := private.settle_order(p_order, p_amount, p_method, p_reference, null, true);
  if (v_res ->> 'ok')::boolean then
    if v_warning is not null then
      perform private.order_event(p_order, 'comment', 'Marked as paid after a warning: ' || v_warning);
    end if;
    perform private.audit('order.paid', 'order', p_order::text,
      jsonb_build_object('amount', p_amount, 'method', p_method, 'reference', p_reference, 'warning', v_warning));
  end if;
  return v_res;
end;
$$;

-- The 4-argument version stays for older callers, always with the checks.
create or replace function private.admin_mark_paid(p_order uuid, p_amount numeric, p_method text, p_reference text)
returns jsonb language sql volatile security definer set search_path = '' as $$
  select private.admin_mark_paid(p_order, p_amount, p_method, p_reference, false);
$$;

create function public.admin_mark_paid(p_order uuid, p_amount numeric, p_method text, p_reference text, p_confirmed boolean)
returns jsonb language sql volatile security invoker set search_path = '' as $$
  select private.admin_mark_paid(p_order, p_amount, p_method, p_reference, p_confirmed);
$$;
revoke all on function public.admin_mark_paid(uuid, numeric, text, text, boolean) from public, anon, authenticated;
revoke all on function private.admin_mark_paid(uuid, numeric, text, text, boolean) from public, anon, authenticated;
grant execute on function public.admin_mark_paid(uuid, numeric, text, text, boolean) to authenticated;
grant execute on function private.admin_mark_paid(uuid, numeric, text, text, boolean) to authenticated;

-- ── 4. Security alerts ─────────────────────────────────────────────────────
create function private.admin_alerts(p_days integer)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner', 'admin']::public.staff_role[]);
begin
  return coalesce((
    select jsonb_agg(x order by x ->> 'at' desc) from (
      select jsonb_build_object(
               'at', a.at, 'actor', u.email, 'action', a.action, 'targetType', a.target_type, 'targetId', a.target_id,
               'text', case a.action
                 when 'staff.set' then case when a.details ->> 'role' is null then 'Removed ' || (a.details ->> 'email') || ' from the team'
                                            else 'Gave ' || (a.details ->> 'email') || ' ' || (a.details ->> 'role') || ' access' end
                 when 'sale.refund' then 'Refunded ' || private.money((a.details ->> 'amount')::numeric, 'EGP')
                 when 'order.paid' then 'Marked paid despite: ' || (a.details ->> 'warning')
                 when 'wedding.deactivate' then 'Turned off an invitation' || coalesce(' (' || (a.details ->> 'reason') || ')', '')
                 else a.action end) as x
        from public.admin_audit a left join auth.users u on u.id = a.actor
       where a.at > now() - make_interval(days => least(greatest(coalesce(p_days, 7), 1), 90))
         and (a.action in ('staff.set', 'sale.refund', 'wedding.deactivate')
              or (a.action = 'order.paid' and a.details ->> 'warning' is not null))
       order by a.at desc
       limit 50
    ) t
  ), '[]'::jsonb);
end;
$$;
create function public.admin_alerts(p_days integer) returns jsonb language sql stable security invoker set search_path = '' as $$ select private.admin_alerts(p_days); $$;
revoke all on function public.admin_alerts(integer) from public, anon, authenticated;
revoke all on function private.admin_alerts(integer) from public, anon, authenticated;
grant execute on function public.admin_alerts(integer) to authenticated;
grant execute on function private.admin_alerts(integer) to authenticated;

-- ── 5. Deleting an account ─────────────────────────────────────────────────
create function private.delete_my_account()
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if exists (select 1 from public.platform_staff where user_id = v_uid) then
    return jsonb_build_object('ok', false, 'error', 'Staff accounts can''t be deleted here. Ask the owner to remove you from the team first.');
  end if;
  perform private.hit_limit('account.delete', 3, interval '1 hour');

  -- Orders stay for the accounts, without the person's name or phone.
  update public.orders set status = 'cancelled', cancelled_at = now(), cancel_reason = 'Account deleted'
   where buyer_id = v_uid and status = 'pending';
  update public.orders set customer_name = null, customer_phone = null where buyer_id = v_uid;
  -- Their invitations and everything in them (sections, guests, replies,
  -- wishes, photo records) go with them; files are removed by the app first.
  delete from public.weddings where owner_id = v_uid;
  delete from private.rate_events where user_id = v_uid;
  delete from auth.users where id = v_uid;
  return jsonb_build_object('ok', true);
end;
$$;
create function public.delete_my_account() returns jsonb language sql volatile security invoker set search_path = '' as $$ select private.delete_my_account(); $$;
revoke all on function public.delete_my_account() from public, anon, authenticated;
revoke all on function private.delete_my_account() from public, anon, authenticated;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function private.delete_my_account() to authenticated;
