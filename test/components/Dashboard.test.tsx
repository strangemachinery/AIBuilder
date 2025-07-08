import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardTab from '@/components/dashboard-tab';

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the auth utils
vi.mock('@/lib/authUtils', () => ({
  isUnauthorizedError: vi.fn(() => false),
}));

// Mock fetch responses
const mockStats = {
  totalResources: 15,
  completedResources: 8,
  inProgressResources: 5,
  notStartedResources: 2,
  freeResources: 10,
  paidResources: 5,
  categoryBreakdown: [
    { category: 'Programming', count: 6 },
    { category: 'Machine Learning', count: 4 },
    { category: 'Cloud Platforms', count: 3 },
    { category: 'AI Agents', count: 2 }
  ]
};

const mockActivity = [
  {
    id: 1,
    action: 'completed',
    description: 'Completed Python fundamentals course',
    createdAt: '2025-01-08T10:30:00Z'
  },
  {
    id: 2,
    action: 'started',
    description: 'Started Machine Learning with TensorFlow',
    createdAt: '2025-01-08T09:15:00Z'
  }
];

const mockLearningPaths = [
  {
    id: 1,
    name: 'AI Engineer Fundamentals',
    description: 'Complete path for AI engineering basics',
    estimatedDuration: '3 months'
  }
];

describe('DashboardTab', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock successful API responses
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivity),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLearningPaths),
      });
  });

  it('renders dashboard with statistics', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DashboardTab />
      </QueryClientProvider>
    );

    // Check for main sections
    expect(screen.getByText('Learning Overview')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();

    // Wait for data to load and check statistics
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument(); // Total resources
      expect(screen.getByText('8')).toBeInTheDocument(); // Completed resources
    });
  });

  it('displays category breakdown', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DashboardTab />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Programming (6)')).toBeInTheDocument();
      expect(screen.getByText('Machine Learning (4)')).toBeInTheDocument();
      expect(screen.getByText('Cloud Platforms (3)')).toBeInTheDocument();
    });
  });

  it('shows recent activity', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DashboardTab />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Completed Python fundamentals course')).toBeInTheDocument();
      expect(screen.getByText('Started Machine Learning with TensorFlow')).toBeInTheDocument();
    });
  });

  it('displays quick action buttons', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DashboardTab />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Add Resource')).toBeInTheDocument();
      expect(screen.getByText('Plan Timeline')).toBeInTheDocument();
      expect(screen.getByText('View Insights')).toBeInTheDocument();
    });
  });
});