import type React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page';
import { MOCK_STATS_SUMMARY } from '../../../lib/constants';

// Mock useRouter from next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/stats',
}));

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-area-chart">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-pie-chart">{children}</div>
  ),
  Area: () => <div />,
  Pie: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Cell: () => <div />,
}));


describe('Stats Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the "数据统计" title and period selector buttons', () => {
    render(<Page />);

    expect(screen.getByRole('heading', { name: '数据统计' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /今天/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /昨天/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /本周/i })).toBeInTheDocument();
  });

  it('renders the charts and NavBar', () => {
    render(<Page />);
    
    // Check for mocked charts
    expect(screen.getByTestId('mock-area-chart')).toBeInTheDocument();

    // The donut chart is custom, check for its central text
    expect(screen.getByText('总时长')).toBeInTheDocument();
    
    // Check for NavBar
    expect(screen.getByRole('button', { name: 'Stats' })).toBeInTheDocument();
  });

  it('updates the summary when a period button is clicked', async () => {
    render(<Page />);

    // Initially shows Today's summary (which is calculated, not from mock)
    // Let's click "Yesterday"
    const yesterdayButton = screen.getByRole('button', { name: /昨天/i });
    fireEvent.click(yesterdayButton);

    await waitFor(() => {
      const { hours, mins } = MOCK_STATS_SUMMARY.yesterday;
      const donutSummary = screen.getByTestId('donut-chart-summary');
      expect(within(donutSummary).getByText(hours.toString())).toBeInTheDocument();
      expect(within(donutSummary).getByText(mins.toString())).toBeInTheDocument();
    });

    // Click "本周"
    const weekButton = screen.getByRole('button', { name: /本周/i });
    fireEvent.click(weekButton);

    await waitFor(() => {
      const { hours, mins } = MOCK_STATS_SUMMARY.week;
      const donutSummary = screen.getByTestId('donut-chart-summary');
      expect(within(donutSummary).getByText(hours.toString())).toBeInTheDocument();
      expect(within(donutSummary).getByText(mins.toString())).toBeInTheDocument();
    });
  });
});
