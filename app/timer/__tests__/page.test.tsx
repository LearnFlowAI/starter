import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimerPage from '../page';
import { MOCK_TASKS, TASK_CONFIG } from '../../../lib/constants';

let lastApiKey: string | undefined;
const generateContentMock = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    public models = {
      generateContent: generateContentMock,
    };
    constructor(options: { apiKey?: string }) {
      lastApiKey = options.apiKey;
    }
  },
  Modality: { AUDIO: 'AUDIO' },
}));

// Mock useRouter and useSearchParams from next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('Timer Page', () => {
  const mockTask = MOCK_TASKS[0];

  beforeEach(() => {
    vi.clearAllMocks();
    generateContentMock.mockReset();
    lastApiKey = undefined;
    mockSearchParams.delete('resume');
    mockSearchParams.delete('remaining');
    
    // Set up localStorage for the component to use
    window.localStorage.setItem('lf_all_tasks', JSON.stringify(MOCK_TASKS));
    window.localStorage.setItem('lf_active_task_id', JSON.stringify(mockTask.id));
    window.localStorage.setItem('lf_sessions', '[]');
  });

  it('renders task name, timer display, and control buttons', async () => {
    render(<TimerPage />);

    // Wait for the component to update based on useEffect
    const taskLabel = `${TASK_CONFIG[mockTask.type].label}${mockTask.name}`;
    await screen.findByText(taskLabel);
    
    expect(screen.getByText(taskLabel)).toBeInTheDocument();
    
    // Check for the timer display, e.g., "45:00"
    expect(screen.getByText(`${mockTask.duration.toString().padStart(2, '0')}:00`)).toBeInTheDocument();
    
    // Check for Pause button
    expect(screen.getByRole('button', { name: /暂停/i })).toBeInTheDocument();

    // Check for Finish button
    expect(screen.getByRole('button', { name: /结束/i })).toBeInTheDocument();
  });

  it('renders the SVG circular progress bar', async () => {
    render(<TimerPage />);
    const taskLabel = `${TASK_CONFIG[mockTask.type].label}${mockTask.name}`;
    await screen.findByText(taskLabel); // Ensure component is rendered

    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('does not redirect to dashboard when an active task is in storage', async () => {
    render(<TimerPage />);
    const taskLabel = `${TASK_CONFIG[mockTask.type].label}${mockTask.name}`;
    await screen.findByText(taskLabel);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('renders the current task label with full-width colon', async () => {
    render(<TimerPage />);
    const taskLabel = `${TASK_CONFIG[mockTask.type].label}${mockTask.name}`;
    await screen.findByText(taskLabel);
    expect(screen.getByText('当前任务：')).toBeInTheDocument();
  });

  it('navigates to pause-reason when the pause button is clicked', async () => {
    render(<TimerPage />);
    const taskLabel = `${TASK_CONFIG[mockTask.type].label}${mockTask.name}`;
    await screen.findByText(taskLabel); // Ensure component is rendered

    const pauseButton = screen.getByRole('button', { name: /暂停/i });
    
    await act(async () => {
      fireEvent.click(pauseButton);
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/pause-reason'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining(`taskId=${mockTask.id}`));
  });

  it('uses NEXT_PUBLIC gemini api key when enabling sound', async () => {
    process.env.NEXT_PUBLIC_GEMINI_API_KEY = 'test-key';
    generateContentMock.mockResolvedValue({ candidates: [] });

    render(<TimerPage />);
    const taskLabel = `${TASK_CONFIG[mockTask.type].label}${mockTask.name}`;
    await screen.findByText(taskLabel);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /更多/i }));
    });

    await waitFor(() => {
      expect(generateContentMock).toHaveBeenCalled();
    });
    expect(lastApiKey).toBe('test-key');
  });

  it('uses lightweight production logging when TTS fails', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    generateContentMock.mockRejectedValue(new Error('TTS error'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<TimerPage />);
    const taskLabel = `${TASK_CONFIG[mockTask.type].label}${mockTask.name}`;
    await screen.findByText(taskLabel);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /更多/i }));
    });

    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalled();
    });
    expect(errorSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
    errorSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });
});
