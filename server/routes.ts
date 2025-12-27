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

  // University Routes
  app.post("/api/courses", async (req, res) => {
    const userId = req.body.userId || 1;
    const course = await storage.createCourse({ ...req.body, userId });
    res.json(course);
  });

  app.get("/api/courses", async (req, res) => {
    const userId = parseInt(req.query.userId as string) || 1;
    const courses = await storage.getCourses(userId);
    res.json(courses);
  });

  app.post("/api/grades", async (req, res) => {
    const grade = await storage.createGrade(req.body);
    res.json(grade);
  });

  app.get("/api/courses/:courseId/grades", async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const grades = await storage.getGrades(courseId);
    res.json(grades);
  });

  return httpServer;
}
