import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page';
import NavBar from '../../components/NavBar'; // Import NavBar for mocking

// Mock useRouter from next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  usePathname: () => '/profile',
}));

// Mock the NavBar component since it's a separate unit
vi.mock('../../components/NavBar', () => ({
  __esModule: true,
  default: ({ currentView, onNavigate }: { currentView: string; onNavigate: (view: string) => void }) => (
    <nav data-testid="navbar">
      <button type="button" onClick={() => onNavigate('dashboard')} aria-label="Dashboard">Dashboard</button>
      <button type="button" onClick={() => onNavigate('profile')} aria-label="Profile">Profile</button>
    </nav>
  ),
}));


describe('Profile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main profile view with title, user info, and stats', () => {
    render(<Page />);

    expect(screen.getByRole('heading', { name: '个人中心' })).toBeInTheDocument();
    expect(screen.getByAltText('User Avatar')).toBeInTheDocument();
    expect(screen.getByText('小明')).toBeInTheDocument();
    expect(screen.getByText('总积分')).toBeInTheDocument();
    expect(screen.getByText('专注天数')).toBeInTheDocument();
    expect(screen.getByText('达成勋章')).toBeInTheDocument();
  });

  it('renders the NavBar component', () => {
    render(<Page />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Profile' })).toBeInTheDocument();
  });

  it('switches to edit view when edit button is clicked and returns to main view', async () => {
    render(<Page />);
    
    const editEntryButton = screen.getByRole('button', { name: 'edit' });
    fireEvent.click(editEntryButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '编辑个人信息' })).toBeInTheDocument();
      expect(screen.getByAltText('Avatar')).toBeInTheDocument();
      expect(screen.getByLabelText(/昵称/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('写点什么鼓励自己吧...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '保存修改' })).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: 'arrow_back' });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '个人中心' })).toBeInTheDocument();
    });
  });

  it('switches to points shop view when shop button is clicked and returns to main view', async () => {
    render(<Page />);

    const shopButton = screen.getByRole('button', { name: /积分商店/i });
    fireEvent.click(shopButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '积分商店' })).toBeInTheDocument();
      expect(screen.getByText('专注之光皮肤')).toBeInTheDocument();
      expect(screen.getByText('256')).toBeInTheDocument(); // Points display
    });

    const backButton = screen.getByRole('button', { name: 'arrow_back' });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '个人中心' })).toBeInTheDocument();
    });
  });

  it('switches to share progress view when share button is clicked and returns to main view', async () => {
    render(<Page />);

    const shareButton = screen.getByRole('button', { name: /分享进步/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '分享我的进步' })).toBeInTheDocument();
      expect(screen.getByAltText('User')).toBeInTheDocument();
      expect(screen.getByText('总积分达成')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /保存海报/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /发送给好友/i })).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: 'arrow_back' });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '个人中心' })).toBeInTheDocument();
    });
  });
});
