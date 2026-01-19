import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PauseReasonPage from '../page';
import type { InterruptionLog } from '../../../lib/models';

// Mock useRouter and useSearchParams from next/navigation
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams('sessionId=test-session&taskId=test-task&remaining=1200');

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('PauseReason Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders the title and reason buttons', () => {
    render(<PauseReasonPage />);
    expect(screen.getByRole('heading', { name: /是什么打断了专注呢？/i })).toBeInTheDocument();
    expect(screen.getByText(/分心走神/i)).toBeInTheDocument();
    expect(screen.getByText(/遇到难题/i)).toBeInTheDocument();
  });

  it('enables the confirm button after a reason is selected', async () => {
    render(<PauseReasonPage />);
    const confirmButton = screen.getByRole('button', { name: /确认暂停/i });
    expect(confirmButton).toBeDisabled();
    
    const reasonButton = screen.getByText(/分心走神/i);
    fireEvent.click(reasonButton);

    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });
  });

  it('navigates back to timer with resume params when cancel is clicked', () => {
    render(<PauseReasonPage />);
    const cancelButton = screen.getByRole('button', { name: /取消/i });
    fireEvent.click(cancelButton);
    expect(mockReplace).toHaveBeenCalledWith('/timer?resume=true&remaining=1200');
  });

  it('saves interruption and navigates back to timer when confirm is clicked', async () => {
    render(<PauseReasonPage />);
    
    const reasonButton = screen.getByText(/分心走神/i);
    fireEvent.click(reasonButton);

    const confirmButton = screen.getByRole('button', { name: /确认暂停/i });
    await waitFor(() => expect(confirmButton).not.toBeDisabled());
    fireEvent.click(confirmButton);
    
    // Check localStorage directly
    const interruptions = JSON.parse(window.localStorage.getItem('lf_interruptions') || '[]') as InterruptionLog[];
    expect(interruptions).toHaveLength(1);
    expect(interruptions[0].reasonId).toBe('distraction');
    expect(interruptions[0].sessionId).toBe('test-session');

    expect(mockReplace).toHaveBeenCalledWith('/timer?resume=true&remaining=1200');
  });
});
