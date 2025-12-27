import { pgTable, text, serial, integer, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  hours: real("hours").notNull(),
  grossIncome: integer("gross_income").notNull(),
  kmDriven: real("km_driven").notNull(),
  expenses: text("expenses").notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  professor: text("professor").notNull(),
  credits: integer("credits").notNull(),
  passingGrade: real("passing_grade").default(4.0),
});

export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  name: text("name").notNull(),
  weight: real("weight").notNull(),
  grade: real("grade"),
  date: timestamp("date"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  date: true
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true
});

export const insertGradeSchema = createInsertSchema(grades).omit({
  id: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Shift = typeof shifts.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Grade = typeof grades.$inferSelect;
export type InsertGrade = z.infer<typeof insertGradeSchema>;
