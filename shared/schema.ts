import { pgTable, text, serial, integer, timestamp, real, boolean } from "drizzle-orm/pg-core";
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

// Academic Management System

export const academicCourses = pgTable("academic_courses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // INF111, INF125, etc.
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  semester: integer("semester").notNull(), // 1-12
  department: text("department").default("Informática"),
});

export const academicPeriods = pgTable("academic_periods", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  semester: integer("semester").notNull(), // 1 or 2
  isActive: boolean("is_active").default(false),
  enrollmentLimit: integer("enrollment_limit").default(32),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseCode: text("course_code").notNull(), // Links to academicCourses.code
  academicPeriod: text("academic_period").notNull(), // "2023-1", "2024-2"
  status: text("status").notNull(), // "cursando", "aprobado", "reprobado"
  finalGrade: real("final_grade"), // Nullable for courses in progress
  evaluations: text("evaluations"), // JSON string for partial grades
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Zod Schemas

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  date: true
});

export const insertAcademicCourseSchema = createInsertSchema(academicCourses).omit({
  id: true
});

export const insertAcademicPeriodSchema = createInsertSchema(academicPeriods).omit({
  id: true
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  createdAt: true
});

// Types

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Shift = typeof shifts.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;

export type AcademicCourse = typeof academicCourses.$inferSelect;
export type InsertAcademicCourse = z.infer<typeof insertAcademicCourseSchema>;
export type AcademicPeriod = typeof academicPeriods.$inferSelect;
export type InsertAcademicPeriod = z.infer<typeof insertAcademicPeriodSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
