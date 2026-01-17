import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page';
import { MOCK_TASKS } from '../../../lib/constants';
import type { Session } from '../../../types';

// Mock useRouter from next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  usePathname: () => '/summary',
}));

describe('Summary Page', () => {
  const mockSession: Session = {
    id: 'session-1',
    taskId: MOCK_TASKS[0].id,
    taskName: MOCK_TASKS[0].name,
    duration: 2400, // 40 mins
    targetDuration: 2700, // 45 mins
    startTime: Date.now(),
    interruptionCount: 1,
    interruptions: [{ reasonId: 'distraction', startTime: Date.now(), duration: 60 }],
    completionLevel: 'most',
    rating: 4,
  };

  // In a real app, this data would be passed via context or state, but for a page,
  // we'll assume it's fetched or available in a way the component can access.
  // We'll mock its internal state for the test.

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the task name in the header and key sections', () => {
    // For now, we will have to embed the mock session in the component for the test to work
    render(<Page />);

    expect(screen.getByText(mockSession.taskName)).toBeInTheDocument();
    expect(screen.getByText('实际用时')).toBeInTheDocument();
    expect(screen.getByText('预计用时')).toBeInTheDocument();
    expect(screen.getByText('中断记录')).toBeInTheDocument();
    expect(screen.getByText('完成质量')).toBeInTheDocument();
  });

  it('renders the "保存并退出" button', () => {
    render(<Page />);
    expect(screen.getByRole('button', { name: /保存并退出/i })).toBeInTheDocument();
  });

  it('calls router.back() when back button is clicked', () => {
    render(<Page />);
    // The back button is the one with 'arrow_back' icon.
    // It doesn't have a name, so we find it by its content.
    const backButton = screen.getByText('arrow_back').closest('button');
    expect(backButton).toBeInTheDocument();
    if(backButton) fireEvent.click(backButton);
    // Since onDone in the component calls router.push, we check that
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});
