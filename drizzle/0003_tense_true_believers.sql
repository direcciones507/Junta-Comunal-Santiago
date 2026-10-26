CREATE TABLE `admin_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`slot` integer PRIMARY KEY NOT NULL,
	`started` integer NOT NULL,
	`count` integer NOT NULL
);
