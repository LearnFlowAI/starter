import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page';

// Mock useRouter from next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  usePathname: () => '/pause-reason',
}));

describe('PauseReason Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the title and reason buttons', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { name: /是什么打断了专注呢？/i })).toBeInTheDocument();
    expect(screen.getByText(/分心走神/i)).toBeInTheDocument();
    expect(screen.getByText(/遇到难题/i)).toBeInTheDocument();
  });

  it('enables the confirm button after a reason is selected', async () => {
    render(<Page />);
    const confirmButton = screen.getByRole('button', { name: /确认暂停/i });
    const reasonButton = screen.getByText(/分心走神/i);
    fireEvent.click(reasonButton);

    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });
  });

  it('calls router.back() when cancel is clicked', () => {
    render(<Page />);
    const cancelButton = screen.getByRole('button', { name: /取消/i });
    fireEvent.click(cancelButton);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('navigates back to timer when confirm is clicked', async () => {
    render(<Page />);
    
    const reasonButton = screen.getByText(/分心走神/i);
    fireEvent.click(reasonButton);

    const confirmButton = screen.getByRole('button', { name: /确认暂停/i });
    await waitFor(() => expect(confirmButton).not.toBeDisabled());
    fireEvent.click(confirmButton);
    
    expect(mockPush).toHaveBeenCalledWith('/timer');
  });
});
