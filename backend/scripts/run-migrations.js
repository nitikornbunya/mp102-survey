import "dotenv/config";
import pg from "pg";
import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const migrationsDir = join(rootDir, "migrations");

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("กรุณาตั้งค่า DATABASE_URL ใน .env");
    process.exit(1);
  }
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations_log (
      name    VARCHAR(255) PRIMARY KEY,
      run_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const name = file;
    const { rows } = await client.query(
      "SELECT 1 FROM _migrations_log WHERE name = $1",
      [name]
    );
    if (rows.length > 0) {
      console.log("ข้าม (รันแล้ว):", name);
      continue;
    }
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    await client.query(sql);
    await client.query("INSERT INTO _migrations_log (name) VALUES ($1)", [name]);
    console.log("รันสำเร็จ:", name);
  }
  await client.end();
  console.log("migrate เสร็จแล้ว");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
