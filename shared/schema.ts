import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const disasterEvents = pgTable("disaster_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  location: jsonb("location").$type<{
    lat: number;
    lon: number;
    country: string;
    region?: string;
    address?: string;
  }>().notNull(),
  severity: text("severity", { enum: ["critical", "high", "medium", "low"] }).notNull(),
  magnitude: real("magnitude"),
  date: timestamp("date").notNull(),
  source: text("source").notNull(),
  sourceId: text("source_id"),
  imageUrl: text("image_url"),
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertDisasterEventSchema = createInsertSchema(disasterEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDisasterEvent = z.infer<typeof insertDisasterEventSchema>;
export type DisasterEvent = typeof disasterEvents.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
