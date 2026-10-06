import "server-only";

import { and, asc, eq, gte, lt } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/lib/db";
import { fixtures, teams } from "@/lib/db/schema";

const homeTeam = alias(teams, "home_team");
const awayTeam = alias(teams, "away_team");

export async function getFixturesForUtcDate(date: Date) {
  if (Number.isNaN(date.getTime())) {
    throw new Error("getFixturesForUtcDate requires a valid Date.");
  }

  const start = new Date(date.getTime());
  start.setUTCHours(0, 0, 0, 0);

  const nextDay = new Date(start.getTime());
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  return db
    .select({
      id: fixtures.id,
      sourceProvider: fixtures.sourceProvider,
      sourceFixtureId: fixtures.sourceFixtureId,
      competitionCode: fixtures.competitionCode,
      season: fixtures.season,
      kickoffUtc: fixtures.kickoffUtc,
      status: fixtures.status,
      homeScore: fixtures.homeScore,
      awayScore: fixtures.awayScore,
      homeTeam: {
        id: homeTeam.id,
        name: homeTeam.name,
        shortName: homeTeam.shortName,
        code: homeTeam.code,
        crestUrl: homeTeam.crestUrl,
      },
      awayTeam: {
        id: awayTeam.id,
        name: awayTeam.name,
        shortName: awayTeam.shortName,
        code: awayTeam.code,
        crestUrl: awayTeam.crestUrl,
      },
    })
    .from(fixtures)
    .innerJoin(homeTeam, eq(fixtures.homeTeamId, homeTeam.id))
    .innerJoin(awayTeam, eq(fixtures.awayTeamId, awayTeam.id))
    .where(and(gte(fixtures.kickoffUtc, start), lt(fixtures.kickoffUtc, nextDay)))
    .orderBy(asc(fixtures.kickoffUtc));
}
