import { users, shifts, courses, grades, type User, type InsertUser, type Shift, type InsertShift, type Course, type InsertCourse, type Grade, type InsertGrade } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Uber
  createShift(shift: InsertShift): Promise<Shift>;
  getShifts(userId: number): Promise<Shift[]>;

  // University
  createCourse(course: InsertCourse): Promise<Course>;
  getCourses(userId: number): Promise<Course[]>;
  createGrade(grade: InsertGrade): Promise<Grade>;
  getGrades(courseId: number): Promise<Grade[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createShift(insertShift: InsertShift): Promise<Shift> {
    const [shift] = await db.insert(shifts).values(insertShift).returning();
    return shift;
  }

  async getShifts(userId: number): Promise<Shift[]> {
    return db.select().from(shifts).where(eq(shifts.userId, userId)).orderBy(desc(shifts.date));
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(insertCourse).returning();
    return course;
  }

  async getCourses(userId: number): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.userId, userId));
  }

  async createGrade(insertGrade: InsertGrade): Promise<Grade> {
    const [grade] = await db.insert(grades).values(insertGrade).returning();
    return grade;
  }

  async getGrades(courseId: number): Promise<Grade[]> {
    return db.select().from(grades).where(eq(grades.courseId, courseId));
  }
}

export const storage = new DatabaseStorage();
