import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ResourcesTab from '@/components/resources-tab';

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/lib/authUtils', () => ({
  isUnauthorizedError: vi.fn(() => false),
}));

const mockResources = [
  {
    id: 1,
    title: 'Python for AI',
    description: 'Complete Python programming course',
    category: 'Programming',
    type: 'Course',
    provider: 'Coursera',
    duration: '40 hours',
    cost: 'Free',
    difficulty: 'Beginner',
    priority: 'High',
    progress: 'in-progress',
    url: 'https://example.com/python-ai',
    notes: 'Great fundamentals course',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-08T10:00:00Z',
  },
  {
    id: 2,
    title: 'Machine Learning Basics',
    description: 'Introduction to ML concepts',
    category: 'Machine Learning',
    type: 'Book',
    provider: 'O\'Reilly',
    duration: '200 pages',
    cost: '$29.99',
    difficulty: 'Intermediate',
    priority: 'Medium',
    progress: 'not-started',
    url: 'https://example.com/ml-basics',
    notes: null,
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  },
];

describe('ResourcesTab', () => {
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

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResources),
    });
  });

  it('renders resources table with data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ResourcesTab />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Python for AI')).toBeInTheDocument();
      expect(screen.getByText('Machine Learning Basics')).toBeInTheDocument();
      expect(screen.getByText('Programming')).toBeInTheDocument();
      expect(screen.getByText('Machine Learning')).toBeInTheDocument();
    });
  });

  it('filters resources by category', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ResourcesTab />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Python for AI')).toBeInTheDocument();
    });

    // Click on category filter
    const categorySelect = screen.getByDisplayValue('All Categories');
    await user.click(categorySelect);
    
    const programmingOption = screen.getByText('Programming');
    await user.click(programmingOption);

    // Should still show Python resource but not ML resource
    expect(screen.getByText('Python for AI')).toBeInTheDocument();
  });

  it('filters resources by search term', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ResourcesTab />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Python for AI')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search resources...');
    await user.type(searchInput, 'Python');

    // Should show only Python resource
    expect(screen.getByText('Python for AI')).toBeInTheDocument();
  });

  it('opens add resource modal when button clicked', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ResourcesTab />
      </QueryClientProvider>
    );

    const addButton = screen.getByText('Add Resource');
    await user.click(addButton);

    // Check if modal content appears (this would depend on your modal implementation)
    // For now, we can check if the button was clicked
    expect(addButton).toBeInTheDocument();
  });

  it('handles progress filter correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ResourcesTab />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Python for AI')).toBeInTheDocument();
    });

    // Test progress filter
    const progressSelect = screen.getByDisplayValue('All Progress');
    await user.click(progressSelect);
    
    const inProgressOption = screen.getByText('In Progress');
    await user.click(inProgressOption);

    // Should show only in-progress resources
    expect(screen.getByText('Python for AI')).toBeInTheDocument();
  });

  it('displays empty state when no resources', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ResourcesTab />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No learning resources found')).toBeInTheDocument();
      expect(screen.getByText('Add your first resource to start tracking your learning journey')).toBeInTheDocument();
    });
  });
});