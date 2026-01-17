import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page'; // Assuming page.tsx is in the same directory

// Mock useRouter from next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Login Page', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders input fields and the login button', () => {
    render(<Page />);

    // Check for username/phone input
    const usernameInput = screen.getByPlaceholderText('账号/手机号');
    expect(usernameInput).toBeInTheDocument();

    // Check for password input
    const passwordInput = screen.getByPlaceholderText('密码');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Check for login button
    const loginButton = screen.getByRole('button', { name: /立即登录/i });
    expect(loginButton).toBeInTheDocument();
  });

  it('displays welcome message and tagline', () => {
    render(<Page />);
    expect(screen.getByText('欢迎来到 LearnFlow')).toBeInTheDocument();
    expect(screen.getByText('每天进步一点点')).toBeInTheDocument();
  });

  it('navigates to dashboard on successful login', () => {
    render(<Page />);

    // Simulate typing into inputs (though the component doesn't use the values for simple onLogin)
    fireEvent.change(screen.getByPlaceholderText('账号/手机号'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /立即登录/i }));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});
