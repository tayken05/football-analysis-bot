import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { fixtures, type Fixture, type NewFixture } from "@/lib/db/schema";

type UpsertFixtureInput = Omit<NewFixture, "id" | "createdAt" | "updatedAt">;

export async function upsertFixture(input: UpsertFixtureInput): Promise<Fixture> {
  const [fixture] = await db
    .insert(fixtures)
    .values(input)
    .onConflictDoUpdate({
      target: [fixtures.sourceProvider, fixtures.sourceFixtureId],
      set: {
        competitionCode: input.competitionCode,
        season: input.season,
        kickoffUtc: input.kickoffUtc,
        status: input.status,
        homeTeamId: input.homeTeamId,
        awayTeamId: input.awayTeamId,
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        updatedAt: sql`now()`,
      },
    })
    .returning();

  if (!fixture) {
    throw new Error("Fixture upsert did not return a row.");
  }

  return fixture;
}
