#!/usr/bin/env node
// Applies every migration to a scratch Postgres database and runs the SQL
// tests in supabase/tests/*.test.sql. Works against any Postgres 15+;
// Docker/Supabase are not required.
//
//   DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/postgres npm run test:db
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const root = path.resolve(import.meta.dirname, "..");
const adminUrl = process.env.DATABASE_URL ?? "postgres://postgres:postgres@127.0.0.1:5432/postgres";
const testDb = "vellum_test";

const read = (p) => readFile(path.join(root, p), "utf8");

async function main() {
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  await admin.query(`drop database if exists ${testDb} with (force)`);
  await admin.query(`create database ${testDb}`);
  await admin.end();

  const url = new URL(adminUrl);
  url.pathname = `/${testDb}`;
  const db = new pg.Client({ connectionString: url.toString() });
  const notices = [];
  db.on("notice", (n) => notices.push(n.message));
  await db.connect();

  try {
    await db.query(await read("supabase/tests/_supabase_stub.sql"));

    const migrations = (await readdir(path.join(root, "supabase/migrations")))
      .filter((f) => f.endsWith(".sql"))
      .sort();
    for (const file of migrations) {
      try {
        await db.query(await read(`supabase/migrations/${file}`));
        console.log(`  migrated  ${file}`);
      } catch (err) {
        throw new Error(`migration ${file} failed: ${err.message}`);
      }
    }

    await db.query(await read("supabase/tests/_helpers.sql"));

    const tests = (await readdir(path.join(root, "supabase/tests")))
      .filter((f) => f.endsWith(".test.sql"))
      .sort();

    let failed = 0;
    for (const file of tests) {
      notices.length = 0;
      await db.query("begin");
      try {
        await db.query(await read(`supabase/tests/${file}`));
        console.log(`\n✓ ${file}`);
        for (const n of notices) console.log(`    ${n}`);
      } catch (err) {
        failed++;
        console.log(`\n✗ ${file}`);
        for (const n of notices) console.log(`    ${n}`);
        console.log(`    ${err.message}`);
      } finally {
        await db.query("rollback");
      }
    }

    const passed = notices.length;
    if (failed) {
      console.error(`\n${failed} test file(s) failed`);
      process.exitCode = 1;
    } else {
      console.log(`\nAll database tests passed.`);
    }
    void passed;
  } finally {
    await db.end();
    if (!process.env.KEEP_TEST_DB) {
      const cleanup = new pg.Client({ connectionString: adminUrl });
      await cleanup.connect();
      await cleanup.query(`drop database if exists ${testDb} with (force)`);
      await cleanup.end();
    }
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
