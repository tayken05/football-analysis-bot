import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { teams, type NewTeam, type Team } from "@/lib/db/schema";

type UpsertTeamInput = Omit<NewTeam, "id" | "createdAt" | "updatedAt">;

export async function upsertTeam(input: UpsertTeamInput): Promise<Team> {
  const [team] = await db
    .insert(teams)
    .values(input)
    .onConflictDoUpdate({
      target: [teams.sourceProvider, teams.sourceTeamId],
      set: {
        name: input.name,
        shortName: input.shortName,
        code: input.code,
        crestUrl: input.crestUrl,
        country: input.country,
        updatedAt: sql`now()`,
      },
    })
    .returning();

  if (!team) {
    throw new Error("Team upsert did not return a row.");
  }

  return team;
}
