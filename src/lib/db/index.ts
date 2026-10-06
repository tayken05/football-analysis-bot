import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const connectionString = process.env.POSTGRES_URL;

if (!connectionString?.trim()) {
  throw new Error("POSTGRES_URL is missing. Set it in the server environment.");
}

const client = neon(connectionString);

export const db = drizzle({ client });
