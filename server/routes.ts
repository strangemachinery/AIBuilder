import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertResourceSchema,
  insertTimelineEventSchema,
  insertLearningGoalSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Resource routes
  app.get("/api/resources", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const resources = await storage.getUserResources(userId);
      res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.post("/api/resources", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const resourceData = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(userId, resourceData);
      res.status(201).json(resource);
    } catch (error) {
      console.error("Error creating resource:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid resource data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create resource" });
      }
    }
  });

  app.put("/api/resources/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const resourceId = parseInt(req.params.id);
      const updates = insertResourceSchema.partial().parse(req.body);
      const resource = await storage.updateResource(
        userId,
        resourceId,
        updates,
      );
      res.json(resource);
    } catch (error: any) {
      console.error("Error updating resource:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid resource data", errors: error.errors });
      } else if (error.message === "Resource not found") {
        res.status(404).json({ message: "Resource not found" });
      } else {
        res.status(500).json({ message: "Failed to update resource" });
      }
    }
  });

  app.delete("/api/resources/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const resourceId = parseInt(req.params.id);
      await storage.deleteResource(userId, resourceId);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting resource:", error);
      if (error.message === "Resource not found") {
        res.status(404).json({ message: "Resource not found" });
      } else {
        res.status(500).json({ message: "Failed to delete resource" });
      }
    }
  });

  app.put(
    "/api/resources/:id/progress",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const resourceId = parseInt(req.params.id);
        const { progress, notes } = req.body;

        if (
          !progress ||
          !["not-started", "in-progress", "completed"].includes(progress)
        ) {
          return res.status(400).json({ message: "Invalid progress value" });
        }

        const resource = await storage.updateResourceProgress(
          userId,
          resourceId,
          progress,
          notes,
        );
        res.json(resource);
      } catch (error: any) {
        console.error("Error updating resource progress:", error);
        if (error.message === "Resource not found") {
          res.status(404).json({ message: "Resource not found" });
        } else {
          res
            .status(500)
            .json({ message: "Failed to update resource progress" });
        }
      }
    },
  );

  // Timeline routes
  app.get("/api/timeline", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getUserTimelineEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching timeline events:", error);
      res.status(500).json({ message: "Failed to fetch timeline events" });
    }
  });

  app.post("/api/timeline", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertTimelineEventSchema.parse(req.body);
      const event = await storage.createTimelineEvent(userId, eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating timeline event:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({
            message: "Invalid timeline event data",
            errors: error.errors,
          });
      } else {
        res.status(500).json({ message: "Failed to create timeline event" });
      }
    }
  });

  app.put("/api/timeline/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id);
      const updates = insertTimelineEventSchema.partial().parse(req.body);
      const event = await storage.updateTimelineEvent(userId, eventId, updates);
      res.json(event);
    } catch (error: any) {
      console.error("Error updating timeline event:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({
            message: "Invalid timeline event data",
            errors: error.errors,
          });
      } else if (error.message === "Timeline event not found") {
        res.status(404).json({ message: "Timeline event not found" });
      } else {
        res.status(500).json({ message: "Failed to update timeline event" });
      }
    }
  });

  app.delete("/api/timeline/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id);
      await storage.deleteTimelineEvent(userId, eventId);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting timeline event:", error);
      if (error.message === "Timeline event not found") {
        res.status(404).json({ message: "Timeline event not found" });
      } else {
        res.status(500).json({ message: "Failed to delete timeline event" });
      }
    }
  });

  // Learning goals routes
  app.get("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.getUserLearningGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching learning goals:", error);
      res.status(500).json({ message: "Failed to fetch learning goals" });
    }
  });

  app.post("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalData = insertLearningGoalSchema.parse(req.body);
      const goal = await storage.createLearningGoal(userId, goalData);
      res.status(201).json(goal);
    } catch (error) {
      console.error("Error creating learning goal:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({
            message: "Invalid learning goal data",
            errors: error.errors,
          });
      } else {
        res.status(500).json({ message: "Failed to create learning goal" });
      }
    }
  });

  app.put("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalId = parseInt(req.params.id);
      const updates = insertLearningGoalSchema.partial().parse(req.body);
      const goal = await storage.updateLearningGoal(userId, goalId, updates);
      res.json(goal);
    } catch (error: any) {
      console.error("Error updating learning goal:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({
            message: "Invalid learning goal data",
            errors: error.errors,
          });
      } else if (error.message === "Learning goal not found") {
        res.status(404).json({ message: "Learning goal not found" });
      } else {
        res.status(500).json({ message: "Failed to update learning goal" });
      }
    }
  });

  app.delete("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalId = parseInt(req.params.id);
      await storage.deleteLearningGoal(userId, goalId);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting learning goal:", error);
      if (error.message === "Learning goal not found") {
        res.status(404).json({ message: "Learning goal not found" });
      } else {
        res.status(500).json({ message: "Failed to delete learning goal" });
      }
    }
  });

  // Stats and activity routes
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get("/api/activity", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activity = await storage.getUserActivity(userId, limit);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  // Learning paths routes
  app.get("/api/paths", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const paths = await storage.getUserLearningPaths(userId);
      res.json(paths);
    } catch (error) {
      console.error("Error fetching learning paths:", error);
      res.status(500).json({ message: "Failed to fetch learning paths" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
