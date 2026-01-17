import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page';
import { TASK_CONFIG, MOCK_TASKS } from '../../../lib/constants';
import { TaskType, Task } from '../../../types';
import { within } from '@testing-library/react';

const mockPush = vi.fn();
const mockBack = vi.fn();
let mockTaskId: string | null = null;

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  usePathname: () => '/add-task',
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'taskId') return mockTaskId;
      return null;
    },
  }),
}));

describe('AddTask Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTaskId = null; // Reset mock for each test
  });

  const fillTaskName = (name: string) => {
    fireEvent.change(screen.getByPlaceholderText('例如：完成第10页习题'), { target: { value: name } });
  };

  it('renders "添加新任务" title and form elements in add mode', () => {
    render(<Page />);

    expect(screen.getByRole('heading', { name: '添加新任务' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('例如：完成第10页习题')).toBeInTheDocument();
    
    const addButton = screen.getByRole('button', { name: /确认添加/i });
    expect(addButton).toBeDisabled();

    fillTaskName('Test Task');
    expect(addButton).not.toBeDisabled();
    
    expect(screen.getByText('预计时长')).toBeInTheDocument();
    expect(screen.getByText('数学')).toBeInTheDocument(); // Default selected type
  });

  it('renders "编辑任务" title and pre-fills form elements in edit mode', () => {
    mockTaskId = MOCK_TASKS[0].id;
    render(<Page />);

    expect(screen.getByRole('heading', { name: '编辑任务' })).toBeInTheDocument();
    expect(screen.getByDisplayValue(MOCK_TASKS[0].name)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /确认修改/i })).toBeInTheDocument();
  });

  it('updates task type when a type button is clicked', async () => {
    render(<Page />);

    const englishButton = screen.getByText('英语');
    fireEvent.click(englishButton);

    await waitFor(() => {
      expect(englishButton).toHaveClass('text-primary');
      expect(screen.getByText('数学')).not.toHaveClass('text-primary');
    });
  });

  it('updates displayed duration when range input changes', () => {
    render(<Page />);

    const rangeInput = screen.getByRole('slider', { name: '预计时长' });
    fireEvent.change(rangeInput, { target: { value: '80' } });

    const durationDisplay = screen.getByTestId('displayed-duration');
    expect(within(durationDisplay).getByText('80')).toBeInTheDocument();
  });

  it('calls router.back() when cancel button is clicked', () => {
    render(<Page />);
    const cancelButton = screen.getByRole('button', { name: 'close' });
    fireEvent.click(cancelButton);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('calls router.push("/dashboard") when "确认添加" button is clicked', async () => {
    render(<Page />);
    
    const addButton = screen.getByRole('button', { name: /确认添加/i });
    expect(addButton).toBeDisabled();

    fillTaskName('New Task for Submission');

    await waitFor(() => {
      expect(addButton).not.toBeDisabled();
      fireEvent.click(addButton);
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
