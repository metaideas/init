CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "organization";
--> statement-breakpoint
CREATE TYPE "organization"."activity_type" AS ENUM('accepted_invitation', 'created_asset', 'created_organization', 'declined_invitation', 'deleted_account', 'invited_member', 'marked_asset_as_uploaded', 'marked_email_as_verified', 'removed_member', 'requested_email_verification', 'requested_password_reset', 'requested_sign_in_code', 'reset_password', 'signed_in_with_code', 'signed_in_with_github', 'signed_in_with_google', 'signed_in_with_password', 'signed_out', 'signed_up_with_code', 'signed_up_with_github', 'signed_up_with_google', 'signed_up_with_password');--> statement-breakpoint
CREATE TYPE "organization"."invitation_status" AS ENUM('pending', 'accepted', 'rejected', 'canceled');--> statement-breakpoint
CREATE TYPE "organization"."organization_roles" AS ENUM('member', 'admin', 'owner');--> statement-breakpoint
CREATE TYPE "auth"."user_roles" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "auth"."accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"id_token" text,
	"password" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization"."activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"organization_id" text,
	"member_id" text,
	"type" "organization"."activity_type" NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "organization"."invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"inviter_id" text,
	"email" varchar(255) NOT NULL,
	"role" "organization"."organization_roles" DEFAULT 'member' NOT NULL,
	"status" "organization"."invitation_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization"."members" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"role" "organization"."organization_roles" DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization"."organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"logo" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"impersonated_by" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"active_organization_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" text PRIMARY KEY NOT NULL,
	"role" "auth"."user_roles" DEFAULT 'user' NOT NULL,
	"name" varchar(128) NOT NULL,
	"image" text,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "auth"."verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"value" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization"."activity_logs" ADD CONSTRAINT "activity_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization"."activity_logs" ADD CONSTRAINT "activity_logs_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "organization"."members"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization"."invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization"."invitations" ADD CONSTRAINT "invitations_inviter_id_members_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "organization"."members"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization"."members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization"."members" ADD CONSTRAINT "members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_impersonated_by_users_id_fk" FOREIGN KEY ("impersonated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_active_organization_id_organizations_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "organization"."organizations"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "auth"."accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "accounts_provider_idx" ON "auth"."accounts" USING btree ("provider_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_account_unique_idx" ON "auth"."accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "activity_logs_organization_id_idx" ON "organization"."activity_logs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "activity_logs_member_id_idx" ON "organization"."activity_logs" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "activity_logs_type_idx" ON "organization"."activity_logs" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_invitation_unique_idx" ON "organization"."invitations" USING btree ("organization_id","email");--> statement-breakpoint
CREATE INDEX "invitations_organization_id_idx" ON "organization"."invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "organization"."invitations" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "user_organization_unique_idx" ON "organization"."members" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX "members_user_id_idx" ON "organization"."members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "members_organization_id_idx" ON "organization"."members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "auth"."users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "auth"."users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "auth"."verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verifications_expires_idx" ON "auth"."verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "verifications_value_unique_idx" ON "auth"."verifications" USING btree ("value");