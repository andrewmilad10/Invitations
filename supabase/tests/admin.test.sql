-- ═══════════════════════════════════════════════════════════════════════════
-- Admin (0014): who may see and change what, live periods and deactivation.
-- ═══════════════════════════════════════════════════════════════════════════
-- Staff sessions in these tests have passed two-step login (0020).
select set_config('request.jwt.claim.aal', 'aal2', true);


create function tests.awid(p_slug text) returns uuid
language sql security definer set search_path = '' as $$
  select id from public.weddings where slug = p_slug;
$$;
grant execute on function tests.awid(text) to anon, authenticated;

insert into auth.users (id, email) values
  ('a0000000-0000-4000-8000-0000000000a1', 'owner@test.dev'),
  ('a0000000-0000-4000-8000-0000000000a2', 'admin@test.dev'),
  ('a0000000-0000-4000-8000-0000000000a3', 'marketing@test.dev'),
  ('a0000000-0000-4000-8000-0000000000a4', 'couple@test.dev'),
  ('a0000000-0000-4000-8000-0000000000a5', 'stranger@test.dev');
insert into public.platform_staff (user_id, role) values
  ('a0000000-0000-4000-8000-0000000000a1', 'owner'),
  ('a0000000-0000-4000-8000-0000000000a2', 'admin'),
  ('a0000000-0000-4000-8000-0000000000a3', 'marketing');

-- the couple's wedding, published
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a4', true);
insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name)
values ('a0000000-0000-4000-8000-0000000000a4', 'lina-and-sami-x7k2qp', 'Lina', 'Sami');
select tests.throws($$update public.weddings set status = 'published' where slug = 'lina-and-sami-x7k2qp'$$, 'P0402', 'a couple cannot publish before paying');
select tests.throws($$update public.weddings set active_until = now() + interval '10 years' where slug = 'lina-and-sami-x7k2qp'$$, '42501', 'a couple cannot extend their own live period');
select tests.throws($$update public.weddings set deactivated_at = null where slug = 'lina-and-sami-x7k2qp'$$, '42501', 'a couple cannot undo a deactivation');
select tests.ok(public.admin_me() is null, 'a couple is not staff');
select tests.throws($$select public.admin_overview(30)$$, '42501', 'a couple cannot open the overview');
select tests.throws($$select public.admin_list_weddings('all', null, 50, 0)$$, '42501', 'a couple cannot list invitations');
select tests.throws($$select * from public.platform_staff$$, '42501', 'nobody reads the staff table directly');
select tests.throws($$select * from public.admin_audit$$, '42501', 'nobody reads the audit log directly');
select tests.throws($$insert into public.orders (wedding_id, amount, method) values (tests.awid('lina-and-sami-x7k2qp'), 0, 'cash')$$, '42501', 'a couple cannot record a sale for themselves');

-- guests (anon) can't even call the admin functions
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select tests.throws($$select public.admin_me()$$, '42501', 'guests cannot call admin functions');
select tests.ok(public.get_public_invitation('lina-and-sami-x7k2qp') is null, 'an unpaid invitation is not shown');

-- ── Marketing: numbers, no money, no emails, no changes ────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a3', true);
select tests.eq(public.admin_me() ->> 'role', 'marketing', 'marketing is recognised');
select tests.ok(public.admin_overview(30) -> 'totals' ->> 'revenue' is null, 'marketing does not see revenue');
select tests.ok((public.admin_overview(30) -> 'totals' ->> 'weddings')::int >= 1, 'marketing sees counts');
select tests.ok(public.admin_list_weddings('all', null, 50, 0) -> 'rows' -> 0 ->> 'ownerEmail' is null, 'marketing does not see customer emails');
select tests.eq((public.admin_list_weddings('all', 'couple@test', 50, 0) ->> 'total')::int, 0, 'marketing cannot search by customer email');
select tests.throws($$select public.admin_list_sales(null, 50, 0)$$, '42501', 'marketing cannot see sales');
select tests.throws($$select public.admin_record_sale(tests.awid('lina-and-sami-x7k2qp'), 1000, 'cash', null, null, 3, true)$$, '42501', 'marketing cannot record sales');
select tests.throws($$select public.admin_set_deactivated(tests.awid('lina-and-sami-x7k2qp'), true, 'x')$$, '42501', 'marketing cannot deactivate');
select tests.throws($$select public.admin_activity(10)$$, '42501', 'marketing cannot read the activity log');

-- ── Owner: record a sale, deactivate, extend ───────────────────────────────
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a1', true);
select tests.eq(public.admin_record_sale(tests.awid('lina-and-sami-x7k2qp'), 1000, 'instapay', 'IP-123', null, 3, true) ->> 'ok', 'true', 'the owner records a sale');
reset role;
select tests.ok((select active_until between now() + interval '89 days' and now() + interval '93 days' from public.weddings where slug = 'lina-and-sami-x7k2qp'), 'a sale keeps the invitation live for 3 months');
select tests.eq((select status::text from public.weddings where slug = 'lina-and-sami-x7k2qp'), 'published', 'and publishes it');
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a1', true);
select tests.eq((public.admin_overview(30) -> 'totals' ->> 'revenue')::numeric, 1000::numeric, 'the owner sees revenue');
select tests.eq(public.admin_list_sales('IP-123', 50, 0) -> 'rows' -> 0 ->> 'buyerEmail', 'couple@test.dev', 'the sale belongs to the couple');
select tests.ok(public.admin_list_weddings('paid', null, 50, 0) -> 'rows' -> 0 ->> 'ownerEmail' = 'couple@test.dev', 'the owner sees customer emails');
select tests.eq(public.admin_record_sale(tests.awid('lina-and-sami-x7k2qp'), -5, 'cash', null, null, 3, false) ->> 'ok', 'false', 'negative amounts are refused');
select tests.throws($$select public.admin_record_sale(tests.awid('lina-and-sami-x7k2qp'), 5, 'bitcoin', null, null, 3, false)$$, '23514', 'unknown payment methods are refused');

