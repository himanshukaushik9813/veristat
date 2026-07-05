CREATE TABLE "anchors" (
	"id" serial PRIMARY KEY NOT NULL,
	"merkle_root" text NOT NULL,
	"from_verification_id" integer NOT NULL,
	"to_verification_id" integer NOT NULL,
	"leaf_count" integer NOT NULL,
	"chain" text NOT NULL,
	"tx_hash" text,
	"block_number" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"endpoint" text NOT NULL,
	"payer_address" text,
	"payment_tx_hash" text,
	"price_usd" double precision,
	"demo_mode" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attestations" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"score_id" integer NOT NULL,
	"chain" text NOT NULL,
	"tx_hash" text,
	"registry_address" text NOT NULL,
	"request_hash" text,
	"response" integer,
	"evidence_uri" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crawl_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"found" integer DEFAULT 0 NOT NULL,
	"added" integer DEFAULT 0 NOT NULL,
	"changed" integer DEFAULT 0 NOT NULL,
	"marked_inactive" integer DEFAULT 0 NOT NULL,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "disputes" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"contested_score_id" integer,
	"reason" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"reprobe_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"outcome" text,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"kind" text NOT NULL,
	"summary" text NOT NULL,
	"probe_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "probes" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"wallet_id" integer,
	"template_id" text NOT NULL,
	"is_honeypot" boolean DEFAULT false NOT NULL,
	"request_url" text NOT NULL,
	"request_params" jsonb NOT NULL,
	"http_status" integer,
	"x402_status" text NOT NULL,
	"payment_tx_hash" text,
	"payment_chain" text,
	"quoted_usd" double precision,
	"charged_usd" double precision,
	"raw_response" text,
	"response_hash" text,
	"latency_ms" integer NOT NULL,
	"error" text,
	"started_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"accuracy" double precision,
	"reliability" double precision NOT NULL,
	"latency" double precision NOT NULL,
	"integrity" double precision NOT NULL,
	"freshness" double precision,
	"composite" double precision NOT NULL,
	"grade" text NOT NULL,
	"confidence" double precision NOT NULL,
	"sample_count" integer NOT NULL,
	"dominant_tier" integer NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"crawl_run_id" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"diff" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"source_id" text NOT NULL,
	"name" text NOT NULL,
	"endpoint" text NOT NULL,
	"category" text NOT NULL,
	"chain" text NOT NULL,
	"payment_scheme" text NOT NULL,
	"declared_price_usd" double precision,
	"status" text DEFAULT 'active' NOT NULL,
	"is_self" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_alive_at" timestamp with time zone,
	"dead_crawl_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"probe_id" integer NOT NULL,
	"service_id" integer NOT NULL,
	"tier" integer NOT NULL,
	"dimension" text NOT NULL,
	"verdict" text NOT NULL,
	"expected" jsonb,
	"actual" jsonb,
	"tolerance_bps" integer,
	"ground_truth" jsonb,
	"detail" text DEFAULT '' NOT NULL,
	"verifier_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"chain" text NOT NULL,
	"hd_index" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"funded_at" timestamp with time zone,
	"funding_tx_hash" text,
	"probe_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"retired_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "attestations" ADD CONSTRAINT "attestations_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attestations" ADD CONSTRAINT "attestations_score_id_scores_id_fk" FOREIGN KEY ("score_id") REFERENCES "public"."scores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_contested_score_id_scores_id_fk" FOREIGN KEY ("contested_score_id") REFERENCES "public"."scores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "probes" ADD CONSTRAINT "probes_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "probes" ADD CONSTRAINT "probes_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_snapshots" ADD CONSTRAINT "service_snapshots_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_snapshots" ADD CONSTRAINT "service_snapshots_crawl_run_id_crawl_runs_id_fk" FOREIGN KEY ("crawl_run_id") REFERENCES "public"."crawl_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_probe_id_probes_id_fk" FOREIGN KEY ("probe_id") REFERENCES "public"."probes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "incidents_service_idx" ON "incidents" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "probes_service_idx" ON "probes" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "probes_created_idx" ON "probes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "scores_service_time_idx" ON "scores" USING btree ("service_id","computed_at");--> statement-breakpoint
CREATE INDEX "snapshots_service_idx" ON "service_snapshots" USING btree ("service_id");--> statement-breakpoint
CREATE UNIQUE INDEX "services_source_key" ON "services" USING btree ("source","source_id");--> statement-breakpoint
CREATE INDEX "verifications_service_idx" ON "verifications" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "verifications_probe_idx" ON "verifications" USING btree ("probe_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wallets_addr_chain" ON "wallets" USING btree ("address","chain");