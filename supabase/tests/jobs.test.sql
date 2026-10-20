-- ═══════════════════════════════════════════════════════════════════════════
-- Nightly jobs (0021): unpaid orders cancelled after 7 days, renewal
-- reminders queued for invitations ending within 14 days.
-- ═══════════════════════════════════════════════════════════════════════════
select set_config('request.jwt.claim.aal', 'aal2', true);

insert into auth.users (id, email) values
  ('e0000000-0000-4000-8000-0000000000e1', 'boss2@test.dev'),
  ('e0000000-0000-4000-8000-0000000000e2', 'yara@test.dev');
insert into public.platform_staff (user_id, role) values ('e0000000-0000-4000-8000-0000000000e1', 'owner');

insert into public.weddings (id, owner_id, slug, partner_one_name, partner_two_name, status, active_until) values
  ('e1000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-0000000000e2', 'yara-old-order', 'Yara', 'Ali', 'draft', null),
  ('e1000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-0000000000e2', 'yara-new-order', 'Yara', 'Ali', 'draft', null),
  ('e1000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-0000000000e2', 'yara-ending', 'Yara', 'Ali', 'published', now() + interval '10 days'),
  ('e1000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-0000000000e2', 'yara-plenty', 'Yara', 'Ali', 'published', now() + interval '60 days');
insert into public.orders (wedding_id, buyer_id, amount, method, status, paid_at, customer_phone, created_at) values
  ('e1000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-0000000000e2', 1000, 'instapay', 'pending', null, '01001112222', now() - interval '8 days'),
  ('e1000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-0000000000e2', 1000, 'instapay', 'pending', null, '01001112222', now() - interval '2 days'),
  ('e1000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-0000000000e2', 1000, 'instapay', 'paid', now() - interval '80 days', '01001112222', now() - interval '80 days');

select tests.eq((private.run_daily_jobs() ->> 'unpaidOrdersCancelled')::int, 1, 'the order unpaid for 8 days is cancelled');
select tests.eq((select status::text from public.orders where wedding_id = 'e1000000-0000-4000-8000-000000000002'), 'pending', 'a 2-day-old order is left alone');
select tests.ok((select count(*) from public.order_events e join public.orders o on o.id = e.order_id where o.wedding_id = 'e1000000-0000-4000-8000-000000000001' and e.kind = 'cancelled') = 1, 'the timeline says why');
select tests.eq((select count(*) from public.renewal_reminders)::int, 1, 'one invitation ends within 14 days');
select tests.eq((private.run_daily_jobs() ->> 'renewalRemindersQueued')::int, 0, 'running again adds no duplicate reminder');
select tests.ok((select count(*) from public.admin_audit where action = 'job.daily') = 2, 'every run is logged');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'e0000000-0000-4000-8000-0000000000e2', true);
select tests.throws($$select public.admin_list_reminders()$$, '42501', 'couples cannot see the reminder queue');
select tests.throws($$select * from public.renewal_reminders$$, '42501', 'nobody reads the queue table directly');
select tests.throws($$select private.run_daily_jobs()$$, '42501', 'couples cannot run the jobs');

select set_config('request.jwt.claim.sub', 'e0000000-0000-4000-8000-0000000000e1', true);
select tests.eq(public.admin_list_reminders() -> 0 ->> 'customerPhone', '01001112222', 'staff see who to message');
select tests.eq(public.admin_mark_reminder_sent((public.admin_list_reminders() -> 0 ->> 'id')::bigint) ->> 'ok', 'true', 'staff mark it as sent');
select tests.eq(jsonb_array_length(public.admin_list_reminders()), 0, 'and it leaves the queue');
