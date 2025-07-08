import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';

// Mock the auth hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock auth utils
vi.mock('@/lib/authUtils', () => ({
  isUnauthorizedError: vi.fn(() => false),
}));

// Mock API responses
const setupMockApiResponses = () => {
  global.fetch = vi.fn()
    .mockImplementation((url: string) => {
      if (url.includes('/api/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            totalResources: 5,
            completedResources: 2,
            inProgressResources: 2,
            notStartedResources: 1,
            freeResources: 3,
            paidResources: 2,
            categoryBreakdown: [
              { category: 'Programming', count: 3 },
              { category: 'Machine Learning', count: 2 },
            ],
          }),
        });
      }
      if (url.includes('/api/activity')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              action: 'completed',
              description: 'Completed Python course',
              createdAt: '2025-01-08T10:00:00Z',
            },
          ]),
        });
      }
      if (url.includes('/api/resources')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              title: 'Python Fundamentals',
              description: 'Learn Python basics',
              category: 'Programming',
              type: 'Course',
              provider: 'Coursera',
              duration: '40 hours',
              cost: 'Free',
              difficulty: 'Beginner',
              priority: 'High',
              progress: 'completed',
              url: 'https://example.com/python',
              notes: 'Great course!',
            },
            {
              id: 2,
              title: 'Machine Learning Intro',
              description: 'ML basics',
              category: 'Machine Learning',
              type: 'Book',
              provider: 'O\'Reilly',
              duration: '300 pages',
              cost: '$39.99',
              difficulty: 'Intermediate',
              priority: 'Medium',
              progress: 'in-progress',
              url: 'https://example.com/ml',
              notes: null,
            },
          ]),
        });
      }
      if (url.includes('/api/paths')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes('/api/timeline')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes('/api/goals')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
};

describe('User Flow Integration Tests', () => {
  let queryClient: QueryClient;
  let user: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    user = userEvent.setup();
    setupMockApiResponses();
  });

  describe('Authenticated User Flow', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'test-user-123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          profileImageUrl: null,
        },
        isLoading: false,
        isAuthenticated: true,
      });
    });

    it('navigates through all main tabs and displays content', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      // Should start on Dashboard tab
      await waitFor(() => {
        expect(screen.getByText('Learning Overview')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument(); // Total resources
      });

      // Navigate to Resources tab
      const resourcesTab = screen.getByText('Resources');
      await user.click(resourcesTab);

      await waitFor(() => {
        expect(screen.getByText('Python Fundamentals')).toBeInTheDocument();
        expect(screen.getByText('Machine Learning Intro')).toBeInTheDocument();
      });

      // Navigate to Timeline tab
      const timelineTab = screen.getByText('Timeline');
      await user.click(timelineTab);

      await waitFor(() => {
        expect(screen.getByText('Learning Timeline & Calendar')).toBeInTheDocument();
      });

      // Navigate to Progress tab
      const progressTab = screen.getByText('Progress');
      await user.click(progressTab);

      await waitFor(() => {
        expect(screen.getByText('Learning Progress & Achievements')).toBeInTheDocument();
      });

      // Navigate to Insights tab
      const insightsTab = screen.getByText('Insights');
      await user.click(insightsTab);

      await waitFor(() => {
        expect(screen.getByText('AI-Powered Learning Insights')).toBeInTheDocument();
      });
    });

    it('filters resources correctly in Resources tab', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      // Navigate to Resources tab
      const resourcesTab = screen.getByText('Resources');
      await user.click(resourcesTab);

      await waitFor(() => {
        expect(screen.getByText('Python Fundamentals')).toBeInTheDocument();
        expect(screen.getByText('Machine Learning Intro')).toBeInTheDocument();
      });

      // Test search functionality
      const searchInput = screen.getByPlaceholderText('Search resources...');
      await user.type(searchInput, 'Python');

      // Should show only Python resource
      expect(screen.getByText('Python Fundamentals')).toBeInTheDocument();

      // Clear search
      await user.clear(searchInput);

      // Test category filter
      const categorySelect = screen.getByDisplayValue('All Categories');
      await user.click(categorySelect);

      const programmingOption = screen.getByText('Programming');
      await user.click(programmingOption);

      // Should show only Programming resources
      expect(screen.getByText('Python Fundamentals')).toBeInTheDocument();
    });

    it('displays user information in header', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });

    it('shows correct statistics on dashboard', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Check statistics
        expect(screen.getByText('5')).toBeInTheDocument(); // Total resources
        expect(screen.getByText('2')).toBeInTheDocument(); // Completed resources
        expect(screen.getByText('Programming (3)')).toBeInTheDocument();
        expect(screen.getByText('Machine Learning (2)')).toBeInTheDocument();
      });
    });
  });

  describe('Unauthenticated User Flow', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    });

    it('shows landing page for unauthenticated users', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Welcome to AI Learning Hub')).toBeInTheDocument();
        expect(screen.getByText('Sign In')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
      });
    });

    it('shows landing page during loading', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Welcome to AI Learning Hub')).toBeInTheDocument();
      });
    });
  });
});