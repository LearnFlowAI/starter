import type React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavBar from './NavBar'; // Assuming NavBar.tsx is in the same directory
import type { AppView } from '../../types';

describe('NavBar Component', () => {
  const mockOnNavigate = vi.fn();
  const defaultProps = {
    currentView: 'dashboard' as AppView,
    onNavigate: mockOnNavigate,
  };

  beforeEach(() => {
    mockOnNavigate.mockClear();
  });

  it('renders all navigation buttons and the FAB', () => {
    render(<NavBar {...defaultProps} />);

    // Check for icon buttons
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stats' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Profile' })).toBeInTheDocument();

    // Check for FAB
    expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument();
  });

  it('highlights the current view button', () => {
    render(<NavBar {...defaultProps} currentView="stats" />);
    
    // Default currentView is dashboard, so dashboard should not be highlighted
    const dashboardButton = screen.getByRole('button', { name: 'Dashboard' });
    expect(dashboardButton).not.toHaveClass('text-primary');

    const statsButton = screen.getByRole('button', { name: 'Stats' });
    expect(statsButton).toHaveClass('text-primary');
  });

  it('calls onNavigate with correct view when a button is clicked', () => {
    render(<NavBar {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Stats' }));
    expect(mockOnNavigate).toHaveBeenCalledWith('stats');

    fireEvent.click(screen.getByRole('button', { name: 'Add Task' }));
    expect(mockOnNavigate).toHaveBeenCalledWith('add-task');

    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }));
    expect(mockOnNavigate).toHaveBeenCalledWith('dashboard');
  });
});
