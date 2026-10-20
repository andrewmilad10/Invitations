-- ═══════════════════════════════════════════════════════════════════════════
-- 0021 · Background jobs, run every night by the database itself (pg_cron)
--
--   • Orders left unpaid for 7 days are cancelled (the couple can order
--     again); the order's timeline says why.
--   • Invitations ending within 14 days get a renewal reminder in a queue.
--     Staff work through it in Admin (WhatsApp the couple, mark as sent).
--   • Each run is written to the activity log with what it did.
--
-- Also: the limits table gets a primary key (performance advisor).
-- ═══════════════════════════════════════════════════════════════════════════

alter table private.rate_events add column id bigint generated always as identity primary key;

-- ── Renewal reminders (a queue staff work through) ─────────────────────────
create table public.renewal_reminders (
  id         bigint generated always as identity primary key,
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  ends_at    timestamptz not null,
  created_at timestamptz not null default now(),
  sent_at    timestamptz,
  sent_by    uuid references auth.users (id) on delete set null,
  unique (wedding_id, ends_at)
);
create index renewal_reminders_open_idx on public.renewal_reminders (ends_at) where sent_at is null;
create index renewal_reminders_sent_by_idx on public.renewal_reminders (sent_by);
alter table public.renewal_reminders enable row level security;
revoke all on public.renewal_reminders from anon, authenticated;
create policy renewal_reminders_closed on public.renewal_reminders as restrictive for all to anon, authenticated using (false) with check (false);

-- ── The jobs ───────────────────────────────────────────────────────────────
create function private.job_cancel_unpaid_orders() returns integer
language plpgsql volatile security definer set search_path = '' as $$
declare
  n integer;
begin
  with c as (
    update public.orders
       set status = 'cancelled', cancelled_at = now(), cancel_reason = 'Not paid within 7 days'
     where status = 'pending' and archived_at is null and created_at < now() - interval '7 days'
     returning id
  ), e as (
    insert into public.order_events (order_id, kind, message)
    select id, 'cancelled', 'Cancelled automatically: not paid within 7 days. The couple can order again.' from c
    returning 1
  )
  select count(*) into n from e;
  return n;
end;
$$;

create function private.job_queue_renewal_reminders() returns integer
language plpgsql volatile security definer set search_path = '' as $$
declare
  n integer;
begin
  with q as (
    insert into public.renewal_reminders (wedding_id, ends_at)
    select w.id, w.active_until
      from public.weddings w
     where w.status = 'published' and w.deactivated_at is null
       and w.active_until > now() and w.active_until <= now() + interval '14 days'
    on conflict (wedding_id, ends_at) do nothing
    returning 1
  )
  select count(*) into n from q;
  return n;
end;
$$;

-- Everything nightly, in one transaction, logged.
create function private.run_daily_jobs() returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v jsonb;
begin
  v := jsonb_build_object(
    'unpaidOrdersCancelled', private.job_cancel_unpaid_orders(),
    'renewalRemindersQueued', private.job_queue_renewal_reminders());
  insert into public.admin_audit (actor, action, target_type, details) values (null, 'job.daily', 'system', v);
  return v;
end;
$$;

revoke all on function private.job_cancel_unpaid_orders() from public, anon, authenticated;
revoke all on function private.job_queue_renewal_reminders() from public, anon, authenticated;
revoke all on function private.run_daily_jobs() from public, anon, authenticated;

-- ── Staff: the reminder queue ──────────────────────────────────────────────
create function private.admin_list_reminders()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner', 'admin']::public.staff_role[]);
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
             'id', r.id, 'weddingId', w.id, 'slug', w.slug,
             'names', w.partner_one_name || ' & ' || w.partner_two_name,
             'endsAt', r.ends_at, 'queuedAt', r.created_at,
             'customerName', o.customer_name, 'customerPhone', o.customer_phone, 'customerEmail', u.email)
           order by r.ends_at)
      from public.renewal_reminders r
      join public.weddings w on w.id = r.wedding_id
      left join auth.users u on u.id = w.owner_id
      left join lateral (
        select x.customer_name, x.customer_phone from public.orders x
         where x.wedding_id = w.id and x.customer_phone is not null
         order by x.created_at desc limit 1) o on true
     where r.sent_at is null and r.ends_at > now() - interval '7 days'
  ), '[]'::jsonb);
end;
$$;

create function private.admin_mark_reminder_sent(p_id bigint)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner', 'admin']::public.staff_role[]);
begin
  update public.renewal_reminders set sent_at = now(), sent_by = (select auth.uid()) where id = p_id and sent_at is null;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'That reminder was already sent.');
  end if;
  perform private.audit('reminder.sent', 'reminder', p_id::text, '{}'::jsonb);
  return jsonb_build_object('ok', true);
end;
$$;

create function public.admin_list_reminders() returns jsonb language sql stable security invoker set search_path = '' as $$ select private.admin_list_reminders(); $$;
create function public.admin_mark_reminder_sent(p_id bigint) returns jsonb language sql volatile security invoker set search_path = '' as $$ select private.admin_mark_reminder_sent(p_id); $$;
revoke all on function public.admin_list_reminders() from public, anon, authenticated;
revoke all on function private.admin_list_reminders() from public, anon, authenticated;
revoke all on function public.admin_mark_reminder_sent(bigint) from public, anon, authenticated;
revoke all on function private.admin_mark_reminder_sent(bigint) from public, anon, authenticated;
grant execute on function public.admin_list_reminders() to authenticated;
grant execute on function private.admin_list_reminders() to authenticated;
grant execute on function public.admin_mark_reminder_sent(bigint) to authenticated;
grant execute on function private.admin_mark_reminder_sent(bigint) to authenticated;

-- ── Schedule: every night at 03:15 Cairo (00:15 UTC) ───────────────────────
-- Only where pg_cron exists (Supabase); local test databases skip it and the
-- tests call run_daily_jobs() directly.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    execute 'create extension if not exists pg_cron with schema pg_catalog';
    perform cron.schedule('vellum-daily-jobs', '15 0 * * *', 'select private.run_daily_jobs()');
  end if;
end;
$$;
