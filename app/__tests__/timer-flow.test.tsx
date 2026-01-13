import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import RecordPage from "../record/page";
import { defaultTasks } from "../lib/defaults";
import type { InterruptionLog, SessionEntry, Task } from "../lib/models";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("../lib/theme", () => ({
  useTheme: () => ({
    ready: true,
  }),
}));

describe("Record Page Logic", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockClear();
  });

  it("should only display interruptions from the latest session", async () => {
    // 1. Arrange: Manually create a state in localStorage where interruptions
    // exist for both the latest session and a previous one.
    const sessionId = "ses_test_1";
    const taskId = defaultTasks[0].id;
    const now = new Date().toISOString();

    const mockTasks: Task[] = [
      {
        id: taskId,
        title: "Test Task",
        subject: "TDD",
        plannedMinutes: 25,
        status: "doing",
      },
    ];

    // The session that just finished
    const mockSessions: SessionEntry[] = [
      {
        id: sessionId,
        taskId: taskId,
        seconds: 30,
        pauseCount: 1,
        startedAt: now,
        endedAt: now,
      },
    ];

    // One interruption for the latest session, and one for an old one.
    const mockInterruptions: InterruptionLog[] = [
      {
        id: "p1",
        reasonId: "other",
        duration: 10,
        createdAt: now,
        taskId: taskId,
        sessionId: sessionId, // <-- Linked to the latest session
      },
      {
        id: "p2",
        reasonId: "noise",
        duration: 120,
        createdAt: "2025-01-01T10:00:00.000Z",
        taskId: taskId,
        sessionId: "ses_old_1", // <-- Linked to an old session
      },
    ];

    window.localStorage.setItem("lf_sessions", JSON.stringify(mockSessions));
    window.localStorage.setItem(
      "lf_interruptions",
      JSON.stringify(mockInterruptions)
    );
    window.localStorage.setItem("lf_tasks", JSON.stringify(mockTasks));
    // Set scores so the page can render points
    window.localStorage.setItem("lf_scores", JSON.stringify([]));


    // 2. Act: Render the record page
    render(<RecordPage />);

    // 3. Assert: Verify it only shows the interruption from the latest session
    // The heading "中断记录" should be next to a count of "1", not "2".
    const interruptionContainer = await screen.findByText("中断记录");
    const parent = interruptionContainer.parentElement?.parentElement;

    if (!parent) throw new Error("Could not find interruption container");
    
    // Within this container, we expect to find the count "1".
    // This is a more robust way to find the "1" associated with interruptions.
    const interruptionCount = await screen.findByText((content, element) => {
      return parent.contains(element) && content === "1";
    });

    expect(interruptionCount).toBeInTheDocument();
    
    // Also assert that the details of that interruption are shown
    expect(screen.getByText("其他")).toBeInTheDocument(); // "other"
    // And the old interruption reason is not shown
    expect(screen.queryByText("噪音")).not.toBeInTheDocument(); // "noise"
  });
});