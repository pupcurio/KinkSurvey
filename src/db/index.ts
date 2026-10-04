import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let db: ReturnType<typeof createDb> | undefined;

function createDb(url: string) {
  // prepare: false is required for Neon's pooled (PgBouncer) connection string.
  return drizzle(postgres(url, { prepare: false, max: 1 }), { schema });
}

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  db ??= createDb(url);
  return db;
}
