-- ═══════════════════════════════════════════════════════════════════════════
-- Orders (0018): the couple orders, staff confirm payment, it goes live.
-- ═══════════════════════════════════════════════════════════════════════════
-- Staff sessions in these tests have passed two-step login (0020).
select set_config('request.jwt.claim.aal', 'aal2', true);


create function tests.owid(p_slug text) returns uuid
language sql security definer set search_path = '' as $$
  select id from public.weddings where slug = p_slug;
$$;
grant execute on function tests.owid(text) to anon, authenticated;

insert into auth.users (id, email, raw_user_meta_data) values
  ('c0000000-0000-4000-8000-0000000000c1', 'boss@test.dev', '{}'),
  ('c0000000-0000-4000-8000-0000000000c2', 'mona@test.dev', '{"full_name": "Mona Adel"}'),
  ('c0000000-0000-4000-8000-0000000000c3', 'other@test.dev', '{}'),
  ('c0000000-0000-4000-8000-0000000000c4', 'promo@test.dev', '{}');
insert into public.platform_staff (user_id, role) values
  ('c0000000-0000-4000-8000-0000000000c1', 'owner'),
  ('c0000000-0000-4000-8000-0000000000c4', 'marketing');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-8000-0000000000c2', true);
insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name)
values ('c0000000-0000-4000-8000-0000000000c2', 'mona-and-ziad-q1w2e3', 'Mona', 'Ziad');

-- ── The couple orders ──────────────────────────────────────────────────────
select tests.throws($$update public.weddings set status = 'published' where slug = 'mona-and-ziad-q1w2e3'$$, 'P0402', 'publishing needs payment');
select tests.eq((public.my_publish_state(tests.owid('mona-and-ziad-q1w2e3')) ->> 'canPublish')::boolean, false, 'not paid yet');
select tests.eq(public.request_publish(tests.owid('mona-and-ziad-q1w2e3'), '123', 'instapay') ->> 'ok', 'false', 'a phone number is needed');
select tests.eq(public.request_publish(tests.owid('mona-and-ziad-q1w2e3'), '0100 123 4567', 'bitcoin') ->> 'ok', 'false', 'only known payment methods');
select tests.eq(public.request_publish(tests.owid('mona-and-ziad-q1w2e3'), '0100 123 4567', 'instapay') -> 'order' ->> 'status', 'pending', 'placing an order makes it payment pending');
select tests.ok((public.request_publish(tests.owid('mona-and-ziad-q1w2e3'), '0100 123 4567', 'instapay') -> 'order' ->> 'number')::bigint >= 1001, 'orders are numbered from 1001');
select tests.eq((select count(*) from public.orders)::int, 1, 'ordering twice returns the same order');
select tests.eq((public.my_publish_state(tests.owid('mona-and-ziad-q1w2e3')) -> 'order' ->> 'amount')::numeric, 1000::numeric, 'the price is set by the database');
select tests.throws($$select note from public.orders$$, '42501', 'couples cannot read staff notes');
select tests.throws($$select tags from public.orders$$, '42501', 'couples cannot read tags');
select tests.throws($$update public.orders set status = 'paid'$$, '42501', 'couples cannot mark their own order as paid');
select tests.throws($$select public.admin_list_orders('all', null, 50, 0)$$, '42501', 'couples cannot list orders');

-- someone else can't order or see it
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-8000-0000000000c3', true);
select tests.eq(public.request_publish(tests.owid('mona-and-ziad-q1w2e3'), '01001234567', 'instapay') ->> 'ok', 'false', 'strangers cannot order for someone else');
select tests.ok(public.my_publish_state(tests.owid('mona-and-ziad-q1w2e3')) is null, 'strangers see nothing');
select tests.eq((select count(*) from public.orders)::int, 0, 'strangers see no orders');

-- marketing has no access to orders
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-8000-0000000000c4', true);
select tests.throws($$select public.admin_list_orders('all', null, 50, 0)$$, '42501', 'marketing cannot see orders');

