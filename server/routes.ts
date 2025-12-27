import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Uber Routes
  app.post("/api/shifts", async (req, res) => {
    // For now, assuming naive user ID 1 or passed in body, 
    // ideally should come from auth.
    // For this MVP, we will trust the client to send a userId or default to 1
    const userId = req.body.userId || 1;
    const shift = await storage.createShift({ ...req.body, userId });
    res.json(shift);
  });

  app.get("/api/shifts", async (req, res) => {
    const userId = parseInt(req.query.userId as string) || 1;
    const shifts = await storage.getShifts(userId);
    res.json(shifts);
  });

  // Academic Management Routes

  // Catalog
  app.get("/api/academic/catalog", async (req, res) => {
    const courses = await storage.getAcademicCourses();
    res.json(courses);
  });

  app.get("/api/academic/catalog/semester/:semester", async (req, res) => {
    const semester = parseInt(req.params.semester);
    const courses = await storage.getAcademicCourseBySemester(semester);
    res.json(courses);
  });

  app.post("/api/academic/catalog", async (req, res) => {
    const course = await storage.createAcademicCourse(req.body);
    res.json(course);
  });

  // Periods
  app.get("/api/academic/periods", async (req, res) => {
    const periods = await storage.getAcademicPeriods();
    res.json(periods);
  });

  app.get("/api/academic/periods/active", async (req, res) => {
    const period = await storage.getActivePeriod();
    res.json(period || null);
  });

  app.post("/api/academic/periods", async (req, res) => {
    const period = await storage.createAcademicPeriod(req.body);
    res.json(period);
  });

  // Enrollments
  app.post("/api/academic/enroll", async (req, res) => {
    const userId = req.body.userId || 1;
    const { courseCode, academicPeriod } = req.body;

    // Get all courses for lookup
    const allCourses = await storage.getAcademicCourses();

    // Get user's current enrollments for this period
    const existingEnrollments = await storage.getEnrollments(userId, academicPeriod);

    // Calculate total credits including new course
    const courseData = allCourses.find(c => c.code === courseCode);
    if (!courseData) {
      return res.status(404).json({ error: "Course not found" });
    }

    const currentCredits = existingEnrollments.reduce((sum, e) => {
      const course = allCourses.find(c => c.code === e.courseCode);
      return sum + (course?.credits || 0);
    }, 0);

    const newTotalCredits = currentCredits + courseData.credits;

    if (newTotalCredits > 32) {
      return res.status(400).json({
        error: "Credit limit exceeded",
        currentCredits,
        attemptedCredits: courseData.credits,
        limit: 32
      });
    }

    const enrollment = await storage.enrollInCourse({
      userId,
      courseCode,
      academicPeriod,
      status: "cursando",
      finalGrade: null,
      evaluations: null
    });

    res.json(enrollment);
  });

  app.get("/api/academic/enrollments", async (req, res) => {
    const userId = parseInt(req.query.userId as string) || 1;
    const period = req.query.period as string | undefined;
    const enrollments = await storage.getEnrollments(userId, period);
    res.json(enrollments);
  });

  app.put("/api/academic/enrollments/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const enrollment = await storage.updateEnrollment(id, req.body);
    res.json(enrollment);
  });

  // Stats
  app.get("/api/academic/stats", async (req, res) => {
    const userId = parseInt(req.query.userId as string) || 1;
    const stats = await storage.calculateAcademicStats(userId);
    res.json(stats);
  });

  // Import historical data
  app.post("/api/academic/import", async (req, res) => {
    const userId = req.body.userId || 1;
    const records = req.body.records;

    if (!Array.isArray(records)) {
      return res.status(400).json({ error: "Records must be an array" });
    }

    const count = await storage.importHistoricalData(userId, records);
    res.json({ imported: count });
  });

  return httpServer;
}
