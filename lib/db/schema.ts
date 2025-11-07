import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
})

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
})

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  number: integer("number").notNull(),
  categoryId: text("category_id").notNull(),
  text: text("text").notNull(),
})

export const options = sqliteTable("options", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  label: text("label").notNull(), // "א" | "ב" | "ג" | "ד"
  text: text("text").notNull(),
})

export const answers = sqliteTable("answers", {
  questionId: text("question_id")
    .primaryKey()
    .references(() => questions.id, { onDelete: "cascade" }),
  correctLabel: text("correct_label").notNull(), // "א" | "ב" | "ג" | "ד"
})

export const attempts = sqliteTable("attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  mode: text("mode").notNull(), // "exam" | "errors"
  score: integer("score"),
  passed: integer("passed", { mode: "boolean" }),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  finishedAt: integer("finished_at", { mode: "timestamp" }),
})

export const attemptItems = sqliteTable("attempt_items", {
  id: text("id").primaryKey(),
  attemptId: text("attempt_id")
    .notNull()
    .references(() => attempts.id, { onDelete: "cascade" }),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  userAnswer: text("user_answer"),
  correctAnswer: text("correct_answer").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
})

export const cookieConsents = sqliteTable("cookie_consents", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  consentAt: integer("consent_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  version: text("version").notNull().default("1.0"),
})

export type User = typeof users.$inferSelect
export type Session = typeof sessions.$inferSelect
export type Question = typeof questions.$inferSelect
export type Option = typeof options.$inferSelect
export type Answer = typeof answers.$inferSelect
export type Attempt = typeof attempts.$inferSelect
export type AttemptItem = typeof attemptItems.$inferSelect
export type CookieConsent = typeof cookieConsents.$inferSelect
