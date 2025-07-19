CREATE TABLE `auth_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`id_token` text,
	`password` text(255),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `auth_accounts_user_id_idx` ON `auth_accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `auth_accounts_provider_idx` ON `auth_accounts` (`provider_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `auth_accounts_provider_account_unique_idx` ON `auth_accounts` (`provider_id`,`account_id`);--> statement-breakpoint
CREATE TABLE `organization_activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text,
	`member_id` text,
	`type` text NOT NULL,
	`ip_address` text(45),
	`user_agent` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `organization_members`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `organization_activity_logs_organization_id_idx` ON `organization_activity_logs` (`organization_id`);--> statement-breakpoint
CREATE INDEX `organization_activity_logs_member_id_idx` ON `organization_activity_logs` (`member_id`);--> statement-breakpoint
CREATE INDEX `organization_activity_logs_type_idx` ON `organization_activity_logs` (`type`);--> statement-breakpoint
CREATE TABLE `organization_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`inviter_id` text,
	`email` text(255) NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`inviter_id`) REFERENCES `organization_members`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_invitations_organization_email_unique_idx` ON `organization_invitations` (`organization_id`,`email`);--> statement-breakpoint
CREATE INDEX `organization_invitations_organization_id_idx` ON `organization_invitations` (`organization_id`);--> statement-breakpoint
CREATE INDEX `organization_invitations_email_idx` ON `organization_invitations` (`email`);--> statement-breakpoint
CREATE TABLE `organization_members` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_members_user_organization_unique_idx` ON `organization_members` (`user_id`,`organization_id`);--> statement-breakpoint
CREATE INDEX `organization_members_user_id_idx` ON `organization_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `organization_members_organization_id_idx` ON `organization_members` (`organization_id`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text(128) NOT NULL,
	`slug` text(128) NOT NULL,
	`logo` text,
	`metadata` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_slug_unique` ON `organizations` (`slug`);--> statement-breakpoint
CREATE INDEX `organizations_slug_idx` ON `organizations` (`slug`);--> statement-breakpoint
CREATE TABLE `auth_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`impersonated_by` text,
	`ip_address` text(45),
	`user_agent` text,
	`active_organization_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`impersonated_by`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`active_organization_id`) REFERENCES `organizations`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_sessions_token_unique` ON `auth_sessions` (`token`);--> statement-breakpoint
CREATE INDEX `auth_sessions_user_id_idx` ON `auth_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `auth_sessions_token_idx` ON `auth_sessions` (`token`);--> statement-breakpoint
CREATE INDEX `auth_sessions_expires_at_idx` ON `auth_sessions` (`expires_at`);--> statement-breakpoint
CREATE INDEX `auth_sessions_active_organization_id_idx` ON `auth_sessions` (`active_organization_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`name` text(128) NOT NULL,
	`image` text,
	`email` text(255) NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`banned` integer DEFAULT false NOT NULL,
	`ban_reason` text,
	`ban_expires_at` integer,
	`metadata` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE TABLE `auth_verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`identifier` text(255) NOT NULL,
	`value` text(255) NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `auth_verifications_identifier_idx` ON `auth_verifications` (`identifier`);--> statement-breakpoint
CREATE INDEX `auth_verifications_expires_idx` ON `auth_verifications` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `auth_verifications_value_unique_idx` ON `auth_verifications` (`value`);