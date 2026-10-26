CREATE TABLE `administrator` (
	`slot` integer PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `administrator_subject_unique` ON `administrator` (`subject`);--> statement-breakpoint
CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`action` text NOT NULL,
	`actor` text NOT NULL,
	`at` text NOT NULL,
	`snapshot` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contents` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`slot` text,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`image` text,
	`alt` text NOT NULL,
	`position` integer NOT NULL,
	`status` text NOT NULL,
	`version` integer NOT NULL,
	`live` text,
	`updated` text NOT NULL,
	`author` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`created` text NOT NULL,
	`author` text NOT NULL
);
