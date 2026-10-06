CREATE TABLE "fixtures" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fixtures_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"source_provider" text NOT NULL,
	"source_fixture_id" text NOT NULL,
	"competition_code" text NOT NULL,
	"season" text NOT NULL,
	"kickoff_utc" timestamp with time zone NOT NULL,
	"status" text NOT NULL,
	"home_team_id" integer NOT NULL,
	"away_team_id" integer NOT NULL,
	"home_score" integer,
	"away_score" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fixtures_source_provider_source_fixture_id_unique" UNIQUE("source_provider","source_fixture_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "teams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"source_provider" text NOT NULL,
	"source_team_id" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"code" text,
	"crest_url" text,
	"country" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teams_source_provider_source_team_id_unique" UNIQUE("source_provider","source_team_id")
);
--> statement-breakpoint
CREATE INDEX "fixtures_kickoff_utc_idx" ON "fixtures" ("kickoff_utc");--> statement-breakpoint
CREATE INDEX "fixtures_competition_code_idx" ON "fixtures" ("competition_code");--> statement-breakpoint
CREATE INDEX "fixtures_status_idx" ON "fixtures" ("status");--> statement-breakpoint
CREATE INDEX "fixtures_home_team_id_idx" ON "fixtures" ("home_team_id");--> statement-breakpoint
CREATE INDEX "fixtures_away_team_id_idx" ON "fixtures" ("away_team_id");--> statement-breakpoint
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_home_team_id_teams_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams"("id");--> statement-breakpoint
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_away_team_id_teams_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams"("id");