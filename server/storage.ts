import { users, shifts, academicCourses, academicPeriods, enrollments, type User, type InsertUser, type Shift, type InsertShift, type AcademicCourse, type InsertAcademicCourse, type AcademicPeriod, type InsertAcademicPeriod, type Enrollment, type InsertEnrollment } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Uber
  createShift(shift: InsertShift): Promise<Shift>;
  getShifts(userId: number): Promise<Shift[]>;

  // Academic Management
  createAcademicCourse(course: InsertAcademicCourse): Promise<AcademicCourse>;
  getAcademicCourses(): Promise<AcademicCourse[]>;
  getAcademicCourseBySemester(semester: number): Promise<AcademicCourse[]>;

  createAcademicPeriod(period: InsertAcademicPeriod): Promise<AcademicPeriod>;
  getAcademicPeriods(): Promise<AcademicPeriod[]>;
  getActivePeriod(): Promise<AcademicPeriod | undefined>;

  enrollInCourse(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollments(userId: number, period?: string): Promise<Enrollment[]>;
  updateEnrollment(id: number, updates: Partial<Enrollment>): Promise<Enrollment>;
  calculateAcademicStats(userId: number): Promise<{
    gpa: number;
    totalCredits: number;
    approvedCredits: number;
    failedCredits: number;
    coursesApproved: number;
    coursesFailed: number;
  }>;
  importHistoricalData(userId: number, records: InsertEnrollment[]): Promise<number>;
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

  // Academic Management Methods

  async createAcademicCourse(insertCourse: InsertAcademicCourse): Promise<AcademicCourse> {
    const [course] = await db.insert(academicCourses).values(insertCourse).returning();
    return course;
  }

  async getAcademicCourses(): Promise<AcademicCourse[]> {
    return db.select().from(academicCourses).orderBy(academicCourses.semester, academicCourses.code);
  }

  async getAcademicCourseBySemester(semester: number): Promise<AcademicCourse[]> {
    return db.select().from(academicCourses).where(eq(academicCourses.semester, semester));
  }

  async createAcademicPeriod(insertPeriod: InsertAcademicPeriod): Promise<AcademicPeriod> {
    const [period] = await db.insert(academicPeriods).values(insertPeriod).returning();
    return period;
  }

  async getAcademicPeriods(): Promise<AcademicPeriod[]> {
    return db.select().from(academicPeriods).orderBy(desc(academicPeriods.year), desc(academicPeriods.semester));
  }

  async getActivePeriod(): Promise<AcademicPeriod | undefined> {
    const [period] = await db.select().from(academicPeriods).where(eq(academicPeriods.isActive, true));
    return period;
  }

  async enrollInCourse(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const [enrollment] = await db.insert(enrollments).values(insertEnrollment).returning();
    return enrollment;
  }

  async getEnrollments(userId: number, period?: string): Promise<Enrollment[]> {
    if (period) {
      return db.select().from(enrollments)
        .where(and(eq(enrollments.userId, userId), eq(enrollments.academicPeriod, period)))
        .orderBy(enrollments.courseCode);
    }
    return db.select().from(enrollments)
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.academicPeriod), enrollments.courseCode);
  }

  async updateEnrollment(id: number, updates: Partial<Enrollment>): Promise<Enrollment> {
    const [enrollment] = await db.update(enrollments)
      .set(updates)
      .where(eq(enrollments.id, id))
      .returning();
    return enrollment;
  }

  async calculateAcademicStats(userId: number): Promise<{
    gpa: number;
    totalCredits: number;
    approvedCredits: number;
    failedCredits: number;
    coursesApproved: number;
    coursesFailed: number;
  }> {
    const userEnrollments = await db.select()
      .from(enrollments)
      .leftJoin(academicCourses, eq(enrollments.courseCode, academicCourses.code))
      .where(eq(enrollments.userId, userId));

    let totalGradePoints = 0;
    let totalCredits = 0;
    let approvedCredits = 0;
    let failedCredits = 0;
    let coursesApproved = 0;
    let coursesFailed = 0;

    for (const { enrollments: enroll, academic_courses: course } of userEnrollments) {
      if (!course || enroll.status === "cursando") continue;

      const credits = course.credits;
      const grade = enroll.finalGrade || 0;

      if (enroll.status === "aprobado") {
        totalGradePoints += grade * credits;
        totalCredits += credits;
        approvedCredits += credits;
        coursesApproved++;
      } else if (enroll.status === "reprobado") {
        failedCredits += credits;
        coursesFailed++;
      }
    }

    const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    return {
      gpa: Math.round(gpa * 100) / 100,
      totalCredits,
      approvedCredits,
      failedCredits,
      coursesApproved,
      coursesFailed,
    };
  }

  async importHistoricalData(userId: number, records: InsertEnrollment[]): Promise<number> {
    const result = await db.insert(enrollments).values(records).returning();
    return result.length;
  }
}

export const storage = new DatabaseStorage();
