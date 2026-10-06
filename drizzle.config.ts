import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.development.local", quiet: true });

const connectionString = process.env.POSTGRES_URL;

if (!connectionString?.trim()) {
  throw new Error(
    "POSTGRES_URL is missing. Set it in .env.development.local or the environment.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: connectionString,
  },
});
