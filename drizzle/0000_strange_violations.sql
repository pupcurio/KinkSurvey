CREATE TABLE "responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_version" integer NOT NULL,
	"locale" text NOT NULL,
	"submitted_month" text NOT NULL,
	"answers" jsonb NOT NULL,
	"returning_hash" text,
	"quality_flags" jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX "responses_month_idx" ON "responses" USING btree ("submitted_month");--> statement-breakpoint
CREATE INDEX "responses_returning_idx" ON "responses" USING btree ("returning_hash");