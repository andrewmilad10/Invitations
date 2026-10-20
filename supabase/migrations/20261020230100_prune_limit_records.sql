-- 0023 · The nightly jobs also clear limit records older than 2 days (the
-- longest limit window is 1 day), so private.rate_events stays small.
create function private.job_prune_rate_events() returns integer
language plpgsql volatile security definer set search_path = '' as $$
declare
  n integer;
begin
  delete from private.rate_events where at < now() - interval '2 days';
  get diagnostics n = row_count;
  return n;
end;
$$;
revoke all on function private.job_prune_rate_events() from public, anon, authenticated;

create or replace function private.run_daily_jobs() returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v jsonb;
begin
  v := jsonb_build_object(
    'unpaidOrdersCancelled', private.job_cancel_unpaid_orders(),
    'renewalRemindersQueued', private.job_queue_renewal_reminders(),
    'limitRecordsCleared', private.job_prune_rate_events());
  insert into public.admin_audit (actor, action, target_type, details) values (null, 'job.daily', 'system', v);
  return v;
end;
$$;