-- ── Staff ──────────────────────────────────────────────────────────────────
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-8000-0000000000c1', true);
select tests.eq((public.admin_list_orders('pending', null, 50, 0) ->> 'total')::int, 1, 'the order is in Payment pending');
select tests.eq((public.admin_list_orders('all', null, 50, 0) -> 'counts' ->> 'pending')::int, 1, 'tabs are counted');
select tests.eq(public.admin_list_orders('all', 'mona adel', 50, 0) -> 'rows' -> 0 ->> 'customerName', 'Mona Adel', 'search by customer name');
select tests.eq((public.admin_list_orders('all', '01001234567', 50, 0) ->> 'total')::int, 1, 'search by phone');
select tests.eq((public.admin_list_orders('all', '#' || (public.admin_list_orders('all', null, 1, 0) -> 'rows' -> 0 ->> 'number'), 50, 0) ->> 'total')::int, 1, 'search by order number');
select tests.eq(public.admin_list_orders('all', null, 50, 0) -> 'rows' -> 0 ->> 'live', 'notLive', 'not live before payment');
select tests.eq(public.admin_order_note((select (public.admin_list_orders('all', null, 1, 0) -> 'rows' -> 0 ->> 'id')::uuid), 'Called her, paying tonight') ->> 'ok', 'true', 'staff leave a comment');
select tests.eq(public.admin_set_order_tags((select (public.admin_list_orders('all', null, 1, 0) -> 'rows' -> 0 ->> 'id')::uuid), array['VIP', ' vip ', '', 'VIP']) -> 'tags', '["VIP", "vip"]'::jsonb, 'tags are trimmed and de-duplicated');
select tests.eq(public.admin_mark_paid((select (public.admin_list_orders('all', null, 1, 0) -> 'rows' -> 0 ->> 'id')::uuid), 1000, 'instapay', 'IP-77') ->> 'ok', 'true', 'mark as paid');
select tests.eq(public.admin_mark_paid((select (public.admin_list_orders('all', null, 1, 0) -> 'rows' -> 0 ->> 'id')::uuid), 1000, 'instapay', 'IP-77') ->> 'ok', 'false', 'cannot be paid twice');
select tests.eq(public.admin_list_orders('all', null, 50, 0) -> 'rows' -> 0 ->> 'live', 'live', 'paid means live');
select tests.eq(jsonb_array_length(public.admin_get_order((select (public.admin_list_orders('all', null, 1, 0) -> 'rows' -> 0 ->> 'id')::uuid)) -> 'events'), 5, 'timeline: placed, confirmation, comment, paid, live');
select tests.eq(public.admin_get_order((select (public.admin_list_orders('all', null, 1, 0) -> 'rows' -> 0 ->> 'id')::uuid)) -> 'customer' ->> 'nth', '1', 'first order of this customer');
select tests.eq((public.admin_overview(30) -> 'totals' ->> 'pendingOrders')::int, 0, 'nothing waiting for payment');
select tests.eq(public.admin_cancel_order((select (public.admin_list_orders('all', null, 1, 0) -> 'rows' -> 0 ->> 'id')::uuid), 'x') ->> 'ok', 'false', 'paid orders are refunded, not cancelled');

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select tests.ok(public.get_public_invitation('mona-and-ziad-q1w2e3') is not null, 'guests see it once paid');

-- the couple can unpublish and publish again during the paid period
set local role authenticated;
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-8000-0000000000c2', true);
update public.weddings set status = 'draft' where slug = 'mona-and-ziad-q1w2e3';
update public.weddings set status = 'published' where slug = 'mona-and-ziad-q1w2e3';
select tests.eq((select status::text from public.weddings where slug = 'mona-and-ziad-q1w2e3'), 'published', 'republishing within the paid period works');
select tests.eq((public.request_publish(tests.owid('mona-and-ziad-q1w2e3'), '01001234567', 'instapay') ->> 'paid')::boolean, true, 'no new order while paid');

-- ── The couple cancels a second invitation's order; staff archive it ──────
insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name)
values ('c0000000-0000-4000-8000-0000000000c2', 'mona-second-r4t5y6', 'Mona', 'Ziad');
select tests.eq(public.cancel_my_order((public.request_publish(tests.owid('mona-second-r4t5y6'), '01001234567', 'vodafone_cash') -> 'order' ->> 'id')::uuid) ->> 'ok', 'true', 'the couple cancels their order');
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-8000-0000000000c1', true);
select tests.eq((public.admin_list_orders('cancelled', null, 50, 0) ->> 'total')::int, 1, 'it shows under Cancelled');
select tests.eq(public.admin_archive_order((public.admin_list_orders('cancelled', null, 1, 0) -> 'rows' -> 0 ->> 'id')::uuid, true) ->> 'ok', 'true', 'staff archive it');
select tests.eq((public.admin_list_orders('archived', null, 50, 0) ->> 'total')::int, 1, 'it shows under Archived');
select tests.eq((public.admin_list_orders('all', null, 50, 0) ->> 'total')::int, 1, 'and leaves All');

-- staff recording a sale settles the couple's open order instead of adding one
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-8000-0000000000c2', true);
select tests.eq(public.request_publish(tests.owid('mona-second-r4t5y6'), '01001234567', 'instapay') -> 'order' ->> 'status', 'pending', 'a new order after cancelling');
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-8000-0000000000c1', true);
select tests.eq(public.admin_record_sale(tests.owid('mona-second-r4t5y6'), 900, 'cash', null, 'discount', 3, true) ->> 'ok', 'true', 'staff record the sale');
select tests.eq((public.admin_list_orders('pending', null, 50, 0) ->> 'total')::int, 0, 'the open order was the one paid');
select tests.eq((public.admin_list_sales(null, 50, 0) ->> 'revenue')::numeric, 1900::numeric, 'sales total paid orders only');