select tests.eq(public.admin_set_deactivated(tests.awid('lina-and-sami-x7k2qp'), true, 'Reported') ->> 'ok', 'true', 'the owner deactivates an invitation');
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select tests.ok(public.get_public_invitation('lina-and-sami-x7k2qp') is null, 'a deactivated invitation is not shown');
select tests.eq(public.submit_reply('lina-and-sami-x7k2qp', null, 'Guest', true, 1, null, null) ->> 'error', 'closed', 'a deactivated invitation takes no replies');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a1', true);
select tests.eq(public.admin_set_deactivated(tests.awid('lina-and-sami-x7k2qp'), false, null) ->> 'ok', 'true', 'the owner turns it back on');
select tests.eq(public.admin_extend(tests.awid('lina-and-sami-x7k2qp'), -365) ->> 'ok', 'true', 'the owner can shorten the period');
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select tests.ok(public.get_public_invitation('lina-and-sami-x7k2qp') is null, 'an invitation past its period is not shown');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a1', true);
select tests.eq(public.admin_extend(tests.awid('lina-and-sami-x7k2qp'), 30) ->> 'ok', 'true', 'extending an expired one starts from today');
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select tests.ok(public.get_public_invitation('lina-and-sami-x7k2qp') is not null, 'it is live again');

-- ── Refunds ────────────────────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a2', true);
select tests.eq(public.admin_refund((select (public.admin_list_sales('IP-123', 1, 0) -> 'rows' -> 0 ->> 'id')::uuid), true) ->> 'ok', 'true', 'an admin refunds a sale and turns the invitation off');
select tests.eq((public.admin_overview(30) -> 'totals' ->> 'revenue')::numeric, 0::numeric, 'refunds leave revenue');

-- ── Team: only the owner manages staff, never their own access ─────────────
select tests.throws($$select public.admin_set_staff('stranger@test.dev', 'admin')$$, '42501', 'an admin cannot add staff');
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a1', true);
select tests.eq(public.admin_set_staff('owner@test.dev', null) ->> 'ok', 'false', 'the owner cannot remove themselves');
select tests.eq(public.admin_set_staff('nobody@test.dev', 'admin') ->> 'ok', 'false', 'staff must have an account');
select tests.eq(public.admin_set_staff('Stranger@Test.dev', 'marketing') ->> 'ok', 'true', 'the owner adds a marketing member by email');
select tests.eq(public.admin_set_staff('stranger@test.dev', '') ->> 'ok', 'true', 'and removes them');

-- ── Everything is written down ─────────────────────────────────────────────
select tests.ok(jsonb_array_length(public.admin_activity(100)) >= 7, 'every change is in the activity log');
select tests.eq(public.admin_activity(100) -> 0 ->> 'actor', 'owner@test.dev', 'the log says who did it');

-- a couple sees their own receipts, nobody else's
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a4', true);
select tests.eq((select count(*) from public.orders)::int, 1, 'a couple sees their own receipt');
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a5', true);
select tests.eq((select count(*) from public.orders)::int, 0, 'a stranger sees no receipts');

-- ── 0016: faster reads keep the same rules ─────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a1', true);
select tests.eq(jsonb_array_length(public.admin_overview(7) -> 'daily'), 7, 'the chart has one entry per day, empty days included');
select tests.eq((public.admin_overview(7) -> 'daily' -> 6 ->> 'day'), to_char((now() at time zone 'Africa/Cairo')::date, 'YYYY-MM-DD'), 'the chart ends today, in Cairo time');
select tests.eq((public.admin_list_sales('IP-123', 50, 0) ->> 'total')::int, 1, 'sales search finds the reference');
select tests.ok(public.admin_list_sales(null, 50, 0) ? 'revenue', 'sales totals come from the database');
select tests.eq((public.admin_list_weddings('all', '%', 50, 0) ->> 'total')::int, 0, 'search text is literal: % is not a wildcard');
select tests.eq((public.admin_list_weddings('all', 'lina', 50, 0) ->> 'total')::int, 1, 'search by name');
select tests.eq((public.admin_list_weddings('all', 'COUPLE@test', 50, 0) ->> 'total')::int, 1, 'the owner searches by customer email');
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a3', true);
select tests.eq((public.admin_list_weddings('all', 'couple@test', 50, 0) ->> 'total')::int, 0, 'marketing still cannot search by customer email');
select tests.throws($$select public.admin_list_sales(null, 50, 0)$$, '42501', 'marketing still cannot see sales');

-- 0019: the header shows staff by name
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a1', true);
select tests.ok(public.admin_me() ? 'name', 'admin_me includes the name');
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-0000000000a4', true);
select tests.ok(public.admin_me() is null, 'still nothing for non-staff');
