import type React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page';
import { MOCK_PAUSE_DATA } from '../../../lib/constants';

// Mock useRouter from next/navigation
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
  useSearchParams: () => ({
    get: (key: string) => 'today',
  }),
}));

// Mock recharts
vi.mock('recharts', async () => {
    const originalModule = await vi.importActual('recharts');
    return {
        ...originalModule,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
        Pie: () => <div data-testid="pie" />,
        Cell: () => null,
    };
});

describe('PauseAnalysis Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the title, chart, and reason list', () => {
    render(<Page />);

    expect(screen.getByRole('heading', { name: /今日中断分析/i })).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    
    // Check for some reasons from the mock data
    expect(screen.getAllByText('分心').length).toBeGreaterThan(0);
    expect(screen.getAllByText('难题').length).toBeGreaterThan(0);
  });

  it('calls router.back() when back button is clicked', () => {
    render(<Page />);
    
    const backButton = screen.getByRole('button', { name: /arrow_back/i });
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
