import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimerPage from '../page';
import { MOCK_TASKS } from '../../../lib/constants';

// Mock useRouter and useSearchParams from next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('Timer Page', () => {
  const mockTask = MOCK_TASKS[0];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('resume');
    mockSearchParams.delete('remaining');
    
    // Set up localStorage for the component to use
    window.localStorage.setItem('lf_all_tasks', JSON.stringify(MOCK_TASKS));
    window.localStorage.setItem('lf_active_task_id', JSON.stringify(mockTask.id));
    window.localStorage.setItem('lf_sessions', '[]');
  });

  it('renders task name, timer display, and control buttons', async () => {
    render(<TimerPage />);

    // Wait for the component to update based on useEffect
    await screen.findByText(mockTask.name);
    
    expect(screen.getByText(mockTask.name)).toBeInTheDocument();
    
    // Check for the timer display, e.g., "45:00"
    expect(screen.getByText(`${mockTask.duration.toString().padStart(2, '0')}:00`)).toBeInTheDocument();
    
    // Check for Pause button
    expect(screen.getByRole('button', { name: /休息一下/i })).toBeInTheDocument();

    // Check for Finish button
    expect(screen.getByRole('button', { name: /完成任务/i })).toBeInTheDocument();
  });

  it('renders the SVG circular progress bar', async () => {
    render(<TimerPage />);
    await screen.findByText(mockTask.name); // Ensure component is rendered

    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('navigates to pause-reason when the pause button is clicked', async () => {
    render(<TimerPage />);
    await screen.findByText(mockTask.name); // Ensure component is rendered

    const pauseButton = screen.getByRole('button', { name: /休息一下/i });
    
    await act(async () => {
      fireEvent.click(pauseButton);
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/pause-reason'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining(`taskId=${mockTask.id}`));
  });
});
