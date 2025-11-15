CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "organization";
--> statement-breakpoint
CREATE SCHEMA "storage";
--> statement-breakpoint
CREATE TYPE "storage"."asset_status" AS ENUM('pending', 'uploading', 'available', 'processing', 'failed', 'deleted');--> statement-breakpoint
CREATE TYPE "organization"."invitation_status" AS ENUM('pending', 'accepted', 'rejected', 'canceled');--> statement-breakpoint
CREATE TYPE "organization"."member_role" AS ENUM('member', 'admin', 'owner');--> statement-breakpoint
CREATE TYPE "storage"."storage_provider" AS ENUM('s3', 'r2');--> statement-breakpoint
CREATE TYPE "auth"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "auth"."accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"id_token" text,
	"password" text
);
--> statement-breakpoint
CREATE TABLE "organization"."activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" text,
	"member_id" text,
	"type" text NOT NULL,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "storage"."assets" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"bucket" text NOT NULL,
	"provider" "storage"."storage_provider" DEFAULT 's3' NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"status" "storage"."asset_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"uploader_id" text NOT NULL,
	"organization_id" text,
	"metadata" jsonb,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization"."invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" text NOT NULL,
	"inviter_id" text,
	"email" text NOT NULL,
	"role" "organization"."member_role" DEFAULT 'member' NOT NULL,
	"status" "organization"."invitation_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization"."members" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"role" "organization"."member_role" DEFAULT 'member' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization"."organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"metadata" jsonb,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "auth"."sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"impersonated_by" text,
	"ip_address" text,
	"user_agent" text,
	"active_organization_id" text,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"role" "auth"."user_role" DEFAULT 'user' NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires_at" timestamp with time zone,
	"metadata" jsonb,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "auth"."verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization"."activity_logs" ADD CONSTRAINT "activity_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization"."activity_logs" ADD CONSTRAINT "activity_logs_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "organization"."members"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "storage"."assets" ADD CONSTRAINT "assets_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "storage"."assets" ADD CONSTRAINT "assets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization"."invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization"."invitations" ADD CONSTRAINT "invitations_inviter_id_members_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "organization"."members"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization"."members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization"."members" ADD CONSTRAINT "members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_impersonated_by_users_id_fk" FOREIGN KEY ("impersonated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_active_organization_id_organizations_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "organization"."organizations"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "auth_accounts_user_id_idx" ON "auth"."accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_accounts_provider_idx" ON "auth"."accounts" USING btree ("provider_id");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_accounts_provider_account_unique_idx" ON "auth"."accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "organization_activity_logs_organization_id_idx" ON "organization"."activity_logs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_activity_logs_member_id_idx" ON "organization"."activity_logs" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "organization_activity_logs_type_idx" ON "organization"."activity_logs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "storage_assets_uploader_id_idx" ON "storage"."assets" USING btree ("uploader_id");--> statement-breakpoint
CREATE INDEX "storage_assets_organization_id_idx" ON "storage"."assets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "storage_assets_bucket_idx" ON "storage"."assets" USING btree ("bucket");--> statement-breakpoint
CREATE INDEX "storage_assets_provider_idx" ON "storage"."assets" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "storage_assets_status_idx" ON "storage"."assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "storage_assets_expires_at_idx" ON "storage"."assets" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "storage_assets_bucket_key_unique_idx" ON "storage"."assets" USING btree ("bucket","key");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_invitations_organization_email_unique_idx" ON "organization"."invitations" USING btree ("organization_id","email");--> statement-breakpoint
CREATE INDEX "organization_invitations_organization_id_idx" ON "organization"."invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_invitations_email_idx" ON "organization"."invitations" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_members_user_organization_unique_idx" ON "organization"."members" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX "organization_members_user_id_idx" ON "organization"."members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "organization_members_organization_id_idx" ON "organization"."members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organizations_slug_idx" ON "organization"."organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "auth_sessions_user_id_idx" ON "auth"."sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_token_idx" ON "auth"."sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "auth_sessions_expires_at_idx" ON "auth"."sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "auth_sessions_ip_address_idx" ON "auth"."sessions" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "auth_sessions_active_organization_id_idx" ON "auth"."sessions" USING btree ("active_organization_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "auth"."users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "auth"."users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "auth_users_banned_idx" ON "auth"."users" USING btree ("banned");--> statement-breakpoint
CREATE INDEX "auth_verifications_identifier_idx" ON "auth"."verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "auth_verifications_expires_idx" ON "auth"."verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_verifications_value_unique_idx" ON "auth"."verifications" USING btree ("value");