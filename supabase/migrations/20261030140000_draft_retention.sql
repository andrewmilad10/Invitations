-- ═══════════════════════════════════════════════════════════════════════════
-- 0030 · Draft retention + lifecycle statistics
--
--   • Every invitation's lifecycle is written to the activity log (admin_audit),
--     so it is kept even after the invitation itself is deleted:
--       draft.created        a new draft was started
--       draft.published      a draft went live
--       draft.deleted_user   the couple removed their own draft
--       draft.expired        we removed an abandoned draft after 14 days
--   • A nightly job removes drafts that have sat untouched past 14 days from
--     creation — but ONLY ones that were never published and never paid for.
--
-- The events reuse private.audit(), so the actor is the couple for their own
-- actions and NULL (the system) for the nightly cleanup. No new table: the
-- activity log already outlives the weddings it references (target_id is text).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Lifecycle logging ──────────────────────────────────────────────────────
-- One trigger covers create / publish / delete. Deletes are told apart by a
-- transaction-local flag the nightly job sets (app.delete_reason = 'expired');
-- a delete from the app leaves it unset and counts as the couple's own.
create function private.log_draft_lifecycle() returns trigger
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_reason text;
begin
  if tg_op = 'INSERT' then
    if new.status = 'draft' then
      perform private.audit('draft.created', 'wedding', new.id::text,
        jsonb_build_object('names', new.partner_one_name || ' & ' || new.partner_two_name,
                           'slug', new.slug, 'createdAt', new.created_at));
    end if;
    return new;

  elsif tg_op = 'UPDATE' then
    if new.status = 'published' and old.status is distinct from 'published' then
      perform private.audit('draft.published', 'wedding', new.id::text,
        jsonb_build_object('names', new.partner_one_name || ' & ' || new.partner_two_name, 'slug', new.slug));
    end if;
    return new;

  else -- DELETE: only drafts are part of the draft lifecycle
    if old.status = 'draft' then
      v_reason := coalesce(nullif(current_setting('app.delete_reason', true), ''), 'user');
      perform private.audit(
        case when v_reason = 'expired' then 'draft.expired' else 'draft.deleted_user' end,
        'wedding', old.id::text,
        jsonb_build_object('names', old.partner_one_name || ' & ' || old.partner_two_name,
                           'slug', old.slug, 'createdAt', old.created_at, 'ownerId', old.owner_id));
    end if;
    return old;
  end if;
end;
$$;

create trigger weddings_lifecycle_log
  after insert or update or delete on public.weddings
  for each row execute function private.log_draft_lifecycle();

-- ── Nightly cleanup of abandoned drafts ────────────────────────────────────
-- Never touches anything published, paid for, or still within its live period.
create function private.job_delete_expired_drafts() returns integer
language plpgsql volatile security definer set search_path = '' as $$
declare
  n integer;
begin
  perform set_config('app.delete_reason', 'expired', true);
  with d as (
    delete from public.weddings w
     where w.status = 'draft'
       and w.published_at is null
       and w.active_until is null
       and w.created_at < now() - interval '14 days'
       and not exists (select 1 from public.orders o where o.wedding_id = w.id and o.status = 'paid')
    returning 1
  )
  select count(*) into n from d;
  -- Clear the flag so a later delete in the same transaction is never
  -- mislabelled as an expiry (cron and a user action are normally separate
  -- transactions, but this keeps it correct even if they ever share one).
  perform set_config('app.delete_reason', '', true);
  return n;
end;
$$;

-- Fold it into the nightly run (keeps the single logged transaction). Keeps
-- every job the earlier migrations added; only adds the draft cleanup.
create or replace function private.run_daily_jobs() returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v jsonb;
begin
  v := jsonb_build_object(
    'unpaidOrdersCancelled', private.job_cancel_unpaid_orders(),
    'renewalRemindersQueued', private.job_queue_renewal_reminders(),
    'limitRecordsCleared', private.job_prune_rate_events(),
    'expiredDraftsDeleted', private.job_delete_expired_drafts());
  insert into public.admin_audit (actor, action, target_type, details) values (null, 'job.daily', 'system', v);
  return v;
end;
$$;

-- Draft lifecycle is its own thing, not staff activity — keep it out of the
-- main admin activity feed so that stays about what staff did.
create or replace function private.admin_activity(p_limit integer)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner', 'admin']::public.staff_role[]);
begin
  return coalesce((
    select jsonb_agg(x order by x->>'at' desc) from (
      select jsonb_build_object('at', a.at, 'actor', u.email, 'action', a.action, 'targetType', a.target_type, 'targetId', a.target_id, 'details', a.details) as x
        from public.admin_audit a left join auth.users u on u.id = a.actor
       where a.action not like 'draft.%'
       order by a.at desc
       limit least(greatest(coalesce(p_limit, 100), 1), 500)
    ) t
  ), '[]'::jsonb);
end;
$$;

-- ── Statistics: lifecycle counts for Admin ─────────────────────────────────
create function private.draft_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner', 'admin', 'marketing']::public.staff_role[]);
begin
  return coalesce((
    select jsonb_object_agg(action, n)
      from (select action, count(*) as n
              from public.admin_audit
             where action in ('draft.created', 'draft.published', 'draft.deleted_user', 'draft.expired')
             group by action) s
  ), '{}'::jsonb);
end;
$$;
create function public.draft_stats() returns jsonb language sql stable security invoker set search_path = '' as $$ select private.draft_stats(); $$;

-- The recent draft events themselves (created / published / user-deleted / expired),
-- for the "tell me" list in Admin. Survives the draft's deletion.
create function private.draft_log(p_limit integer) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_role public.staff_role := private.require_staff(array['owner', 'admin', 'marketing']::public.staff_role[]);
begin
  return coalesce((
    select jsonb_agg(x order by x->>'at' desc) from (
      select jsonb_build_object('at', a.at, 'action', a.action,
               'names', a.details->>'names', 'slug', a.details->>'slug', 'actor', u.email) as x
        from public.admin_audit a left join auth.users u on u.id = a.actor
       where a.action like 'draft.%'
       order by a.at desc
       limit least(greatest(coalesce(p_limit, 50), 1), 200)
    ) t
  ), '[]'::jsonb);
end;
$$;
create function public.draft_log(p_limit integer) returns jsonb language sql stable security invoker set search_path = '' as $$ select private.draft_log(p_limit); $$;

revoke all on function private.log_draft_lifecycle() from public, anon, authenticated;
revoke all on function private.job_delete_expired_drafts() from public, anon, authenticated;
revoke all on function private.draft_stats() from public, anon, authenticated;
revoke all on function public.draft_stats() from public, anon, authenticated;
revoke all on function private.draft_log(integer) from public, anon, authenticated;
revoke all on function public.draft_log(integer) from public, anon, authenticated;
grant execute on function private.draft_stats() to authenticated;
grant execute on function public.draft_stats() to authenticated;
grant execute on function private.draft_log(integer) to authenticated;
grant execute on function public.draft_log(integer) to authenticated;
