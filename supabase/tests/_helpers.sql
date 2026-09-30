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
