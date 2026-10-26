import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const administrator = sqliteTable('administrator', { slot: integer().primaryKey(), subject: text().notNull().unique(), email: text().notNull() });
export const contents = sqliteTable('contents', {
 id: text().primaryKey(), kind: text().notNull(), slot: text(), title: text().notNull(), body: text().notNull(), image: text(), alt: text().notNull(), position: integer().notNull(),
 status: text().notNull(), version: integer().notNull(), live: text(), updated: text().notNull(), author: text().notNull()
}, table => [uniqueIndex('active_section_unique').on(table.slot).where(sql`${table.status} != 'archived'`)]);
export const media = sqliteTable('media', { id: text().primaryKey(), mime: text().notNull(), size: integer().notNull(), created: text().notNull(), author: text().notNull() });
export const audit = sqliteTable('audit', { id: text().primaryKey(), content: text().notNull(), action: text().notNull(), actor: text().notNull(), at: text().notNull(), snapshot: text().notNull() });
