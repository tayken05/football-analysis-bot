import { index, integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const teams = pgTable(
  "teams",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    sourceProvider: text("source_provider").notNull(),
    sourceTeamId: text("source_team_id").notNull(),
    name: text("name").notNull(),
    shortName: text("short_name"),
    code: text("code"),
    crestUrl: text("crest_url"),
    country: text("country"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("teams_source_provider_source_team_id_unique").on(
      table.sourceProvider,
      table.sourceTeamId,
    ),
  ],
);

export const fixtures = pgTable(
  "fixtures",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    sourceProvider: text("source_provider").notNull(),
    sourceFixtureId: text("source_fixture_id").notNull(),
    competitionCode: text("competition_code").notNull(),
    season: text("season").notNull(),
    kickoffUtc: timestamp("kickoff_utc", { withTimezone: true }).notNull(),
    status: text("status").notNull(),
    homeTeamId: integer("home_team_id").notNull().references(() => teams.id),
    awayTeamId: integer("away_team_id").notNull().references(() => teams.id),
    homeScore: integer("home_score"),
    awayScore: integer("away_score"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("fixtures_source_provider_source_fixture_id_unique").on(
      table.sourceProvider,
      table.sourceFixtureId,
    ),
    index("fixtures_kickoff_utc_idx").on(table.kickoffUtc),
    index("fixtures_competition_code_idx").on(table.competitionCode),
    index("fixtures_status_idx").on(table.status),
    index("fixtures_home_team_id_idx").on(table.homeTeamId),
    index("fixtures_away_team_id_idx").on(table.awayTeamId),
  ],
);

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type Fixture = typeof fixtures.$inferSelect;
export type NewFixture = typeof fixtures.$inferInsert;
