import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';

// Mock the storage module
const mockStorage = {
  getUser: vi.fn(),
  upsertUser: vi.fn(),
  getUserResources: vi.fn(),
  createResource: vi.fn(),
  updateResource: vi.fn(),
  deleteResource: vi.fn(),
  updateResourceProgress: vi.fn(),
  getUserStats: vi.fn(),
  getUserActivity: vi.fn(),
  getUserTimelineEvents: vi.fn(),
  createTimelineEvent: vi.fn(),
  getUserLearningGoals: vi.fn(),
  createLearningGoal: vi.fn(),
};

vi.mock('../../server/storage', () => ({
  storage: mockStorage,
}));

// Mock auth middleware
const mockIsAuthenticated = (req: any, res: any, next: any) => {
  req.user = {
    claims: {
      sub: 'test-user-123',
      email: 'test@example.com',
    },
  };
  next();
};

vi.mock('../../server/replitAuth', () => ({
  setupAuth: vi.fn(),
  isAuthenticated: mockIsAuthenticated,
}));

const mockResources = [
  {
    id: 1,
    userId: 'test-user-123',
    title: 'Test Course',
    description: 'A test course',
    category: 'Programming',
    type: 'Course',
    provider: 'Test Provider',
    duration: '10 hours',
    cost: 'Free',
    difficulty: 'Beginner',
    priority: 'High',
    progress: 'not-started',
    url: 'https://test.com',
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockStats = {
  totalResources: 10,
  completedResources: 3,
  inProgressResources: 4,
  notStartedResources: 3,
  freeResources: 7,
  paidResources: 3,
  categoryBreakdown: [
    { category: 'Programming', count: 5 },
    { category: 'Machine Learning', count: 3 },
    { category: 'Cloud Platforms', count: 2 },
  ],
};

describe('API Routes', () => {
  let app: express.Application;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    await registerRoutes(app);
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/resources', () => {
    it('returns user resources', async () => {
      mockStorage.getUserResources.mockResolvedValue(mockResources);

      const response = await request(app)
        .get('/api/resources')
        .expect(200);

      expect(response.body).toEqual(mockResources);
      expect(mockStorage.getUserResources).toHaveBeenCalledWith('test-user-123');
    });

    it('handles storage errors', async () => {
      mockStorage.getUserResources.mockRejectedValue(new Error('Database error'));

      await request(app)
        .get('/api/resources')
        .expect(500);
    });
  });

  describe('POST /api/resources', () => {
    const newResource = {
      title: 'New Course',
      description: 'A new test course',
      category: 'Programming',
      type: 'Course',
      provider: 'Test Provider',
      duration: '5 hours',
      cost: 'Free',
      difficulty: 'Beginner',
      priority: 'Medium',
    };

    it('creates a new resource', async () => {
      const createdResource = { id: 2, ...newResource, userId: 'test-user-123' };
      mockStorage.createResource.mockResolvedValue(createdResource);

      const response = await request(app)
        .post('/api/resources')
        .send(newResource)
        .expect(201);

      expect(response.body).toEqual(createdResource);
      expect(mockStorage.createResource).toHaveBeenCalledWith('test-user-123', newResource);
    });

    it('validates required fields', async () => {
      const incompleteResource = {
        title: 'Incomplete Course',
        // Missing required fields
      };

      await request(app)
        .post('/api/resources')
        .send(incompleteResource)
        .expect(400);
    });
  });

  describe('PUT /api/resources/:id', () => {
    it('updates a resource', async () => {
      const updates = { title: 'Updated Course Title' };
      const updatedResource = { ...mockResources[0], ...updates };
      mockStorage.updateResource.mockResolvedValue(updatedResource);

      const response = await request(app)
        .put('/api/resources/1')
        .send(updates)
        .expect(200);

      expect(response.body).toEqual(updatedResource);
      expect(mockStorage.updateResource).toHaveBeenCalledWith('test-user-123', 1, updates);
    });

    it('handles resource not found', async () => {
      mockStorage.updateResource.mockRejectedValue(new Error('Resource not found'));

      await request(app)
        .put('/api/resources/999')
        .send({ title: 'New Title' })
        .expect(404);
    });
  });

  describe('DELETE /api/resources/:id', () => {
    it('deletes a resource', async () => {
      mockStorage.deleteResource.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/resources/1')
        .expect(204);

      expect(mockStorage.deleteResource).toHaveBeenCalledWith('test-user-123', 1);
    });

    it('handles resource not found', async () => {
      mockStorage.deleteResource.mockRejectedValue(new Error('Resource not found'));

      await request(app)
        .delete('/api/resources/999')
        .expect(404);
    });
  });

  describe('PUT /api/resources/:id/progress', () => {
    it('updates resource progress', async () => {
      const progressUpdate = { progress: 'completed', notes: 'Finished the course' };
      const updatedResource = { ...mockResources[0], ...progressUpdate };
      mockStorage.updateResourceProgress.mockResolvedValue(updatedResource);

      const response = await request(app)
        .put('/api/resources/1/progress')
        .send(progressUpdate)
        .expect(200);

      expect(response.body).toEqual(updatedResource);
      expect(mockStorage.updateResourceProgress).toHaveBeenCalledWith(
        'test-user-123',
        1,
        'completed',
        'Finished the course'
      );
    });
  });

  describe('GET /api/stats', () => {
    it('returns user statistics', async () => {
      mockStorage.getUserStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body).toEqual(mockStats);
      expect(mockStorage.getUserStats).toHaveBeenCalledWith('test-user-123');
    });
  });

  describe('GET /api/activity', () => {
    it('returns user activity', async () => {
      const mockActivity = [
        {
          id: 1,
          userId: 'test-user-123',
          action: 'completed',
          description: 'Completed test course',
          createdAt: new Date(),
        },
      ];
      mockStorage.getUserActivity.mockResolvedValue(mockActivity);

      const response = await request(app)
        .get('/api/activity')
        .expect(200);

      expect(response.body).toEqual(mockActivity);
      expect(mockStorage.getUserActivity).toHaveBeenCalledWith('test-user-123', 20);
    });
  });
});