#!/usr/bin/env node
// Times the admin database functions against a large made-up data set.
//   KEEP_TEST_DB=1 DATABASE_URL=… npm run test:db   (builds vellum_test)
//   DATABASE_URL=… node scripts/bench-admin.mjs [--seed]
// --seed adds 20k accounts, 50k invitations, 30k sales, ~6k unpaid orders and
// 600k replies first.
import pg from "pg";

const url = new URL(process.env.DATABASE_URL ?? "postgres://postgres@127.0.0.1:5433/postgres");
url.pathname = "/vellum_test";
const db = new pg.Client({ connectionString: url.toString() });
await db.connect();
const OWNER = "b0000000-0000-4000-8000-000000000001";

if (process.argv.includes("--seed")) {
  console.log("seeding…");
  await db.query(`
    insert into auth.users (id, email, created_at) values ('${OWNER}', 'bench-owner@test.dev', now() - interval '400 days') on conflict do nothing;
    insert into public.platform_staff (user_id, role) values ('${OWNER}', 'owner') on conflict do nothing;
    insert into auth.users (email, created_at)
      select 'user' || g || '@test.dev', now() - (random() * interval '400 days') from generate_series(1, 20000) g;
    insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name, template_id, status, created_at, active_until, deactivated_at)
      select u.id, 'bench-' || g, 'Name' || g, 'Other' || g,
             (array['olive-courtyard','blush-lace','henna-tent','sketchbook','burgundy-envelope'])[1 + g % 5],
             (case when g % 3 = 0 then 'draft' else 'published' end)::public.wedding_status,
             now() - (random() * interval '400 days'),
             case when g % 4 = 0 then null else now() + ((random() * 200 - 100) * interval '1 day') end,
             case when g % 50 = 0 then now() end
        from generate_series(1, 50000) g
        join lateral (select id from auth.users offset (g % 20000) limit 1) u on true;
    insert into public.orders (wedding_id, buyer_id, amount, method, paid_at, status)
      select w.id, w.owner_id, 1000, 'instapay', now() - (random() * interval '400 days'),
             (case when random() < 0.03 then 'refunded' else 'paid' end)::public.order_status
        from public.weddings w where w.slug like 'bench-%' and random() < 0.6;
    insert into public.orders (wedding_id, buyer_id, amount, method, status, paid_at, customer_name, customer_phone, source, created_at)
      select w.id, w.owner_id, 1000, 'instapay', 'pending', null, 'Customer ' || w.slug, '0100' || lpad((random() * 9999999)::int::text, 7, '0'), 'customer', now() - (random() * interval '30 days')
        from public.weddings w
       where w.slug like 'bench-%' and not exists (select 1 from public.orders o where o.wedding_id = w.id) and random() < 0.3;
    insert into public.replies (wedding_id, name, attending, party_size)
      select w.id, 'Guest ' || g, true, 1
        from public.weddings w, generate_series(1, 12) g where w.slug like 'bench-%';
    insert into public.guests (wedding_id, name)
      select w.id, 'Listed ' || g from public.weddings w, generate_series(1, 6) g where w.slug like 'bench-%';
    analyze;`);
}

const CASES = [
  ["overview 30 days", "select public.admin_overview(30)"],
  ["overview 1 year", "select public.admin_overview(365)"],
  ["invitations, all, page 1", "select public.admin_list_weddings('all', null, 25, 0)"],
  ["invitations, live filter", "select public.admin_list_weddings('live', null, 25, 0)"],
  ["invitations, unpaid filter", "select public.admin_list_weddings('unpaid', null, 25, 0)"],
  ["invitations, search", "select public.admin_list_weddings('all', 'name123', 25, 0)"],
  ["invitations, page 100", "select public.admin_list_weddings('all', null, 25, 2500)"],
  ["orders, all, page 1", "select public.admin_list_orders('all', null, 50, 0)"],
  ["orders, payment pending", "select public.admin_list_orders('pending', null, 50, 0)"],
  ["orders, not live", "select public.admin_list_orders('notLive', null, 50, 0)"],
  ["orders, search by number", "select public.admin_list_orders('all', '#5000', 50, 0)"],
  ["orders, search by name", "select public.admin_list_orders('all', 'customer bench-77', 50, 0)"],
  ["order page", "select public.admin_get_order((select id from public.orders order by created_at desc limit 1))"],
  ["sales, 500 rows", "select public.admin_list_sales(null, 500, 0)"],
  ["sales, search", "select public.admin_list_sales('user12', 500, 0)"],
];
await db.query("set role authenticated");
await db.query(`select set_config('request.jwt.claim.sub', '${OWNER}', false)`);
for (const [label, sql] of CASES) {
  const times = [];
  for (let i = 0; i < 3; i++) {
    const t = performance.now();
    await db.query(sql);
    times.push(performance.now() - t);
  }
  times.sort((a, b) => a - b);
  console.log(`${label.padEnd(30)} ${times[1].toFixed(1).padStart(8)} ms`);
}
await db.end();
