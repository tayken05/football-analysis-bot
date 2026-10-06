import "server-only";

import { z } from "zod";

import { upsertFixture } from "@/lib/db/repositories/fixtures";
import { upsertTeam } from "@/lib/db/repositories/teams";
import { footballDataFetch } from "@/lib/football-data/client";

const sourceProvider = "football-data";

const providerTeamSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  shortName: z.string().nullish(),
  tla: z.string().nullish(),
  crest: z.url().nullish(),
});

const matchesResponseSchema = z.object({
  matches: z.array(
    z.object({
      id: z.number().int().positive(),
      utcDate: z.iso.datetime(),
      status: z.string().min(1),
      competition: z.object({
        code: z.literal("PL"),
        name: z.string().min(1),
      }),
      season: z.object({
        startDate: z.iso.date(),
        endDate: z.iso.date(),
      }),
      homeTeam: providerTeamSchema,
      awayTeam: providerTeamSchema,
      score: z.object({
        fullTime: z.object({
          home: z.number().int().nonnegative().nullable(),
          away: z.number().int().nonnegative().nullable(),
        }),
      }),
    }),
  ),
});

export async function importPremierLeagueCurrentSeason() {
  const response = await footballDataFetch("/competitions/PL/matches");
  const parsed = matchesResponseSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Premier League matches response failed validation.");
  }

  const matches = parsed.data.matches;
  const firstMatch = matches[0];

  if (!firstMatch) {
    throw new Error("No current-season Premier League matches were returned.");
  }

  const season = `${firstMatch.season.startDate.slice(0, 4)}-${firstMatch.season.endDate.slice(0, 4)}`;

  // Validate the entire response's season before writing any rows.
  if (
    matches.some(
      (match) =>
        match.season.startDate !== firstMatch.season.startDate ||
        match.season.endDate !== firstMatch.season.endDate,
    )
  ) {
    throw new Error("Premier League response contains inconsistent season dates.");
  }

  const teamIds = new Map<string, number>();

  async function resolveTeam(team: z.infer<typeof providerTeamSchema>) {
    const sourceTeamId = String(team.id);
    const existingId = teamIds.get(sourceTeamId);

    if (existingId !== undefined) {
      return existingId;
    }

    const row = await upsertTeam({
      sourceProvider,
      sourceTeamId,
      name: team.name,
      shortName: team.shortName,
      code: team.tla,
      crestUrl: team.crest,
      country: null,
    });

    teamIds.set(sourceTeamId, row.id);
    return row.id;
  }

  let fixturesProcessed = 0;

  for (const match of matches) {
    const homeTeamId = await resolveTeam(match.homeTeam);
    const awayTeamId = await resolveTeam(match.awayTeam);

    await upsertFixture({
      sourceProvider,
      sourceFixtureId: String(match.id),
      competitionCode: match.competition.code,
      season,
      kickoffUtc: new Date(match.utcDate),
      status: match.status,
      homeTeamId,
      awayTeamId,
      homeScore: match.score.fullTime.home,
      awayScore: match.score.fullTime.away,
    });

    fixturesProcessed += 1;
  }

  return {
    provider: sourceProvider,
    competition: firstMatch.competition.code,
    season,
    matchesReceived: matches.length,
    uniqueTeamsProcessed: teamIds.size,
    fixturesProcessed,
  };
}
