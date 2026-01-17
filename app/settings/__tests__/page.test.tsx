import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page';

// Mock useRouter from next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/settings',
}));

describe('Settings Page', () => {
  // Mock localStorage for the component's internal state management
  const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value.toString(); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; }
    };
  })();
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders the "规则配置" title and a default rule card', async () => {
    render(<Page />);

    expect(screen.getByRole('heading', { name: '规则配置' })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('专注奖励')).toBeInTheDocument();
    });
  });

  it('renders the add and help buttons in the header', () => {
    render(<Page />);
    const headerActions = screen.getByTestId('header-actions');
    expect(within(headerActions).getByRole('button', { name: 'help_outline' })).toBeInTheDocument();
    expect(within(headerActions).getByRole('button', { name: 'add' })).toBeInTheDocument();
  });

  it('renders the NavBar component', () => {
    render(<Page />);
    // Check for a button within the real NavBar
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('opens the add rule modal when the add button is clicked', async () => {
    render(<Page />);
    
    const headerActions = screen.getByTestId('header-actions');
    const addButton = within(headerActions).getByRole('button', { name: 'add' });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '自定义新规则' })).toBeInTheDocument();
      // Check for an element within the modal
      expect(screen.getByPlaceholderText('例如：专注先锋')).toBeInTheDocument();
    });
  });
});
