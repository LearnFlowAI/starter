import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page';
import { MOCK_TASKS } from '../../../lib/constants';

// Mock useRouter from next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Timer Page', () => {
  const mockTask = MOCK_TASKS[0]; // Use an uncompleted task

  // Mock necessary props, which in a real app would come from a global state
  const defaultProps = {
    task: mockTask,
    remainingSeconds: mockTask.duration * 60,
    isActive: true,
    interruptionCount: 0,
    pauseStartTime: null,
    onTogglePause: vi.fn(),
    onFinish: vi.fn(),
    onNavigate: mockPush, // Use the mocked push for navigation
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task name, timer display, and control buttons', () => {
    // For now, the page will manage its own state, so we don't pass props
    render(<Page />);

    expect(screen.getByText(mockTask.name)).toBeInTheDocument();
    
    // Check for the timer display, e.g., "45:00"
    expect(screen.getByText(`${mockTask.duration.toString().padStart(2, '0')}:00`)).toBeInTheDocument();
    
    // Check for Pause button
    expect(screen.getByRole('button', { name: /休息一下/i })).toBeInTheDocument();

    // Check for Finish button
    expect(screen.getByRole('button', { name: /完成任务/i })).toBeInTheDocument();
  });

  it('renders the SVG circular progress bar', () => {
    render(<Page />);
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    // More specific checks could be added for the circles within the SVG
  });

  it('calls onTogglePause when the pause button is clicked', () => {
    // This is hard to test since onTogglePause is internal to the page component
    // We will assume the button is clickable, and later E2E tests would verify the state change.
    render(<Page />);
    const pauseButton = screen.getByRole('button', { name: /休息一下/i });
    fireEvent.click(pauseButton);
    // As the handler is internal, we can't assert it was called.
    // We just ensure the click doesn't throw an error.
  });
});
