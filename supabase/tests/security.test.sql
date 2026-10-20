-- ═══════════════════════════════════════════════════════════════════════════
-- Security hardening (0020): two-step login for staff, per-account limits,
-- payment warnings, alerts, deleting an account.
-- ═══════════════════════════════════════════════════════════════════════════

create function tests.swid(p_slug text) returns uuid
language sql security definer set search_path = '' as $$
  select id from public.weddings where slug = p_slug;
$$;
grant execute on function tests.swid(text) to anon, authenticated;

insert into auth.users (id, email, raw_user_meta_data) values
  ('d0000000-0000-4000-8000-0000000000d1', 'chief@test.dev', '{}'),
  ('d0000000-0000-4000-8000-0000000000d2', 'hana@test.dev', '{"full_name": "Hana Samir"}'),
  ('d0000000-0000-4000-8000-0000000000d3', 'leaving@test.dev', '{"full_name": "Rana Fawzy"}');
insert into public.platform_staff (user_id, role) values ('d0000000-0000-4000-8000-0000000000d1', 'owner');

-- ── Two-step login ─────────────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', 'd0000000-0000-4000-8000-0000000000d1', true);
select set_config('request.jwt.claim.aal', 'aal1', true);
select tests.eq(public.admin_me() ->> 'role', 'owner', 'staff are recognised before the code');
select tests.eq((public.admin_me() ->> 'verified')::boolean, false, 'and told they still need the code');
select tests.throws($$select public.admin_overview(30)$$, 'P0401', 'no admin data without the code');
select tests.throws($$select public.admin_list_orders('all', null, 10, 0)$$, 'P0401', 'no orders without the code');
select tests.throws($$select public.admin_set_staff('hana@test.dev', 'admin')$$, 'P0401', 'no team changes without the code');
select set_config('request.jwt.claims', '{"aal": "aal2"}', true);
select set_config('request.jwt.claim.aal', '', true);
select tests.eq((public.admin_me() ->> 'verified')::boolean, true, 'the code is read from the session claims');
select tests.ok(public.admin_overview(30) is not null, 'admin works after the code');
select set_config('request.jwt.claims', '', true);
select set_config('request.jwt.claim.aal', 'aal2', true);

-- ── Payment warnings ───────────────────────────────────────────────────────
select set_config('request.jwt.claim.sub', 'd0000000-0000-4000-8000-0000000000d2', true);
insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name) values
  ('d0000000-0000-4000-8000-0000000000d2', 'hana-one-a1b2c3', 'Hana', 'Adel'),
  ('d0000000-0000-4000-8000-0000000000d2', 'hana-two-d4e5f6', 'Hana', 'Adel');
select public.request_publish(tests.swid('hana-one-a1b2c3'), '01001234567', 'instapay');
select public.request_publish(tests.swid('hana-two-d4e5f6'), '01001234567', 'instapay');

select set_config('request.jwt.claim.sub', 'd0000000-0000-4000-8000-0000000000d1', true);
select tests.eq(public.admin_mark_paid((select (public.admin_list_orders('pending', 'hana-one', 1, 0) -> 'rows' -> 0 ->> 'id')::uuid), 1000, 'instapay', 'IP-555', false) ->> 'ok', 'true', 'a clean payment goes straight through');
select tests.eq(public.admin_mark_paid((select (public.admin_list_orders('pending', 'hana-two', 1, 0) -> 'rows' -> 0 ->> 'id')::uuid), 1000, 'instapay', 'ip-555 ', false) ->> 'confirm', 'true', 'a reused reference asks for confirmation');
select tests.eq(public.admin_mark_paid((select (public.admin_list_orders('pending', 'hana-two', 1, 0) -> 'rows' -> 0 ->> 'id')::uuid), 900, 'instapay', 'IP-556', false) ->> 'confirm', 'true', 'a different amount asks for confirmation');
select tests.eq(public.admin_mark_paid((select (public.admin_list_orders('pending', 'hana-two', 1, 0) -> 'rows' -> 0 ->> 'id')::uuid), 900, 'instapay', 'IP-556', true) ->> 'ok', 'true', 'staff can confirm and go ahead');
select tests.ok(public.admin_alerts(7) -> 0 ->> 'text' like 'Marked paid despite%', 'and it shows in the alerts');

-- ── Per-account limits ─────────────────────────────────────────────────────
select set_config('request.jwt.claim.sub', 'd0000000-0000-4000-8000-0000000000d3', true);
select tests.throws($$select private.hit_limit('x', 1, interval '1 hour')$$, '42501', 'couples cannot call the limiter directly');
select tests.throws($$select private.limit_action('whatever')$$, '22023', 'only known actions');
insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name)
  select 'd0000000-0000-4000-8000-0000000000d3', 'rana-' || g, 'Rana', 'Ali' from generate_series(1, 20) g;
select tests.throws($$insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name) values ('d0000000-0000-4000-8000-0000000000d3', 'rana-21', 'Rana', 'Ali')$$, 'P0429', 'at most 20 new invitations a day');
select tests.eq((select count(*) from public.weddings where slug like 'rana-%')::int, 20, 'the 20 before it are kept');

-- ── Deleting an account ────────────────────────────────────────────────────
select public.request_publish(tests.swid('rana-1'), '01009876543', 'vodafone_cash');
select set_config('request.jwt.claim.sub', 'd0000000-0000-4000-8000-0000000000d1', true);
select tests.eq(public.delete_my_account() ->> 'ok', 'false', 'staff cannot delete themselves here');
select set_config('request.jwt.claim.sub', 'd0000000-0000-4000-8000-0000000000d3', true);
select tests.eq(public.delete_my_account() ->> 'ok', 'true', 'a couple deletes their account');
reset role;
select tests.eq((select count(*) from auth.users where id = 'd0000000-0000-4000-8000-0000000000d3')::int, 0, 'the account is gone');
select tests.eq((select count(*) from public.weddings where slug like 'rana-%')::int, 0, 'with their invitations');
select tests.eq((select status::text from public.orders where customer_phone is null and buyer_id is null and cancel_reason = 'Account deleted' limit 1), 'cancelled', 'open orders are cancelled and kept without name or phone');
select tests.eq((select count(*) from public.orders where customer_phone = '01009876543')::int, 0, 'no phone number is left behind');
