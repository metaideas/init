CREATE TABLE `accounts` (
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
CREATE INDEX `accounts_user_id_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `accounts_provider_idx` ON `accounts` (`provider_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_provider_account_unique_idx` ON `accounts` (`provider_id`,`account_id`);--> statement-breakpoint
CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text,
	`member_id` text,
	`type` text NOT NULL,
	`ip_address` text(45),
	`user_agent` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `activity_logs_organization_id_idx` ON `activity_logs` (`organization_id`);--> statement-breakpoint
CREATE INDEX `activity_logs_member_id_idx` ON `activity_logs` (`member_id`);--> statement-breakpoint
CREATE INDEX `activity_logs_type_idx` ON `activity_logs` (`type`);--> statement-breakpoint
CREATE TABLE `invitations` (
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
	FOREIGN KEY (`inviter_id`) REFERENCES `members`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_invitation_unique_idx` ON `invitations` (`organization_id`,`email`);--> statement-breakpoint
CREATE INDEX `invitations_organization_id_idx` ON `invitations` (`organization_id`);--> statement-breakpoint
CREATE INDEX `invitations_email_idx` ON `invitations` (`email`);--> statement-breakpoint
CREATE TABLE `members` (
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
CREATE UNIQUE INDEX `user_organization_unique_idx` ON `members` (`user_id`,`organization_id`);--> statement-breakpoint
CREATE INDEX `members_user_id_idx` ON `members` (`user_id`);--> statement-breakpoint
CREATE INDEX `members_organization_id_idx` ON `members` (`organization_id`);--> statement-breakpoint
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
CREATE TABLE `sessions` (
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
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
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
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`identifier` text(255) NOT NULL,
	`value` text(255) NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verifications_identifier_idx` ON `verifications` (`identifier`);--> statement-breakpoint
CREATE INDEX `verifications_expires_idx` ON `verifications` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `verifications_value_unique_idx` ON `verifications` (`value`);