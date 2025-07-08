import {
  users,
  resources,
  learningPaths,
  pathResources,
  timelineEvents,
  learningGoals,
  activityLog,
  type User,
  type UpsertUser,
  type Resource,
  type InsertResource,
  type LearningPath,
  type InsertLearningPath,
  type TimelineEvent,
  type InsertTimelineEvent,
  type LearningGoal,
  type InsertLearningGoal,
  type ActivityLogEntry,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Resource operations
  getUserResources(userId: string): Promise<Resource[]>;
  createResource(userId: string, resource: InsertResource): Promise<Resource>;
  updateResource(userId: string, resourceId: number, updates: Partial<InsertResource>): Promise<Resource>;
  deleteResource(userId: string, resourceId: number): Promise<void>;
  updateResourceProgress(userId: string, resourceId: number, progress: string, notes?: string): Promise<Resource>;
  
  // Learning path operations
  getUserLearningPaths(userId: string): Promise<LearningPath[]>;
  createLearningPath(userId: string, path: InsertLearningPath): Promise<LearningPath>;
  updateLearningPath(userId: string, pathId: number, updates: Partial<InsertLearningPath>): Promise<LearningPath>;
  deleteLearningPath(userId: string, pathId: number): Promise<void>;
  
  // Timeline operations
  getUserTimelineEvents(userId: string): Promise<TimelineEvent[]>;
  createTimelineEvent(userId: string, event: InsertTimelineEvent): Promise<TimelineEvent>;
  updateTimelineEvent(userId: string, eventId: number, updates: Partial<InsertTimelineEvent>): Promise<TimelineEvent>;
  deleteTimelineEvent(userId: string, eventId: number): Promise<void>;
  
  // Learning goal operations
  getUserLearningGoals(userId: string): Promise<LearningGoal[]>;
  createLearningGoal(userId: string, goal: InsertLearningGoal): Promise<LearningGoal>;
  updateLearningGoal(userId: string, goalId: number, updates: Partial<InsertLearningGoal>): Promise<LearningGoal>;
  deleteLearningGoal(userId: string, goalId: number): Promise<void>;
  
  // Analytics and activity
  getUserActivity(userId: string, limit?: number): Promise<ActivityLogEntry[]>;
  logActivity(userId: string, action: string, description: string, resourceId?: number): Promise<void>;
  getUserStats(userId: string): Promise<{
    totalResources: number;
    completedResources: number;
    inProgressResources: number;
    notStartedResources: number;
    freeResources: number;
    paidResources: number;
    categoryBreakdown: { category: string; count: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Resource operations
  async getUserResources(userId: string): Promise<Resource[]> {
    return await db
      .select()
      .from(resources)
      .where(eq(resources.userId, userId))
      .orderBy(desc(resources.createdAt));
  }

  async createResource(userId: string, resource: InsertResource): Promise<Resource> {
    const [newResource] = await db
      .insert(resources)
      .values({ ...resource, userId })
      .returning();
    
    await this.logActivity(userId, "created", `Added resource: ${resource.title}`, newResource.id);
    return newResource;
  }

  async updateResource(userId: string, resourceId: number, updates: Partial<InsertResource>): Promise<Resource> {
    const [updatedResource] = await db
      .update(resources)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(resources.id, resourceId), eq(resources.userId, userId)))
      .returning();
    
    if (!updatedResource) {
      throw new Error("Resource not found");
    }
    
    await this.logActivity(userId, "updated", `Updated resource: ${updatedResource.title}`, resourceId);
    return updatedResource;
  }

  async deleteResource(userId: string, resourceId: number): Promise<void> {
    const [deletedResource] = await db
      .delete(resources)
      .where(and(eq(resources.id, resourceId), eq(resources.userId, userId)))
      .returning();
    
    if (!deletedResource) {
      throw new Error("Resource not found");
    }
    
    await this.logActivity(userId, "deleted", `Deleted resource: ${deletedResource.title}`);
  }

  async updateResourceProgress(userId: string, resourceId: number, progress: string, notes?: string): Promise<Resource> {
    const updates: any = {
      progress,
      updatedAt: new Date(),
    };
    
    if (notes) {
      updates.notes = notes;
    }
    
    if (progress === "completed") {
      updates.completedAt = new Date();
    }
    
    const [updatedResource] = await db
      .update(resources)
      .set(updates)
      .where(and(eq(resources.id, resourceId), eq(resources.userId, userId)))
      .returning();
    
    if (!updatedResource) {
      throw new Error("Resource not found");
    }
    
    await this.logActivity(userId, progress === "completed" ? "completed" : "progress_updated", 
      `Updated progress for: ${updatedResource.title}`, resourceId);
    
    return updatedResource;
  }

  // Learning path operations
  async getUserLearningPaths(userId: string): Promise<LearningPath[]> {
    return await db
      .select()
      .from(learningPaths)
      .where(eq(learningPaths.userId, userId))
      .orderBy(desc(learningPaths.createdAt));
  }

  async createLearningPath(userId: string, path: InsertLearningPath): Promise<LearningPath> {
    const [newPath] = await db
      .insert(learningPaths)
      .values({ ...path, userId })
      .returning();
    
    await this.logActivity(userId, "created", `Created learning path: ${path.name}`);
    return newPath;
  }

  async updateLearningPath(userId: string, pathId: number, updates: Partial<InsertLearningPath>): Promise<LearningPath> {
    const [updatedPath] = await db
      .update(learningPaths)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(learningPaths.id, pathId), eq(learningPaths.userId, userId)))
      .returning();
    
    if (!updatedPath) {
      throw new Error("Learning path not found");
    }
    
    await this.logActivity(userId, "updated", `Updated learning path: ${updatedPath.name}`);
    return updatedPath;
  }

  async deleteLearningPath(userId: string, pathId: number): Promise<void> {
    const [deletedPath] = await db
      .delete(learningPaths)
      .where(and(eq(learningPaths.id, pathId), eq(learningPaths.userId, userId)))
      .returning();
    
    if (!deletedPath) {
      throw new Error("Learning path not found");
    }
    
    await this.logActivity(userId, "deleted", `Deleted learning path: ${deletedPath.name}`);
  }

  // Timeline operations
  async getUserTimelineEvents(userId: string): Promise<TimelineEvent[]> {
    return await db
      .select()
      .from(timelineEvents)
      .where(eq(timelineEvents.userId, userId))
      .orderBy(asc(timelineEvents.date));
  }

  async createTimelineEvent(userId: string, event: InsertTimelineEvent): Promise<TimelineEvent> {
    const [newEvent] = await db
      .insert(timelineEvents)
      .values({ ...event, userId })
      .returning();
    
    await this.logActivity(userId, "created", `Added timeline event: ${event.title}`);
    return newEvent;
  }

  async updateTimelineEvent(userId: string, eventId: number, updates: Partial<InsertTimelineEvent>): Promise<TimelineEvent> {
    const [updatedEvent] = await db
      .update(timelineEvents)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(timelineEvents.id, eventId), eq(timelineEvents.userId, userId)))
      .returning();
    
    if (!updatedEvent) {
      throw new Error("Timeline event not found");
    }
    
    await this.logActivity(userId, "updated", `Updated timeline event: ${updatedEvent.title}`);
    return updatedEvent;
  }

  async deleteTimelineEvent(userId: string, eventId: number): Promise<void> {
    const [deletedEvent] = await db
      .delete(timelineEvents)
      .where(and(eq(timelineEvents.id, eventId), eq(timelineEvents.userId, userId)))
      .returning();
    
    if (!deletedEvent) {
      throw new Error("Timeline event not found");
    }
    
    await this.logActivity(userId, "deleted", `Deleted timeline event: ${deletedEvent.title}`);
  }

  // Learning goal operations
  async getUserLearningGoals(userId: string): Promise<LearningGoal[]> {
    return await db
      .select()
      .from(learningGoals)
      .where(eq(learningGoals.userId, userId))
      .orderBy(desc(learningGoals.createdAt));
  }

  async createLearningGoal(userId: string, goal: InsertLearningGoal): Promise<LearningGoal> {
    const [newGoal] = await db
      .insert(learningGoals)
      .values({ ...goal, userId })
      .returning();
    
    await this.logActivity(userId, "created", `Set learning goal: ${goal.title}`);
    return newGoal;
  }

  async updateLearningGoal(userId: string, goalId: number, updates: Partial<InsertLearningGoal>): Promise<LearningGoal> {
    const [updatedGoal] = await db
      .update(learningGoals)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(learningGoals.id, goalId), eq(learningGoals.userId, userId)))
      .returning();
    
    if (!updatedGoal) {
      throw new Error("Learning goal not found");
    }
    
    await this.logActivity(userId, "updated", `Updated learning goal: ${updatedGoal.title}`);
    return updatedGoal;
  }

  async deleteLearningGoal(userId: string, goalId: number): Promise<void> {
    const [deletedGoal] = await db
      .delete(learningGoals)
      .where(and(eq(learningGoals.id, goalId), eq(learningGoals.userId, userId)))
      .returning();
    
    if (!deletedGoal) {
      throw new Error("Learning goal not found");
    }
    
    await this.logActivity(userId, "deleted", `Deleted learning goal: ${deletedGoal.title}`);
  }

  // Analytics and activity
  async getUserActivity(userId: string, limit: number = 20): Promise<ActivityLogEntry[]> {
    return await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.userId, userId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);
  }

  async logActivity(userId: string, action: string, description: string, resourceId?: number): Promise<void> {
    await db.insert(activityLog).values({
      userId,
      action,
      description,
      resourceId,
    });
  }

  async getUserStats(userId: string): Promise<{
    totalResources: number;
    completedResources: number;
    inProgressResources: number;
    notStartedResources: number;
    freeResources: number;
    paidResources: number;
    categoryBreakdown: { category: string; count: number }[];
  }> {
    const [stats] = await db
      .select({
        totalResources: count(),
        completedResources: sql<number>`COUNT(CASE WHEN ${resources.progress} = 'completed' THEN 1 END)`,
        inProgressResources: sql<number>`COUNT(CASE WHEN ${resources.progress} = 'in-progress' THEN 1 END)`,
        notStartedResources: sql<number>`COUNT(CASE WHEN ${resources.progress} = 'not-started' THEN 1 END)`,
        freeResources: sql<number>`COUNT(CASE WHEN ${resources.cost} = 'Free' THEN 1 END)`,
        paidResources: sql<number>`COUNT(CASE WHEN ${resources.cost} != 'Free' THEN 1 END)`,
      })
      .from(resources)
      .where(eq(resources.userId, userId));

    const categoryBreakdown = await db
      .select({
        category: resources.category,
        count: count(),
      })
      .from(resources)
      .where(eq(resources.userId, userId))
      .groupBy(resources.category);

    return {
      ...stats,
      categoryBreakdown,
    };
  }
}

export const storage = new DatabaseStorage();
