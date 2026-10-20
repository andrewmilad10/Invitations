-- Test helpers (applied after the migrations, test database only).
create schema tests;
grant usage on schema tests to anon, authenticated;

create function tests.ok(condition boolean, description text) returns void
language plpgsql as $$
begin
  if condition is distinct from true then
    raise exception 'FAIL: %', description;
  end if;
  raise notice 'ok - %', description;
end;
$$;

create function tests.eq(actual anyelement, expected anyelement, description text) returns void
language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception 'FAIL: % (expected %, got %)', description, expected, actual;
  end if;
  raise notice 'ok - %', description;
end;
$$;

-- Run a statement and assert it fails with the given SQLSTATE.
create function tests.throws(stmt text, expected_state text, description text) returns void
language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    if sqlstate = expected_state then
      raise notice 'ok - %', description;
      return;
    end if;
    raise exception 'FAIL: % (expected SQLSTATE %, got %: %)', description, expected_state, sqlstate, sqlerrm;
  end;
  raise exception 'FAIL: % (statement succeeded, expected SQLSTATE %)', description, expected_state;
end;
$$;

-- Run a statement and return affected row count.
create function tests.affected(stmt text) returns integer
language plpgsql as $$
declare n integer;
begin
  execute stmt;
  get diagnostics n = row_count;
  return n;
end;
$$;

grant execute on all functions in schema tests to anon, authenticated;

-- Pays for an invitation the way staff would (a paid order and a live
-- period), so tests can then publish it as the couple.
create function tests.pay(p_slug text) returns void
language sql security definer set search_path = '' as $$
  insert into public.orders (wedding_id, buyer_id, amount, method, status, paid_at)
  select id, owner_id, 1000, 'cash', 'paid', now() from public.weddings where slug = p_slug;
  update public.weddings set active_until = now() + interval '3 months' where slug = p_slug;
$$;
grant execute on function tests.pay(text) to anon, authenticated;
